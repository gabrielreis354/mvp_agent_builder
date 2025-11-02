/**
 * ConversationalEngine V3 - Conversa Natural com Coleta de Informações
 * 
 * Funciona como uma conversa real:
 * 1. Coleta informações necessárias através de perguntas
 * 2. Valida se tem todos os dados antes de executar
 * 3. Executa o agente apenas quando tiver contexto completo
 * 4. Formata respostas de forma natural (não JSON bruto)
 */

import { ChatRequest, ChatResponse, ChatMessage } from './types'
import { ThreadManager } from './thread-manager'
import { MemoryStore } from './memory-store'
import { RuntimeEngine } from '@/lib/runtime-engine'
import { prisma } from '@/lib/database/prisma'
import OpenAI from 'openai'
import { NodeAnalyzer, AgentRequirements } from './node-analyzer'

interface ConversationContext {
  hasRequiredInfo: boolean
  missingInfo: string[]
  collectedData: Record<string, any>
}

export class ConversationalEngineV3 {
  private threadManager: ThreadManager
  private memoryStore: MemoryStore
  private runtimeEngine: RuntimeEngine
  private openai: OpenAI
  private nodeAnalyzer: NodeAnalyzer

  constructor() {
    this.threadManager = new ThreadManager()
    this.memoryStore = new MemoryStore()
    this.runtimeEngine = new RuntimeEngine()
    this.nodeAnalyzer = new NodeAnalyzer()
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Processa mensagem de forma conversacional
   */
  async chat(request: ChatRequest & { fileContent?: string }): Promise<ChatResponse> {
    const { threadId, agentId, message, userId, fileContent } = request
    const startTime = Date.now()

    console.log('[ConversationalEngineV3] Iniciando conversa:', { 
      threadId, 
      agentId,
      hasFile: !!fileContent,
      filePreview: fileContent ? fileContent.substring(0, 100) : 'N/A'
    })

    // 1. Criar ou buscar thread
    const thread = threadId
      ? await this.threadManager.getThread(threadId, userId)
      : await this.threadManager.createThread(userId, agentId, message)

    if (!thread) {
      throw new Error('Erro ao criar/buscar thread')
    }

    // 2. Adicionar mensagem do usuário
    await this.threadManager.addMessage(thread.id, 'user', message)

    // 3. Buscar configuração do agente
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

    // 4. Processar arquivo se houver
    let extractedText: string | undefined
    if (fileContent && fileContent.startsWith('data:application/pdf')) {
      extractedText = await this.processPDF(fileContent)
    } else if (fileContent) {
      extractedText = fileContent
    }

    // 5. Analisar contexto da conversa
    const context = await this.analyzeConversationContext(
      thread,
      agentConfig,
      message,
      extractedText
    )

    // 6. Validar requisitos antes de executar
    const agentRequirements = this.nodeAnalyzer.analyzeAgent(agentConfig)
    const validationErrors: string[] = []

    // Validar arquivo obrigatório
    if (agentRequirements.needsFile && !extractedText) {
      validationErrors.push('Arquivo obrigatório não foi anexado')
    }

    // Validar campos obrigatórios
    const requiredFields = agentRequirements.fields.filter(f => f.required)
    for (const field of requiredFields) {
      if (!context.collectedData[field.name] || context.collectedData[field.name] === '') {
        validationErrors.push(`Campo obrigatório "${field.name}" não foi fornecido`)
      }
    }

    console.log('[ConversationalEngineV3] Validação:', {
      hasRequiredInfo: context.hasRequiredInfo,
      validationErrors,
      collectedData: Object.keys(context.collectedData),
      missingInfo: context.missingInfo,
    })

    // 7. Decidir: conversar ou executar?
    let assistantMessage: string
    let metadata: any = {}

    if (context.hasRequiredInfo && validationErrors.length === 0) {
      // TEM TODAS AS INFORMAÇÕES E PASSOU NA VALIDAÇÃO → EXECUTAR AGENTE
      console.log('[ConversationalEngineV3] ✅ Validação passou! Executando agente...')
      
      // CRÍTICO: Adicionar extractedText ao collectedData antes de executar
      if (extractedText) {
        context.collectedData.fileContent = extractedText
        console.log('[ConversationalEngineV3] 📄 Texto extraído adicionado:', extractedText.substring(0, 200))
      }
      
      const executionResult = await this.executeAgent(
        agentConfig,
        context.collectedData,
        userId
      )
      assistantMessage = await this.formatExecutionResult(executionResult)
      metadata = {
        executionId: executionResult.executionId,
        executionTime: Date.now() - startTime,
        executed: true,
      }
    } else {
      // FALTAM INFORMAÇÕES OU VALIDAÇÃO FALHOU → CONTINUAR CONVERSANDO
      if (validationErrors.length > 0) {
        console.log('[ConversationalEngineV3] ❌ Validação falhou:', validationErrors)
        // Adicionar erros de validação ao contexto para a IA explicar
        context.missingInfo = [...context.missingInfo, ...validationErrors]
      } else {
        console.log('[ConversationalEngineV3] Informações faltando, continuando conversa...')
      }
      
      assistantMessage = await this.generateConversationalResponse(
        thread,
        agentConfig,
        context,
        extractedText
      )
      metadata = {
        missingInfo: context.missingInfo,
        validationErrors,
        executed: false,
      }
    }

    // 7. Salvar resposta
    const savedMessage = await this.threadManager.addMessage(
      thread.id,
      'assistant',
      assistantMessage,
      metadata
    )

    // 8. Gerar sugestões
    const suggestions = this.generateSuggestions(assistantMessage, context)

    console.log('[ConversationalEngineV3] Resposta gerada:', {
      threadId: thread.id,
      executed: context.hasRequiredInfo,
      executionTime: `${Date.now() - startTime}ms`,
    })

    return {
      threadId: thread.id,
      message: savedMessage,
      suggestions,
    }
  }

  /**
   * Analisa se a conversa tem todas as informações necessárias
   * Agora usa NodeAnalyzer para extrair requisitos automaticamente dos nós!
   */
  private async analyzeConversationContext(
    thread: any,
    agentConfig: any,
    currentMessage: string,
    fileContent?: string
  ): Promise<ConversationContext> {
    // 1. ANALISAR NÓS DO AGENTE para extrair requisitos
    const agentRequirements = this.nodeAnalyzer.analyzeAgent(agentConfig)
    
    console.log('[ConversationalEngineV3] Requisitos do agente:', {
      fields: agentRequirements.fields.length,
      needsFile: agentRequirements.needsFile,
      fileTypes: agentRequirements.fileTypes,
    })

    // 2. Formatar requisitos para o prompt
    const requirementsText = this.nodeAnalyzer.formatRequirementsForPrompt(agentRequirements)

    const conversationHistory = thread.messages
      .slice(-10)
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n')

    const prompt = `Você é um assistente que analisa conversas para determinar se há informações suficientes para executar uma tarefa.

AGENTE: ${agentConfig.name}
DESCRIÇÃO: ${agentRequirements.description}

${requirementsText}

CONVERSA ATÉ AGORA:
${conversationHistory}

MENSAGEM ATUAL: ${currentMessage}
${fileContent ? `
✅ DOCUMENTO ANEXADO E PROCESSADO COM SUCESSO!

📄 CONTEÚDO DO DOCUMENTO (primeiros 2000 caracteres):
${fileContent.substring(0, 2000)}
${fileContent.length > 2000 ? '...\n[Documento possui mais conteúdo]' : ''}

⚠️ IMPORTANTE: 
- Este documento foi anexado pelo usuário e processado com sucesso
- EXTRAIA TODOS os dados disponíveis no conteúdo acima
- NÃO diga "documento não encontrado" ou "arquivo não fornecido"
- NÃO diga "não informado" se a informação estiver no texto do documento
- Use os dados do documento para preencher os campos obrigatórios
` : '❌ NENHUM DOCUMENTO ANEXADO'}

ANALISE COM ATENÇÃO:
1. Qual é a intenção do usuário?
2. Revise TODA a conversa acima - quais campos já foram mencionados pelo usuário?
   - Se o usuário disse "Dev React Frontend" → campo "vaga" = "Dev React Frontend"
   - Se o usuário disse "React, Python" → campo "habilidades" = "React, Python"
   - Se o arquivo foi anexado, EXTRAIA os valores do conteúdo do arquivo
3. Quais campos OBRIGATÓRIOS ainda estão REALMENTE faltando?
   - NÃO repita perguntas sobre informações já fornecidas!
   - Se o usuário já respondeu algo, considere como fornecido
4. O arquivo foi fornecido (se necessário)?

⚠️ REGRA CRÍTICA: Se o usuário já forneceu uma informação (mesmo que de forma resumida), 
considere como fornecida e NÃO pergunte novamente!

Responda em JSON:
{
  "intent": "descrição da intenção",
  "providedFields": {"campo1": "valor fornecido pelo usuário", "campo2": "valor fornecido", ...},
  "missingFields": ["apenas campos que REALMENTE não foram mencionados"],
  "hasAllInfo": true/false,
  "nextQuestion": "próxima pergunta sobre campo NÃO mencionado ainda"
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const analysis = JSON.parse(response.choices[0].message.content || '{}')

      return {
        hasRequiredInfo: analysis.hasAllInfo || false,
        missingInfo: analysis.missingFields || [],
        collectedData: {
          intent: analysis.intent,
          ...analysis.providedFields,
          fileContent,
          // NÃO incluir agentRequirements aqui - causa poluição na resposta
        },
      }
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao analisar contexto:', error)
      // Fallback: assumir que precisa de mais informações
      return {
        hasRequiredInfo: false,
        missingInfo: ['informações adicionais'],
        collectedData: { message: currentMessage, fileContent },
      }
    }
  }

  /**
   * Gera resposta conversacional (quando faltam informações)
   */
  private async generateConversationalResponse(
    thread: any,
    agentConfig: any,
    context: ConversationContext,
    fileContent?: string
  ): Promise<string> {
    const conversationHistory = thread.messages
      .slice(-10)
      .map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
      .join('\n')

    const prompt = `Você é ${agentConfig.name}, um assistente de RH especializado e amigável.

DESCRIÇÃO: ${agentConfig.description || 'Assistente de RH'}

CONVERSA ATÉ AGORA:
${conversationHistory}

CONTEXTO ATUAL:
${fileContent ? '- ✅ ARQUIVO ANEXADO: Sim! O usuário enviou um arquivo' : '- ❌ ARQUIVO: Não anexado ainda'}
- Informações já fornecidas: ${Object.keys(context.collectedData).filter(k => k !== 'fileContent' && k !== 'intent').join(', ') || 'Nenhuma ainda'}
- Informações ainda faltando: ${context.missingInfo.join(', ') || 'Nenhuma'}

⚠️ REGRA CRÍTICA: NÃO REPITA PERGUNTAS! 
Se o usuário já respondeu algo na conversa acima, considere como fornecido e passe para a próxima informação.

INSTRUÇÕES CRÍTICAS:
1. ${fileContent ? '✅ IMPORTANTE: Reconheça EXPLICITAMENTE que recebeu o arquivo! Diga algo como "Recebi o arquivo!" ou "Obrigado pelo documento!"' : ''}
2. Seja natural e conversacional (não robótico)
3. Revise a conversa - o usuário já respondeu algo? Se sim, agradeça e passe para a próxima pergunta
4. Faça UMA pergunta DIRETA e ESPECÍFICA por vez sobre informações AINDA não fornecidas
5. NÃO faça perguntas genéricas ou abertas demais
6. Se precisa de informações sobre a vaga, pergunte OBJETIVAMENTE:
   - "Qual é o NOME/TÍTULO da vaga?" (ex: Desenvolvedor Python, Analista de RH)
   - "Quais são as PRINCIPAIS HABILIDADES necessárias?" (ex: Python, React, SQL)
   - "Qual é o NÍVEL de experiência?" (ex: Júnior, Pleno, Sênior)
7. Dê exemplos CONCRETOS do que você precisa
8. Mantenha tom profissional mas amigável
${fileContent ? '9. Após reconhecer o arquivo, pergunte pela PRÓXIMA informação faltando de forma CLARA e DIRETA' : ''}

⚠️ IMPORTANTE: Retorne APENAS a mensagem para o usuário. NÃO inclua metadados, JSON, ou informações técnicas.
Sua resposta deve ser uma conversa natural, como se estivesse falando com uma pessoa.

Gere uma resposta natural que ajude a coletar as informações faltando.`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      })

      return response.choices[0].message.content || 'Como posso ajudá-lo?'
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao gerar resposta:', error)
      return 'Desculpe, ocorreu um erro. Pode reformular sua pergunta?'
    }
  }

  /**
   * Executa o agente com as informações coletadas
   */
  private async executeAgent(
    agentConfig: any,
    collectedData: Record<string, any>,
    userId: string
  ): Promise<any> {
    try {
      console.log('[ConversationalEngineV3] Executando agente com dados:', collectedData)

      const executionResult = await this.runtimeEngine.executeAgent(
        agentConfig as any,
        collectedData,
        userId
      )

      if (!executionResult.success) {
        throw new Error(executionResult.error || 'Erro na execução')
      }

      return executionResult
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao executar agente:', error)
      throw error
    }
  }

  /**
   * Formata resultado da execução de forma natural
   */
  private async formatExecutionResult(executionResult: any): Promise<string> {
    try {
      const nodeResults = executionResult.nodeResults || {}

      // 1. Buscar node de output específico
      const outputNode = Object.values(nodeResults).find(
        (result: any) => result?.type === 'output' || result?.isOutput
      )

      if (outputNode) {
        return await this.formatNodeOutput(outputNode)
      }

      // 2. Buscar resultado geral
      if (executionResult.output) {
        return await this.formatNodeOutput(executionResult.output)
      }

      // 3. Concatenar resultados relevantes
      const relevantResults = await Promise.all(
        Object.entries(nodeResults)
          .filter(([_, result]: [string, any]) => result?.output || result?.response)
          .map(async ([_, result]: [string, any]) => await this.formatNodeOutput(result))
      )
      
      const filtered = relevantResults.filter((text) => text && text.length > 0)

      if (filtered.length > 0) {
        return filtered.join('\n\n')
      }

      // 4. Fallback
      return '✅ Processamento concluído com sucesso!'
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao formatar resultado:', error)
      return 'Processamento concluído, mas houve um erro ao formatar o resultado.'
    }
  }

  /**
   * Formata output de um node de forma natural
   */
  private async formatNodeOutput(output: any): Promise<string> {
    // Se já é string, retornar
    if (typeof output === 'string') {
      return output
    }

    // Se tem campo response ou output
    if (output?.response) {
      return typeof output.response === 'string'
        ? output.response
        : await this.formatStructuredData(output.response)
    }

    if (output?.output) {
      return typeof output.output === 'string'
        ? output.output
        : await this.formatStructuredData(output.output)
    }

    // Se tem análise estruturada
    if (output?.analysis) {
      return await this.formatStructuredData(output.analysis)
    }

    // Se é objeto, formatar de forma legível
    return await this.formatStructuredData(output)
  }

  /**
   * Formata dados estruturados de forma legível (NÃO JSON bruto)
   */
  private async formatStructuredData(data: any): Promise<string> {
    if (typeof data === 'string') {
      // Se for JSON string, parsear e formatar
      try {
        const parsed = JSON.parse(data)
        return await this.formatStructuredData(parsed)
      } catch {
        return data
      }
    }

    if (Array.isArray(data)) {
      const formatted = await Promise.all(
        data.map(async (item, i) => `${i + 1}. ${await this.formatStructuredData(item)}`)
      )
      return formatted.join('\n')
    }

    if (typeof data === 'object' && data !== null) {
      // Usar IA para formatar de forma natural
      return await this.formatWithAI(data)
    }

    return String(data)
  }

  /**
   * Usa IA para formatar resultado de forma natural e legível
   */
  private async formatWithAI(data: any): Promise<string> {
    try {
      const prompt = `Você é um assistente que formata resultados de análises de forma clara e profissional.

DADOS DA ANÁLISE:
${JSON.stringify(data, null, 2)}

INSTRUÇÕES:
1. Formate esses dados de forma NATURAL e LEGÍVEL para um usuário de RH
2. Use títulos, subtítulos e listas quando apropriado
3. Destaque informações importantes com **negrito**
4. Organize por seções lógicas
5. NÃO retorne JSON - apenas texto formatado
6. Seja conciso mas completo
7. Use linguagem profissional mas acessível

Formate o resultado de forma que seja fácil de ler e entender:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      return response.choices[0].message.content || this.formatStructuredDataFallback(data)
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao formatar com IA:', error)
      return this.formatStructuredDataFallback(data)
    }
  }

  /**
   * Formatação fallback se IA falhar
   */
  private formatStructuredDataFallback(data: any): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(data)) {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase())

      if (Array.isArray(value)) {
        lines.push(`\n**${formattedKey}:**`)
        value.forEach((item, i) => {
          lines.push(`  ${i + 1}. ${typeof item === 'object' ? JSON.stringify(item) : item}`)
        })
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`\n**${formattedKey}:**`)
        lines.push(this.formatStructuredDataFallback(value))
      } else {
        lines.push(`**${formattedKey}:** ${value}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * Processa PDF via microserviço
   */
  private async processPDF(fileContent: string): Promise<string> {
    try {
      console.log('[ConversationalEngineV3] 📄 Iniciando processamento de PDF...')
      console.log('[ConversationalEngineV3] Tamanho do conteúdo recebido:', fileContent.length, 'caracteres')

      // Validar se é base64
      if (!fileContent || fileContent.length === 0) {
        throw new Error('Arquivo vazio ou não fornecido')
      }

      const base64Data = fileContent.includes(',') ? fileContent.split(',')[1] : fileContent
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Formato de arquivo inválido - não é base64 válido')
      }

      console.log('[ConversationalEngineV3] Base64 extraído:', base64Data.length, 'caracteres')

      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }

      console.log('[ConversationalEngineV3] ✅ Arquivo convertido:', bytes.length, 'bytes')

      const formData = new FormData()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      formData.append('file', blob, 'document.pdf')

      // ✅ Usar variável de ambiente (produção ou desenvolvimento)
      const pdfServiceUrl = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || process.env.PDF_SERVICE_URL
      
      if (!pdfServiceUrl) {
        console.error('[ConversationalEngineV3] PDF_SERVICE_URL não configurada!')
        return '[Erro: Serviço de processamento de PDF não configurado. Configure PDF_SERVICE_URL nas variáveis de ambiente.]'
      }

      const serviceUrl = `${pdfServiceUrl}/extract`
      console.log('[ConversationalEngineV3] Enviando para:', serviceUrl)

      const response = await fetch(serviceUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000), // 30s timeout
      })

      console.log('[ConversationalEngineV3] Status da resposta:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ConversationalEngineV3] Erro do microserviço:', errorText)
        throw new Error(`Erro no microserviço: ${response.statusText}`)
      }

      const data = await response.json()
      const extractedText = data.text || data.content || ''
      
      console.log('[ConversationalEngineV3] Texto extraído:', extractedText.substring(0, 200), '...')
      console.log('[ConversationalEngineV3] Tamanho do texto:', extractedText.length, 'caracteres')

      if (!extractedText || extractedText.length < 10) {
        console.warn('[ConversationalEngineV3] Texto extraído muito curto ou vazio!')
        return '[Erro: PDF vazio ou não foi possível extrair texto]'
      }

      return extractedText
    } catch (error) {
      console.error('[ConversationalEngineV3] Erro ao processar PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return `[Erro ao processar PDF: ${errorMessage}. Verifique se o serviço de processamento está disponível.]`
    }
  }

  /**
   * Gera sugestões contextuais
   */
  private generateSuggestions(message: string, context: ConversationContext): string[] {
    const suggestions: string[] = []

    if (context.hasRequiredInfo) {
      // Após execução
      suggestions.push('Fazer outra análise')
      suggestions.push('Ver detalhes')
      suggestions.push('Exportar resultado')
    } else {
      // Durante coleta de informações
      if (context.missingInfo.length > 0) {
        suggestions.push('Fornecer mais detalhes')
        suggestions.push('Anexar documento')
      }
      suggestions.push('Começar de novo')
    }

    return suggestions.slice(0, 3)
  }
}
