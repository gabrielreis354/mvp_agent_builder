import { NextRequest, NextResponse } from 'next/server'
import { redisCache } from '@/lib/cache/redis-client'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    // Obter estatísticas do cache Redis
    const stats = await redisCache.getCacheStats()
    
    // Calcular métricas adicionais
    const cacheEfficiency = stats.aiCacheKeys > 0 ? 
      ((stats.aiCacheKeys / (stats.aiCacheKeys + stats.rateLimitKeys)) * 100).toFixed(1) : '0'
    
    const response = {
      success: true,
      data: {
        ...stats,
        cacheEfficiency: `${cacheEfficiency}%`,
        status: stats.totalKeys > 0 ? 'active' : 'inactive',
        timestamp: new Date().toISOString()
      }
    }

    logger.api('/api/monitoring/cache-stats', 'Cache stats retrieved', {
      totalKeys: stats.totalKeys,
      aiCacheKeys: stats.aiCacheKeys,
      memoryUsage: stats.memoryUsage
    })

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Failed to get cache stats', 'API:MONITORING', {
      endpoint: '/api/monitoring/cache-stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve cache statistics',
        data: {
          totalKeys: 0,
          aiCacheKeys: 0,
          rateLimitKeys: 0,
          memoryUsage: 'unknown',
          cacheEfficiency: '0%',
          status: 'error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}
