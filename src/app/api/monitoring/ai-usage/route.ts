import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { redisCache } from '@/lib/cache/redis-client'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'

    // Simular dados de uso de IA (em produção viria do Redis/banco)
    const mockUsageData = {
      totalCalls: 45,
      cachedCalls: 28,
      realCalls: 17,
      cacheHitRate: ((28 / 45) * 100).toFixed(1),
      totalCost: 0.85,
      savedCost: 1.24,
      totalTokens: 12450,
      providers: {
        openai: { calls: 25, cost: 0.52, tokens: 7200 },
        anthropic: { calls: 15, cost: 0.28, tokens: 3800 },
        google: { calls: 5, cost: 0.05, tokens: 1450 }
      },
      hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        calls: Math.floor(Math.random() * 5) + 1,
        cached: Math.floor(Math.random() * 3),
        cost: (Math.random() * 0.1).toFixed(3)
      }))
    }

    // Obter estatísticas reais do cache se disponível
    try {
      const cacheStats = await redisCache.getCacheStats()
      mockUsageData.cachedCalls = cacheStats.aiCacheKeys
    } catch (cacheError) {
      logger.warn('Could not fetch real cache stats, using mock data', 'API:MONITORING')
    }

    const response = {
      success: true,
      data: {
        ...mockUsageData,
        timeframe,
        userId,
        timestamp: new Date().toISOString()
      }
    }

    logger.api('/api/monitoring/ai-usage', 'AI usage stats retrieved', {
      userId,
      timeframe,
      totalCalls: mockUsageData.totalCalls,
      cacheHitRate: mockUsageData.cacheHitRate
    })

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Failed to get AI usage stats', 'API:MONITORING', {
      endpoint: '/api/monitoring/ai-usage',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve AI usage statistics' 
      },
      { status: 500 }
    )
  }
}
