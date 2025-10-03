import { prisma } from '../prisma';
import { Agent, AgentExecution, Prisma } from '@prisma/client';
import { AgentNode, AgentEdge } from '@/types/agent';

export interface CreateAgentData {
  name: string;
  description?: string;
  category?: string;
  version?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  nodes: AgentNode[];
  edges: AgentEdge[];
  inputSchema?: any;
  outputSchema?: any;
  metadata?: any;
  userId: string;
  organizationId: string; // Multi-tenancy
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  category?: string;
  version?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  nodes?: AgentNode[];
  edges?: AgentEdge[];
  inputSchema?: any;
  outputSchema?: any;
  metadata?: any;
}

export interface AgentFilters {
  organizationId?: string; // Multi-tenancy
  userId?: string;
  category?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  search?: string;
}

export class AgentRepository {
  async create(data: CreateAgentData): Promise<Agent> {
    return prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category || 'general',
        version: data.version || '1.0.0',
        isPublic: data.isPublic || false,
        isTemplate: data.isTemplate || false,
        tags: data.tags || [],
        nodes: data.nodes as unknown as Prisma.JsonArray,
        edges: data.edges as unknown as Prisma.JsonArray,
        inputSchema: data.inputSchema as Prisma.JsonObject,
        outputSchema: data.outputSchema as Prisma.JsonObject,
        metadata: data.metadata as Prisma.JsonObject,
        userId: data.userId,
        organizationId: data.organizationId, // Multi-tenancy
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string, organizationId: string): Promise<Agent | null> {
    const whereClause: Prisma.AgentWhereInput = {
      id,
      organizationId
    };

    return prisma.agent.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
    });
  }

  async findMany(
    filters: AgentFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ agents: Agent[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const whereClause: Prisma.AgentWhereInput = {
      ...(filters.organizationId && { organizationId: filters.organizationId }), // Multi-tenancy
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate }),
      ...(filters.tags && filters.tags.length > 0 && {
        tags: {
          hasSome: filters.tags,
        },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { tags: { hasSome: [filters.search] } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              executions: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.agent.count({ where: whereClause }),
    ]);

    return {
      agents,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateAgentData, organizationId: string): Promise<Agent | null> {
    // First check if agent belongs to the organization
    const existingAgent = await prisma.agent.findFirst({ where: { id, organizationId } });
    if (!existingAgent) {
      return null;
    }

    return prisma.agent.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.version && { version: data.version }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
        ...(data.tags && { tags: data.tags }),
        ...(data.nodes && { nodes: data.nodes as unknown as Prisma.JsonArray }),
        ...(data.edges && { edges: data.edges as unknown as Prisma.JsonArray }),
        ...(data.inputSchema && { inputSchema: data.inputSchema as Prisma.JsonObject }),
        ...(data.outputSchema && { outputSchema: data.outputSchema as Prisma.JsonObject }),
        ...(data.metadata && { metadata: data.metadata as Prisma.JsonObject }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    try {
      const deleted = await prisma.agent.deleteMany({
        where: {
          id,
          organizationId,
        },
      });
      return deleted.count > 0;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  async duplicate(id: string, userId: string, organizationId: string, newName?: string): Promise<Agent | null> {
    const originalAgent = await this.findById(id, organizationId);
    if (!originalAgent) {
      return null;
    }

    return this.create({
      name: newName || `${originalAgent.name} (Copy)`,
      description: originalAgent.description || undefined,
      category: originalAgent.category,
      tags: originalAgent.tags,
      nodes: originalAgent.nodes as unknown as AgentNode[],
      edges: originalAgent.edges as unknown as AgentEdge[],
      inputSchema: originalAgent.inputSchema,
      outputSchema: originalAgent.outputSchema,
      metadata: originalAgent.metadata,
      userId,
      organizationId,
    });
  }

  async getPopularAgents(limit: number = 10): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: {
        executions: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  async getRecentAgents(organizationId: string, limit: number = 10): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });
  }

  async getAgentStats(agentId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgExecutionTime: number;
    totalTokensUsed: number;
    totalCost: number;
  }> {
    const stats = await prisma.agentExecution.aggregate({
      where: {
        agentId,
        status: {
          in: ['COMPLETED', 'FAILED'],
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        executionTime: true,
      },
      _sum: {
        tokensUsed: true,
        cost: true,
      },
    });

    const successfulExecutions = await prisma.agentExecution.count({
      where: {
        agentId,
        status: 'COMPLETED',
      },
    });

    const failedExecutions = await prisma.agentExecution.count({
      where: {
        agentId,
        status: 'FAILED',
      },
    });

    return {
      totalExecutions: stats._count.id,
      successfulExecutions,
      failedExecutions,
      avgExecutionTime: stats._avg.executionTime || 0,
      totalTokensUsed: stats._sum.tokensUsed || 0,
      totalCost: stats._sum.cost || 0,
    };
  }
}

export const agentRepository = new AgentRepository();
