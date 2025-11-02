/**
 * API Endpoint - Chat com Agente Conversacional
 * POST /api/agents/chat
 * 
 * Processa mensagens do usuário e retorna respostas do agente
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConversationalEngineV3 } from '@/lib/agentkit/conversational-engine-v3'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Validar body
    const body = await request.json()
    const { threadId, agentId, message, fileContent } = body

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'agentId e message são obrigatórios' },
        { status: 400 }
      )
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'message deve ser uma string não vazia' },
        { status: 400 }
      )
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: 'message muito longa (máximo 10000 caracteres)' },
        { status: 400 }
      )
    }

    // 3. Verificar feature flag
    if (process.env.ENABLE_CONVERSATIONAL_AGENTS !== 'true') {
      return NextResponse.json(
        { error: 'Agentes conversacionais não habilitados' },
        { status: 503 }
      )
    }

    // 4. Processar mensagem com engine conversacional V3
    const engine = new ConversationalEngineV3()
    const response = await engine.chat({
      threadId,
      agentId,
      message: message.trim(),
      userId: session.user.id,
      fileContent, // Incluir arquivo se houver
    })

    // 5. Retornar resposta
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('[API /agents/chat] Erro:', error)

    // Erro específico vs genérico
    if (error instanceof Error) {
      if (error.message.includes('não encontrado')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes('permissão')) {
        return NextResponse.json(
          { error: 'Sem permissão para acessar este recurso' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}

// Configuração do endpoint
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
