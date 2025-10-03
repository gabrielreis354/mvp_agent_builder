import { prisma } from '../prisma';
import { AgentExecution, ExecutionStatus, Prisma } from '@prisma/client';

export interface CreateExecutionData {
  executionId: string;
  agentId: string;
  userId: string;
  organizationId: string; // Multi-tenancy
  inputData: any;
  priority?: number;
  jobId?: string;
  metadata?: any;
}

export interface UpdateExecutionData {
  status?: ExecutionStatus;
  outputData?: any;
  errorMessage?: string;
  executionTime?: number;
  tokensUsed?: number;
  cost?: number;
  jobId?: string;
  queuedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs?: string[];
  metadata?: any;
}

export interface ExecutionFilters {
  userId?: string;
  agentId?: string;
  organizationId?: string; // Multi-tenancy
  status?: ExecutionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export class ExecutionRepository {
  async create(data: CreateExecutionData): Promise<AgentExecution> {
    return prisma.agentExecution.create({
      data: {
        executionId: data.executionId,
        agentId: data.agentId,
        userId: data.userId,
        organizationId: data.organizationId, // Multi-tenancy
        inputData: data.inputData as Prisma.JsonObject,
        priority: data.priority || 0,
        jobId: data.jobId,
        metadata: data.metadata as Prisma.JsonObject,
        status: 'PENDING',
      },
      include: {
        agent: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findById(id: string, organizationId: string): Promise<AgentExecution | null> {
    return prisma.agentExecution.findFirst({
      where: { id, organizationId },
      include: {
        agent: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByExecutionId(executionId: string, organizationId: string): Promise<AgentExecution | null> {
    return prisma.agentExecution.findFirst({
      where: { executionId, organizationId },
      include: {
        agent: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByJobId(jobId: string, organizationId: string): Promise<AgentExecution | null> {
    return prisma.agentExecution.findFirst({
      where: { jobId, organizationId },
      include: {
        agent: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findMany(
    filters: ExecutionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ executions: AgentExecution[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const whereClause: Prisma.AgentExecutionWhereInput = {
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.agentId && { agentId: filters.agentId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.dateFrom && filters.dateTo && {
        createdAt: { gte: filters.dateFrom, lte: filters.dateTo },
      }),
    };

    const [executions, total] = await Promise.all([
      prisma.agentExecution.findMany({
        where: whereClause,
        include: {
          agent: { select: { id: true, name: true, category: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agentExecution.count({ where: whereClause }),
    ]);

    return {
      executions,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, organizationId: string, data: UpdateExecutionData): Promise<AgentExecution | null> {
    try {
      const execution = await prisma.agentExecution.findFirst({ where: { id, organizationId } });
      if (!execution) return null;

      return await prisma.agentExecution.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.outputData && { outputData: data.outputData as Prisma.JsonObject }),
          ...(data.errorMessage !== undefined && { errorMessage: data.errorMessage }),
          ...(data.executionTime !== undefined && { executionTime: data.executionTime }),
          ...(data.tokensUsed !== undefined && { tokensUsed: data.tokensUsed }),
          ...(data.cost !== undefined && { cost: data.cost }),
          ...(data.jobId && { jobId: data.jobId }),
          ...(data.queuedAt && { queuedAt: data.queuedAt }),
          ...(data.startedAt && { startedAt: data.startedAt }),
          ...(data.completedAt && { completedAt: data.completedAt }),
          ...(data.logs && { logs: data.logs }),
          ...(data.metadata && { metadata: data.metadata as Prisma.JsonObject }),
        },
        include: {
          agent: { select: { id: true, name: true, category: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error) {
      console.error('Error updating execution:', error);
      return null;
    }
  }

  async updateByExecutionId(executionId: string, organizationId: string, data: UpdateExecutionData): Promise<AgentExecution | null> {
    try {
      const execution = await prisma.agentExecution.findFirst({ where: { executionId, organizationId } });
      if (!execution) return null;

      return await prisma.agentExecution.update({
        where: { executionId },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.outputData && { outputData: data.outputData as Prisma.JsonObject }),
          ...(data.errorMessage !== undefined && { errorMessage: data.errorMessage }),
          ...(data.executionTime !== undefined && { executionTime: data.executionTime }),
          ...(data.tokensUsed !== undefined && { tokensUsed: data.tokensUsed }),
          ...(data.cost !== undefined && { cost: data.cost }),
          ...(data.jobId && { jobId: data.jobId }),
          ...(data.queuedAt && { queuedAt: data.queuedAt }),
          ...(data.startedAt && { startedAt: data.startedAt }),
          ...(data.completedAt && { completedAt: data.completedAt }),
          ...(data.logs && { logs: data.logs }),
          ...(data.metadata && { metadata: data.metadata as Prisma.JsonObject }),
        },
        include: {
          agent: { select: { id: true, name: true, category: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error) {
      console.error('Error updating execution by executionId:', error);
      return null;
    }
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    try {
      const result = await prisma.agentExecution.deleteMany({
        where: { id, organizationId },
      });
      return result.count > 0;
    } catch (error) {
      console.error('Error deleting execution:', error);
      return false;
    }
  }

  async getExecutionStats(organizationId: string): Promise<{
    totalExecutions: number;
    pendingExecutions: number;
    runningExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    avgExecutionTime: number;
    totalTokensUsed: number;
    totalCost: number;
  }> {
    const whereClause = { organizationId };

    const [totalStats, statusCounts] = await Promise.all([
      prisma.agentExecution.aggregate({
        where: whereClause,
        _count: { id: true },
        _avg: { executionTime: true },
        _sum: { tokensUsed: true, cost: true },
      }),
      prisma.agentExecution.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<ExecutionStatus, number>);

    return {
      totalExecutions: totalStats._count.id,
      pendingExecutions: statusMap.PENDING || 0,
      runningExecutions: (statusMap.QUEUED || 0) + (statusMap.RUNNING || 0),
      completedExecutions: statusMap.COMPLETED || 0,
      failedExecutions: statusMap.FAILED || 0,
      avgExecutionTime: totalStats._avg.executionTime || 0,
      totalTokensUsed: totalStats._sum.tokensUsed || 0,
      totalCost: totalStats._sum.cost || 0,
    };
  }

  async getRecentExecutions(organizationId: string, limit: number = 10): Promise<AgentExecution[]> {
    return prisma.agentExecution.findMany({
      where: { organizationId },
      include: {
        agent: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getExecutionsByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AgentExecution[]> {
    return prisma.agentExecution.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        agent: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cleanupOldExecutions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.agentExecution.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
      },
    });

    return result.count;
  }
}

export const executionRepository = new ExecutionRepository();
