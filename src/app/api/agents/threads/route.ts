/**
 * API Endpoint - Gerenciamento de Threads
 * GET /api/agents/threads - Lista threads do usuário
 * DELETE /api/agents/threads?threadId=xxx - Deleta thread
 * PATCH /api/agents/threads - Atualiza thread (arquivar, título)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ThreadManager } from '@/lib/agentkit/thread-manager'

/**
 * GET - Lista threads do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limite máximo é 100' },
        { status: 400 }
      )
    }

    const manager = new ThreadManager()
    const threads = await manager.listThreads(
      session.user.id,
      agentId || undefined,
      limit
    )

    return NextResponse.json({ threads, count: threads.length })
  } catch (error) {
    console.error('[API /agents/threads GET] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao listar conversas' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Deleta thread
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId é obrigatório' },
        { status: 400 }
      )
    }

    const manager = new ThreadManager()
    await manager.deleteThread(threadId, session.user.id)

    return NextResponse.json({ success: true, message: 'Thread deletado' })
  } catch (error) {
    console.error('[API /agents/threads DELETE] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar conversa' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualiza thread (arquivar ou mudar título)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { threadId, action, title } = body

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId é obrigatório' },
        { status: 400 }
      )
    }

    const manager = new ThreadManager()

    if (action === 'archive') {
      await manager.archiveThread(threadId, session.user.id)
      return NextResponse.json({ success: true, message: 'Thread arquivado' })
    }

    if (action === 'update_title' && title) {
      await manager.updateThreadTitle(threadId, session.user.id, title)
      return NextResponse.json({ success: true, message: 'Título atualizado' })
    }

    return NextResponse.json(
      { error: 'Ação inválida ou parâmetros faltando' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API /agents/threads PATCH] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conversa' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
