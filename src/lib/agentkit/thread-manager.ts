/**
 * ThreadManager - Gerenciamento de Threads de Conversação
 * 
 * Responsável por criar, recuperar e gerenciar threads de conversação
 * entre usuários e agentes conversacionais.
 */

import { prisma } from '@/lib/database/prisma'
import { Thread, ChatMessage } from './types'

export class ThreadManager {
  /**
   * Cria um novo thread de conversação
   */
  async createThread(
    userId: string,
    agentId: string,
    initialMessage?: string
  ): Promise<Thread> {
    const thread = await prisma.agentThread.create({
      data: {
        userId,
        agentId,
        title: initialMessage?.substring(0, 50) || 'Nova conversa',
        status: 'ACTIVE',
      },
      include: {
        messages: true,
      },
    })

    return this.mapToThread(thread)
  }

  /**
   * Adiciona mensagem ao thread
   */
  async addMessage(
    threadId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    const message = await prisma.threadMessage.create({
      data: {
        threadId,
        role: role.toUpperCase() as any,
        content,
        metadata,
      },
    })

    // Atualizar updatedAt do thread
    await prisma.agentThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    })

    return this.mapToMessage(message)
  }

  /**
   * Busca thread por ID com validação de segurança
   */
  async getThread(threadId: string, userId: string): Promise<Thread | null> {
    const thread = await prisma.agentThread.findFirst({
      where: {
        id: threadId,
        userId, // Segurança: apenas threads do usuário
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return thread ? this.mapToThread(thread) : null
  }

  /**
   * Lista threads do usuário
   */
  async listThreads(
    userId: string,
    agentId?: string,
    limit: number = 20
  ): Promise<Thread[]> {
    const threads = await prisma.agentThread.findMany({
      where: {
        userId,
        ...(agentId && { agentId }),
        status: 'ACTIVE',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Últimas 10 mensagens para preview
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    return threads.map(this.mapToThread)
  }

  /**
   * Arquiva thread
   */
  async archiveThread(threadId: string, userId: string): Promise<void> {
    await prisma.agentThread.updateMany({
      where: {
        id: threadId,
        userId, // Segurança
      },
      data: {
        status: 'ARCHIVED',
      },
    })
  }

  /**
   * Deleta thread (LGPD)
   */
  async deleteThread(threadId: string, userId: string): Promise<void> {
    await prisma.agentThread.deleteMany({
      where: {
        id: threadId,
        userId, // Segurança
      },
    })
  }

  /**
   * Atualiza título do thread
   */
  async updateThreadTitle(
    threadId: string,
    userId: string,
    title: string
  ): Promise<void> {
    await prisma.agentThread.updateMany({
      where: {
        id: threadId,
        userId,
      },
      data: {
        title: title.substring(0, 100),
      },
    })
  }

  /**
   * Conta mensagens no thread
   */
  async getMessageCount(threadId: string): Promise<number> {
    return await prisma.threadMessage.count({
      where: { threadId },
    })
  }

  /**
   * Mapeia Prisma model para tipo interno
   */
  private mapToThread(thread: any): Thread {
    return {
      id: thread.id,
      userId: thread.userId,
      agentId: thread.agentId,
      title: thread.title,
      status: thread.status.toLowerCase(),
      messages: thread.messages?.map(this.mapToMessage) || [],
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }
  }

  /**
   * Mapeia mensagem do Prisma para tipo interno
   */
  private mapToMessage(message: any): ChatMessage {
    return {
      id: message.id,
      role: message.role.toLowerCase(),
      content: message.content,
      createdAt: message.createdAt,
      metadata: message.metadata,
    }
  }
}
