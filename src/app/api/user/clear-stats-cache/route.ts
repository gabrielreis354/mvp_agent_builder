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
    
    // Limpar cache de estatísticas do usuário
    const redis = getRedisClient()
    const statsKey = `stats:user:${session.user.id}`
    await redis.del(statsKey)
    
    console.log(`🗑️ Cache de estatísticas limpo para usuário ${session.user.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Cache de estatísticas limpo com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
      { status: 500 }
    )
  }
}
