/**
 * ConversationalEngine V2 - Engine com Execução de Fluxo
 * 
 * Orquestra conversação executando o fluxo configurado pelo usuário:
 * - Executa nodes do agente (análise, processamento, etc)
 * - Processa PDFs via microserviço
 * - Mantém contexto conversacional
 * - Memória de longo prazo
 */

import { ThreadManager } from './thread-manager'
import { MemoryStore } from './memory-store'
import { ChatRequest, ChatResponse } from './types'
import { prisma } from '@/lib/database/prisma'
import { AgentRuntimeEngine } from '@/lib/runtime/engine'
import { pdfServiceClient } from '@/lib/services/pdf-service-client'

export class ConversationalEngineV2 {
  private threadManager: ThreadManager
  private memoryStore: MemoryStore
  private runtimeEngine: AgentRuntimeEngine

  constructor() {
    this.threadManager = new ThreadManager()
    this.memoryStore = new MemoryStore()
    this.runtimeEngine = new AgentRuntimeEngine()
  }

  /**
   * Processa mensagem executando o fluxo configurado do agente
   */
  async chat(request: ChatRequest & { fileContent?: string }): Promise<ChatResponse> {
    const { threadId, agentId, message, userId, fileContent } = request
    const startTime = Date.now()

    console.log('[ConversationalEngineV2] Processando mensagem:', {
      threadId,
      agentId,
      userId,
      messageLength: message.length,
      hasFile: !!fileContent,
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

    // 3. Buscar configuração completa do agente
    const agentConfig = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        description: true,
        nodes: true,
        edges: true,
      },
    })

    if (!agentConfig) {
      throw new Error('Agente não encontrado')
    }

    // 4. Processar arquivo PDF se houver
    let extractedText: string | undefined
    if (fileContent && fileContent.startsWith('data:application/pdf')) {
      try {
        console.log('[ConversationalEngineV2] Processando PDF via microserviço...')
        
        // Converter base64 para File
        const base64Data = fileContent.split(',')[1]
        const binaryData = atob(base64Data)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const file = new File([blob], 'uploaded.pdf', { type: 'application/pdf' })

        // Extrair texto via microserviço
        const pdfResult = await pdfServiceClient.extractPdfText(file)
        extractedText = pdfResult.text || pdfResult.content
        
        console.log('[ConversationalEngineV2] PDF processado:', {
          chars: pdfResult.character_count,
          words: pdfResult.word_count,
          method: pdfResult.method,
        })
      } catch (error) {
        console.error('[ConversationalEngineV2] Erro ao processar PDF:', error)
        extractedText = '[Erro ao processar PDF]'
      }
    } else if (fileContent) {
      // Arquivo de texto simples
      extractedText = fileContent
    }

    // 5. Buscar memórias relevantes
    const relevantMemories = await this.memoryStore.searchRelevantMemories(
      message,
      userId,
      3
    )

    console.log('[ConversationalEngineV2] Memórias encontradas:', relevantMemories.length)

    // 6. Preparar input para execução do agente
    const agentInput = {
      message,
      fileContent: extractedText,
      conversationHistory: thread.messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
      })),
      relevantMemories: relevantMemories.map(m => m.content),
      threadId: thread.id,
    }

    // 7. Executar fluxo do agente
    try {
      console.log('[ConversationalEngineV2] Executando fluxo do agente...')
      
      const executionResult = await this.runtimeEngine.executeAgent(
        agentConfig as any,
        agentInput,
        userId
      )

      if (!executionResult.success) {
        throw new Error(executionResult.error || 'Erro na execução do agente')
      }

      // 8. Extrair resposta do resultado
      const assistantMessage = this.extractResponseFromExecution(executionResult)
      const executionTime = Date.now() - startTime

      // 9. Salvar resposta do agente
      const savedMessage = await this.threadManager.addMessage(
        thread.id,
        'assistant',
        assistantMessage,
        {
          executionId: executionResult.executionId,
          executionTime,
          nodeResults: executionResult.nodeResults,
        }
      )

      // 10. Armazenar na memória (assíncrono)
      this.memoryStore
        .storeMessage(thread.id, savedMessage.id, assistantMessage, {
          userId,
          agentId,
        })
        .catch((error) => {
          console.error('[ConversationalEngineV2] Erro ao armazenar memória:', error)
        })

      // 11. Gerar sugestões
      const suggestions = this.generateSuggestions(assistantMessage)

      console.log('[ConversationalEngineV2] Resposta gerada:', {
        threadId: thread.id,
        executionId: executionResult.executionId,
        executionTime: `${executionTime}ms`,
      })

      return {
        threadId: thread.id,
        message: savedMessage,
        suggestions,
      }
    } catch (error) {
      console.error('[ConversationalEngineV2] Erro ao executar agente:', error)
      
      // Salvar mensagem de erro
      const errorMessage = await this.threadManager.addMessage(
        thread.id,
        'assistant',
        'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
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
   * Extrai resposta formatada do resultado da execução
   */
  private extractResponseFromExecution(executionResult: any): string {
    // Buscar output do último node ou node de output específico
    const nodeResults = executionResult.nodeResults || {}
    
    // Tentar encontrar node de output
    const outputNode = Object.values(nodeResults).find((result: any) => 
      result?.type === 'output' || result?.isOutput
    )

    if (outputNode) {
      return this.formatOutput(outputNode)
    }

    // Se não houver node de output, usar resultado geral
    if (executionResult.output) {
      return this.formatOutput(executionResult.output)
    }

    // Fallback: concatenar resultados relevantes
    const relevantResults = Object.entries(nodeResults)
      .filter(([_, result]: [string, any]) => result?.output || result?.response)
      .map(([_, result]: [string, any]) => result.output || result.response)
      .join('\n\n')

    return relevantResults || 'Processamento concluído com sucesso.'
  }

  /**
   * Formata output para exibição
   */
  private formatOutput(output: any): string {
    if (typeof output === 'string') {
      return output
    }

    if (output?.response || output?.output) {
      return output.response || output.output
    }

    if (output?.analysis) {
      return this.formatAnalysis(output.analysis)
    }

    return JSON.stringify(output, null, 2)
  }

  /**
   * Formata análise estruturada
   */
  private formatAnalysis(analysis: any): string {
    if (typeof analysis === 'string') {
      return analysis
    }

    let formatted = ''

    if (analysis.summary) {
      formatted += `📋 **Resumo:**\n${analysis.summary}\n\n`
    }

    if (analysis.score !== undefined) {
      formatted += `⭐ **Pontuação:** ${analysis.score}/10\n\n`
    }

    if (analysis.strengths && Array.isArray(analysis.strengths)) {
      formatted += `✅ **Pontos Fortes:**\n${analysis.strengths.map((s: string) => `- ${s}`).join('\n')}\n\n`
    }

    if (analysis.weaknesses && Array.isArray(analysis.weaknesses)) {
      formatted += `⚠️ **Pontos de Atenção:**\n${analysis.weaknesses.map((w: string) => `- ${w}`).join('\n')}\n\n`
    }

    if (analysis.recommendation) {
      formatted += `💡 **Recomendação:**\n${analysis.recommendation}`
    }

    return formatted || JSON.stringify(analysis, null, 2)
  }

  /**
   * Gera sugestões de próximas perguntas
   */
  private generateSuggestions(lastResponse: string): string[] {
    const suggestions: string[] = []

    if (lastResponse.toLowerCase().includes('currículo') || lastResponse.toLowerCase().includes('candidato')) {
      suggestions.push('Analisar outro currículo')
      suggestions.push('Comparar com outros candidatos')
      suggestions.push('Gerar relatório completo')
    } else if (lastResponse.toLowerCase().includes('contrato')) {
      suggestions.push('Validar cláusulas específicas')
      suggestions.push('Verificar conformidade CLT')
    } else if (lastResponse.toLowerCase().includes('análise') || lastResponse.toLowerCase().includes('score')) {
      suggestions.push('Ver detalhes da análise')
      suggestions.push('Exportar resultado')
      suggestions.push('Analisar próximo documento')
    } else {
      suggestions.push('Me explique mais sobre isso')
      suggestions.push('Tem algum exemplo prático?')
      suggestions.push('Quais são as próximas etapas?')
    }

    return suggestions.slice(0, 3)
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    console.log('[ConversationalEngineV2] Cleanup executado')
  }
}
