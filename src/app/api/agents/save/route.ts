/**
 * API para salvar workflows/agentes customizados
 * Usa o modelo Workflow do Prisma existente
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions })
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      templateId,
      configuration,
      workspaceId = 'default-workspace', // Placeholder
    } = body

    if (!name || !configuration) {
      return NextResponse.json(
        { error: 'Nome e configuração do agente são obrigatórios' },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description: description || '',
        category: 'custom',
        version: '1.0.0',
        isPublic: false,
        isTemplate: false,
        tags: templateId ? [templateId] : ['custom'],
        metadata: {
          templateId,
          createdFrom: 'builder',
          workspaceId,
        },
        nodes: configuration?.nodes || [],
        edges: configuration?.edges || [],
        userId: session.user.id,
        organizationId: session.user.organizationId, // Multi-tenancy
        inputSchema: configuration?.inputSchema || {},
        outputSchema: configuration?.outputSchema || {},
      },
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        templateId: templateId,
        configuration: {
          nodes: agent.nodes,
          edges: agent.edges,
          inputSchema: agent.inputSchema,
          outputSchema: agent.outputSchema,
        },
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        executions: 0, // Default value
        status: 'active', // Default value
      },
      message: 'Agente salvo com sucesso!',
    })
  } catch (error) {
    console.error('Error saving agent:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Erro ao salvar agente',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions });
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    // 🎯 ROTA 1: Buscar um agente específico por ID
    if (agentId) {
      console.log(`🔍 Buscando agente específico com ID: ${agentId} para organização: ${session.user.organizationId}`);
      const agent = await prisma.agent.findFirst({
        where: { 
          id: agentId,
          organizationId: session.user.organizationId // Multi-tenancy check
        },
      });

      if (!agent) {
        return NextResponse.json({ success: false, error: 'Agente não encontrado' }, { status: 404 });
      }


      return NextResponse.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          templateId: (agent.metadata as any)?.templateId || 'custom',
          nodes: agent.nodes,
          edges: agent.edges,
          // Adicione outros campos necessários pelo frontend
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          isFavorite: (agent.metadata as any)?.isFavorite || false,
        },
      });
    }

    // 🎯 ROTA 2: Listar todos os agentes do usuário (comportamento original)
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where: { organizationId: session.user.organizationId }, // Multi-tenancy
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.agent.count({ where: { organizationId: session.user.organizationId } }), // Multi-tenancy
    ]);

    const formattedAgents = agents.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      templateId: (agent.metadata as any)?.templateId || 'custom',
      // Não enviar a configuração completa na listagem para economizar banda
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      executions: 0, // Placeholder
      lastExecuted: null, // Placeholder
      isFavorite: (agent.metadata as any)?.isFavorite || false,
    }));

    return NextResponse.json({
      success: true,
      agents: formattedAgents,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Erro ao buscar agentes' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await getServerSession({ req: request as any, ...authOptions });
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, name, description, configuration, isFavorite } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agente é obrigatório' },
        { status: 400 }
      )
    }

    // Verify ownership before updating
    const existingAgent = await prisma.agent.findFirst({
      where: { id, organizationId: session.user.organizationId },
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agente não encontrado ou acesso negado' }, { status: 404 });
    }

    // Atualizar agente
    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(configuration && { 
          nodes: configuration.nodes,
          edges: configuration.edges 
        }),
        ...(isFavorite !== undefined && { 
          metadata: { 
            isFavorite,
            templateId: ((await prisma.agent.findUnique({ where: { id } }))?.metadata as any)?.templateId || 'custom',
            createdFrom: 'builder'
          }
        }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        templateId: agent.tags[0] || 'custom',
        configuration: { nodes: agent.nodes, edges: agent.edges },
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        isFavorite: (agent.metadata as any)?.isFavorite || false
      },
      message: 'Agente atualizado com sucesso!'
    })

  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agente' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions });
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agente é obrigatório' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const agent = await prisma.agent.findFirst({
      where: { 
        id,
        organizationId: session.user.organizationId 
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    // Excluir agente
    await prisma.agent.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Agente excluído com sucesso!'
    })

  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir agente' },
      { status: 500 }
    )
  }
}
