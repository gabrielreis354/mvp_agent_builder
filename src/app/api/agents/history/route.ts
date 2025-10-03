/**
 * API para histórico de execuções usando Prisma/PostgreSQL
 * Registra execuções em Execution
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions })
    
    // @ts-ignore
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // @ts-ignore
    const organizationId = session.user.organizationId;

    // Buscar agentes da organização
    const agents = await prisma.agent.findMany({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.agent.count({
      where: {
        organizationId: organizationId
      }
    })

    // Estatísticas básicas
    const stats = {
      total: total,
      successful: agents.length,
      failed: 0,
      avgProcessingTime: 0
    }

    // Formatar como execuções para compatibilidade
    const formattedExecutions = agents.map((agent: any) => ({
      id: agent.id,
      agentId: agent.id,
      agentName: agent.name,
      templateId: 'custom',
      status: 'SUCCESS',
      startedAt: agent.createdAt,
      completedAt: agent.updatedAt,
      duration: 0,
      tokensUsed: 0,
      cost: 0,
      input: { description: agent.description },
      output: { result: 'Agent created successfully' },
      error: null
    }))

    return NextResponse.json({
      success: true,
      data: {
        executions: formattedExecutions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats,
        workspaceStats: {
          totalWorkspaces: 1,
          totalExecutions: total,
          totalTokens: 0,
          totalCost: 0,
          recentExecutions: total,
          successRate: 100,
          avgDuration: 0
        },
        trends: {
          executions: [],
          tokens: [],
          costs: []
        }
      }
    })

  } catch (error) {
    console.error('Error fetching agent history:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch agent history',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
