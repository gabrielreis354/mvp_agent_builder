import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const agents = await prisma.agent.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(`📋 API /agents/saved: ${agents.length} agentes criados encontrados para o usuário ${userId}`);

    return NextResponse.json({
      agents: agents,
      total: agents.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      source: 'user_saved_agents'
    });

  } catch (error) {
    console.error('❌ Erro ao listar agentes salvos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

