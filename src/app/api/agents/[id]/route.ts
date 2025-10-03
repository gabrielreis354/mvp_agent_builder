import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 })
    }

    const agent = await prisma.agent.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        nodes: agent.nodes,
        edges: agent.edges,
        metadata: agent.metadata,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar agente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, nodes, edges, metadata } = body
    
    // Primeiro, verifique se o agente pertence à organização
    const agent = await prisma.agent.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    const updatedAgent = await prisma.agent.update({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      data: {
        name,
        description,
        nodes,
        edges,
        metadata,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      agent: updatedAgent
    })
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar agente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 })
    }

    // Use deleteMany para garantir que a exclusão só ocorra se a organização corresponder
    const deleteResult = await prisma.agent.deleteMany({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado ou acesso negado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agente excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir agente' },
      { status: 500 }
    )
  }
}
