import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { isPublic } = await request.json();
    const agentId = params.id;

    // Buscar agente
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono do agente
    if (agent.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Você não tem permissão para modificar este agente' },
        { status: 403 }
      );
    }

    // Atualizar visibilidade
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { isPublic }
    });

    console.log(`${isPublic ? '🌍' : '🔒'} Agente "${agent.name}" agora é ${isPublic ? 'público' : 'privado'} na organização`);

    return NextResponse.json({
      success: true,
      message: isPublic 
        ? 'Agente compartilhado com a organização' 
        : 'Agente agora é privado',
      agent: updatedAgent
    });

  } catch (error) {
    console.error('Erro ao atualizar visibilidade do agente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar agente' },
      { status: 500 }
    );
  }
}
