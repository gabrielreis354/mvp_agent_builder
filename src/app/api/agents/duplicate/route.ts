import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions });
    
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'ID do agente é obrigatório' }, { status: 400 });
    }

    // Buscar o agente original
    const originalAgent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!originalAgent) {
      return NextResponse.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    // Verificar se o agente pertence à mesma organização
    if (originalAgent.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Você não tem permissão para copiar este agente' }, { status: 403 });
    }

    // Criar uma cópia do agente para o usuário atual
    const duplicatedAgent = await prisma.agent.create({
      data: {
        name: `${originalAgent.name} (Cópia)`,
        description: originalAgent.description,
        category: originalAgent.category,
        nodes: originalAgent.nodes as any,
        edges: originalAgent.edges as any,
        inputSchema: originalAgent.inputSchema as any,
        outputSchema: originalAgent.outputSchema as any,
        isPublic: false, // A cópia é privada por padrão
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      agent: duplicatedAgent,
      message: 'Agente copiado com sucesso para "Meus Agentes"',
    });
  } catch (error) {
    console.error('Error duplicating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao duplicar agente' },
      { status: 500 }
    );
  }
}
