import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const organizationId = session.user.organizationId;

    // Buscar execuções do usuário
    const executions = await prisma.agentExecution.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        agent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Buscar agentes criados
    const agents = await prisma.agent.findMany({
      where: {
        organizationId,
      },
    });

    // Calcular estatísticas
    const totalExecutions = executions.length;
    
    // Calcular tempo economizado (estimativa: 10 minutos por execução manual)
    const executionTimeSaved = Math.round((totalExecutions * 10) / 60); // em horas
    
    const agentsCreated = agents.length;
    
    // Encontrar agente mais usado
    const agentUsageCount: { [key: string]: number } = {};
    executions.forEach((exec) => {
      if (exec.agent?.name) {
        agentUsageCount[exec.agent.name] = (agentUsageCount[exec.agent.name] || 0) + 1;
      }
    });
    
    const mostUsedAgentEntry = Object.entries(agentUsageCount).sort((a, b) => b[1] - a[1])[0];
    const mostUsedAgent = mostUsedAgentEntry ? mostUsedAgentEntry[0] : 'Nenhum';

    return NextResponse.json({
      success: true,
      stats: {
        totalExecutions,
        executionTimeSaved,
        agentsCreated,
        mostUsedAgent,
      },
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
