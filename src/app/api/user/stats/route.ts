import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { reportService } from '@/lib/services/report-service-simple'

export async function GET(request: Request) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions })
    
    // @ts-ignore
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Invalidar TODOS os caches do usuário para garantir dados atualizados
    const { getRedisClient } = await import('@/lib/redis')
    const redis = getRedisClient()
    
    // Limpar todos os caches relacionados
    // @ts-ignore
    const organizationId = session.user.organizationId;

    const cacheKeys = [
      `stats:org:${organizationId}`,
      `stats:counters:${organizationId}`,
      `stats:activity:${organizationId}`,
      `org:${organizationId}:agents`
    ];
    
    for (const key of cacheKeys) {
      await redis.del(key)
    }
    
    console.log(`🗑️ Todos os caches invalidados para organização ${organizationId}`)
    
    // Buscar contagem real de agentes do usuário usando a mesma lógica
    let agentCount = 0
    try {
      // Buscar relatórios e extrair agentes únicos
      const reports = await reportService.getUserReports(organizationId, 1000);
      
      if (reports.length > 0) {
        console.log(`🔍 Debug: ${reports.length} relatórios encontrados`)
        
        // Log detalhado de cada relatório
        reports.forEach((report: any, index: number) => {
          console.log(`📄 Relatório ${index + 1}:`, {
            agentId: report.agentId,
            agentName: report.agentName,
            type: report.type,
            timestamp: report.timestamp
          })
        })
        
        // Extrair agentes únicos dos relatórios
        const uniqueAgents = new Map()
        const agentIds = new Set()
        
        reports.forEach((report: any) => {
          const agentKey = report.agentId || report.agentName || 'unknown'
          agentIds.add(agentKey)
          
          if (!uniqueAgents.has(agentKey)) {
            uniqueAgents.set(agentKey, {
              id: report.agentId || report.agentName,
              name: report.agentName || 'Nome não encontrado',
              type: report.type || 'Tipo não encontrado',
              timestamp: report.timestamp
            })
            console.log(`➕ Novo agente adicionado: ${report.agentName || agentKey}`)
          }
        })
        
        agentCount = uniqueAgents.size;
        console.log(`📊 Encontrados ${agentCount} agentes únicos para organização ${organizationId}`);
        console.log(`🔑 AgentIds únicos: [${Array.from(agentIds).join(', ')}]`)
        console.log(`📋 Agentes: ${Array.from(uniqueAgents.values()).map(a => a.name).join(', ')}`)
      } else {
        console.log(`⚠️ Nenhum relatório encontrado para organização ${organizationId}`);
      }
    } catch (error) {
      console.log('Erro ao buscar agentes via relatórios:', error)
      agentCount = 0
    }
    
    const stats = await reportService.getUserStats(organizationId); // Skip cache
    
    // Sobrescrever a contagem de agentes com o valor real do banco
    stats.agentsUsed = agentCount;
    
    console.log(`📊 Stats para organização ${organizationId}:`, {
      totalReports: stats.totalReports,
      agentsUsed: agentCount,
      successRate: stats.successRate
    })
    
    return NextResponse.json({
      success: true,
      stats
    })
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
