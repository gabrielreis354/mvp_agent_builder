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
    
    console.log('🔍 [Share API] Requisição recebida:', { 
      agentId: params.id,
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.email) {
      console.log('❌ [Share API] Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isPublic } = body;
    const agentId = params.id;
    
    console.log('📋 [Share API] Dados:', { agentId, isPublic, body });

    // Buscar agente
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true }
    });

    console.log('🔎 [Share API] Agente encontrado:', { 
      found: !!agent, 
      agentName: agent?.name,
      currentIsPublic: agent?.isPublic,
      ownerEmail: agent?.user?.email
    });

    if (!agent) {
      console.log('❌ [Share API] Agente não encontrado');
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono do agente
    if (agent.user.email !== session.user.email) {
      console.log('❌ [Share API] Usuário não é o dono:', {
        agentOwner: agent.user.email,
        currentUser: session.user.email
      });
      return NextResponse.json(
        { error: 'Você não tem permissão para modificar este agente' },
        { status: 403 }
      );
    }

    // Atualizar visibilidade
    console.log(`🔄 [Share API] Atualizando visibilidade: ${agent.isPublic} → ${isPublic}`);
    
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { isPublic }
    });

    console.log(`✅ ${isPublic ? '🌍' : '🔒'} Agente "${agent.name}" agora é ${isPublic ? 'público' : 'privado'} na organização`);

    return NextResponse.json({
      success: true,
      message: isPublic 
        ? 'Agente compartilhado com a organização' 
        : 'Agente agora é privado',
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        isPublic: updatedAgent.isPublic
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar visibilidade do agente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar agente' },
      { status: 500 }
    );
  }
}
