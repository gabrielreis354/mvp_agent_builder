import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { getRedisClient } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Limpar todos os caches relacionados ao usuário
    const redis = getRedisClient()
    const userId = session.user.id
    
    const cacheKeys = [
      `stats:user:${userId}`,
      `stats:counters:${userId}`,
      `stats:activity:${userId}`
    ]
    
    for (const key of cacheKeys) {
      await redis.del(key)
    }
    
    console.log(`🔄 Cache de estatísticas completamente limpo para usuário ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Cache de estatísticas limpo com sucesso',
      clearedKeys: cacheKeys.length
    })
    
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
      { status: 500 }
    )
  }
}
