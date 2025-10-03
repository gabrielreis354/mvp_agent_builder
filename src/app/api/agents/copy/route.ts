import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userId = session?.user?.id;
  // @ts-ignore
  const organizationId = session?.user?.organizationId;

  if (!userId || !organizationId) {
    return NextResponse.json({ error: 'Usuário não autorizado.' }, { status: 401 });
  }

  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'ID do agente é obrigatório.' }, { status: 400 });
    }

    const agentToCopy = await prisma.agent.findFirst({
      where: {
        id: agentId,
        organizationId: organizationId, // Garante que o agente a ser copiado pertence à mesma organização
      },
    });

    if (!agentToCopy) {
      return NextResponse.json({ error: 'Agente não encontrado ou não pertence à sua organização.' }, { status: 404 });
    }

    const { id, createdAt, updatedAt, ...restOfAgent } = agentToCopy;

    const newAgent = await prisma.agent.create({
      data: {
        ...restOfAgent,
        name: `${agentToCopy.name} (Cópia)`,
        userId: userId,
        // Garante que todos os campos JSON sejam tratados corretamente
        metadata: agentToCopy.metadata === null ? Prisma.JsonNull : agentToCopy.metadata,
        inputSchema: agentToCopy.inputSchema === null ? Prisma.JsonNull : agentToCopy.inputSchema,
        outputSchema: agentToCopy.outputSchema === null ? Prisma.JsonNull : agentToCopy.outputSchema,
        nodes: agentToCopy.nodes === null ? Prisma.JsonNull : agentToCopy.nodes,
        edges: agentToCopy.edges === null ? Prisma.JsonNull : agentToCopy.edges,
      },
    });

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error) {
    console.error('Falha ao copiar agente:', error);
    return NextResponse.json({ error: 'Erro interno ao copiar o agente.' }, { status: 500 });
  }
}
