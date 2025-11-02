/**
 * ConversationalEngine - Engine Principal de Agentes Conversacionais
 * 
 * Orquestra a conversação entre usuário e agente, integrando:
 * - OpenAI para geração de respostas
 * - ThreadManager para persistência
 * - MemoryStore para contexto de longo prazo
 */

import OpenAI from 'openai'
import { ThreadManager } from './thread-manager'
import { MemoryStore } from './memory-store'
import { ChatRequest, ChatResponse } from './types'
import { prisma } from '@/lib/database/prisma'
import { AgentRuntimeEngine } from '@/lib/runtime/engine'
import { pdfServiceClient } from '@/lib/services/pdf-service-client'

export class ConversationalEngine {
  private openai: OpenAI
  private threadManager: ThreadManager
  private memoryStore: MemoryStore
  private runtimeEngine: AgentRuntimeEngine

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.threadManager = new ThreadManager()
    this.memoryStore = new MemoryStore()
    this.runtimeEngine = new AgentRuntimeEngine()
  }

  /**
   * Processa mensagem do usuário e retorna resposta do agente
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { threadId, agentId, message, userId } = request
    const startTime = Date.now()

    console.log('[ConversationalEngine] Processando mensagem:', {
      threadId,
      agentId,
      userId,
      messageLength: message.length,
    })

    // 1. Criar ou recuperar thread
    let thread
    if (threadId) {
      thread = await this.threadManager.getThread(threadId, userId)
      if (!thread) {
        throw new Error('Thread não encontrado ou sem permissão')
      }
    } else {
      thread = await this.threadManager.createThread(userId, agentId, message)
    }

    // 2. Adicionar mensagem do usuário
    await this.threadManager.addMessage(thread.id, 'user', message)

    // 3. Buscar memórias relevantes (contexto de conversas anteriores)
    const relevantMemories = await this.memoryStore.searchRelevantMemories(
      message,
      userId,
      3
    )

    console.log('[ConversationalEngine] Memórias encontradas:', relevantMemories.length)

    // 4. Buscar instruções do agente
    const agentInstructions = await this.getAgentInstructions(agentId)

    // 5. Construir contexto para o agente
    const systemMessage = this.buildSystemMessage(agentInstructions, relevantMemories)
    const conversationHistory = thread.messages.slice(-10) // Últimas 10 mensagens

    // 6. Chamar OpenAI
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemMessage },
          ...conversationHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })

      const assistantMessage = completion.choices[0].message.content || 'Desculpe, não consegui gerar uma resposta.'
      const executionTime = Date.now() - startTime

      // 7. Salvar resposta do agente
      const savedMessage = await this.threadManager.addMessage(
        thread.id,
        'assistant',
        assistantMessage,
        {
          tokensUsed: completion.usage?.total_tokens,
          model: completion.model,
          executionTime,
        }
      )

      // 8. Armazenar na memória de longo prazo (assíncrono)
      this.memoryStore
        .storeMessage(thread.id, savedMessage.id, assistantMessage, {
          userId,
          agentId,
        })
        .catch((error) => {
          console.error('[ConversationalEngine] Erro ao armazenar memória:', error)
        })

      // 9. Gerar sugestões de próximas perguntas (opcional)
      const suggestions = this.generateSuggestions(assistantMessage)

      console.log('[ConversationalEngine] Resposta gerada:', {
        threadId: thread.id,
        tokensUsed: completion.usage?.total_tokens,
        executionTime: `${executionTime}ms`,
      })

      return {
        threadId: thread.id,
        message: savedMessage,
        suggestions,
      }
    } catch (error) {
      console.error('[ConversationalEngine] Erro ao chamar OpenAI:', error)
      
      // Salvar mensagem de erro
      const errorMessage = await this.threadManager.addMessage(
        thread.id,
        'assistant',
        'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      )

      return {
        threadId: thread.id,
        message: errorMessage,
        suggestions: ['Tentar novamente'],
      }
    }
  }

  /**
   * Busca instruções do agente no banco de dados
   */
  private async getAgentInstructions(agentId: string): Promise<string> {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { name: true, description: true },
      })

      if (!agent) {
        return this.getDefaultInstructions()
      }

      return `Você é ${agent.name}, um assistente de RH especializado.
${agent.description || ''}

Suas responsabilidades:
- Ajudar profissionais de RH com análise de currículos, contratos, onboarding e compliance
- Ser profissional, claro e objetivo
- Fazer perguntas de esclarecimento quando necessário
- Fornecer respostas práticas e acionáveis`
    } catch (error) {
      console.error('[ConversationalEngine] Erro ao buscar agente:', error)
      return this.getDefaultInstructions()
    }
  }

  /**
   * Instruções padrão se agente não for encontrado
   */
  private getDefaultInstructions(): string {
    return `Você é um assistente de RH especializado da SimplifiqueIA RH.

Suas responsabilidades:
- Ajudar profissionais de RH com análise de currículos, contratos, onboarding e compliance
- Ser profissional, claro e objetivo em português do Brasil
- Fazer perguntas de esclarecimento quando necessário
- Fornecer respostas práticas e acionáveis
- Manter contexto da conversa e lembrar de informações anteriores

Áreas de expertise:
- Análise e triagem de currículos
- Validação de contratos CLT
- Processos de onboarding
- Avaliação 360° e feedback
- Gestão de despesas (vale-transporte, refeição)
- Compliance e LGPD`
  }

  /**
   * Constrói mensagem de sistema com contexto
   */
  private buildSystemMessage(
    baseInstructions: string,
    relevantMemories: Array<{ content: string; metadata: any; score?: number }>
  ): string {
    let systemMessage = baseInstructions

    // Adicionar contexto de memórias relevantes
    if (relevantMemories.length > 0) {
      const memoriesContext = relevantMemories
        .filter((m) => m.score && m.score > 0.7) // Apenas memórias relevantes
        .map((m) => `- ${m.content}`)
        .join('\n')

      if (memoriesContext) {
        systemMessage += `\n\nContexto de conversas anteriores:\n${memoriesContext}`
      }
    }

    // Adicionar data/hora atual
    const now = new Date()
    systemMessage += `\n\nData/hora atual: ${now.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })}`

    return systemMessage
  }

  /**
   * Gera sugestões de próximas perguntas
   */
  private generateSuggestions(lastResponse: string): string[] {
    // Implementação simples baseada em palavras-chave
    const suggestions: string[] = []

    if (lastResponse.toLowerCase().includes('currículo')) {
      suggestions.push('Como avaliar soft skills?')
      suggestions.push('Quais critérios técnicos devo considerar?')
    } else if (lastResponse.toLowerCase().includes('contrato')) {
      suggestions.push('Quais cláusulas são obrigatórias?')
      suggestions.push('Como validar conformidade com CLT?')
    } else if (lastResponse.toLowerCase().includes('onboarding')) {
      suggestions.push('Quanto tempo deve durar o onboarding?')
      suggestions.push('Quais documentos são necessários?')
    } else {
      suggestions.push('Me explique mais sobre isso')
      suggestions.push('Tem algum exemplo prático?')
      suggestions.push('Quais são as próximas etapas?')
    }

    return suggestions.slice(0, 3) // Máximo 3 sugestões
  }

  /**
   * Limpa recursos (se necessário)
   */
  async cleanup(): Promise<void> {
    // Implementar limpeza se necessário
    console.log('[ConversationalEngine] Cleanup executado')
  }
}
