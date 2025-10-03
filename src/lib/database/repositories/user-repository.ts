import { prisma } from '../prisma';
import { User, UserRole, Prisma } from '@prisma/client';

export interface CreateUserData {
  email: string;
  organizationId: string; // Multi-tenancy
  name?: string;
  image?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  image?: string;
  role?: UserRole;
}

export interface UserFilters {
  organizationId?: string; // Multi-tenancy
  role?: UserRole;
  search?: string;
}

export class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        role: data.role || 'USER',
        organizationId: data.organizationId, // Multi-tenancy
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            agents: true,
            executions: true,
            apiKeys: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            agents: true,
            executions: true,
            apiKeys: true,
          },
        },
      },
    });
  }

  async findMany(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const whereClause: Prisma.UserWhereInput = {
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(filters.role && { role: filters.role }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              agents: true,
              executions: true,
              apiKeys: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.image !== undefined && { image: data.image }),
          ...(data.role && { role: data.role }),
        },
        include: {
          _count: {
            select: {
              agents: true,
              executions: true,
              apiKeys: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async findOrCreate(email: string, organizationId: string, userData: Partial<CreateUserData> = {}): Promise<User> {
    const existingUser = await this.findByEmail(email);
    
    if (existingUser) {
      return existingUser;
    }

    return this.create({
      organizationId,
      email,
      name: userData.name,
      image: userData.image,
      role: userData.role,
    });
  }

  async getUserStats(userId: string, organizationId: string): Promise<{
    totalAgents: number;
    publicAgents: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalTokensUsed: number;
    totalCost: number;
  }> {
    const [
      agentStats,
      executionStats,
      successfulExecutions,
      failedExecutions,
    ] = await Promise.all([
      prisma.agent.aggregate({
        where: { userId },
        _count: { id: true },
      }),
      prisma.agentExecution.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { tokensUsed: true, cost: true },
      }),
      prisma.agentExecution.count({
        where: { userId, status: 'COMPLETED' },
      }),
      prisma.agentExecution.count({
        where: { userId, status: 'FAILED' },
      }),
    ]);

    const publicAgents = await prisma.agent.count({
      where: { userId, isPublic: true },
    });

    return {
      totalAgents: agentStats._count.id,
      publicAgents,
      totalExecutions: executionStats._count.id,
      successfulExecutions,
      failedExecutions,
      totalTokensUsed: executionStats._sum.tokensUsed || 0,
      totalCost: executionStats._sum.cost || 0,
    };
  }

  async getActiveUsers(daysBack: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return prisma.user.findMany({
      where: {
        executions: {
          some: {
            createdAt: {
              gte: cutoffDate,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            agents: true,
            executions: {
              where: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        executions: {
          _count: 'desc',
        },
      },
    });
  }

  async updateLastActivity(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
