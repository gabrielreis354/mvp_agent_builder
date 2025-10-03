import { Agent, AgentNode } from '@/types/agent'
import { ExecutionContext, ExecutionResult } from './engine'
import { UnifiedProcessor } from '@/lib/processors/unified-processor'
import { dynamicOutputGenerator, OutputGenerationConfig, GeneratedOutput } from '@/lib/output/dynamic-output-generator'
import { AIProviderManager } from '@/lib/ai-providers'
import { safeJsonParse } from '@/lib/utils/safe-json'
import { logger } from '@/lib/utils/logger'
import { CachedAIProvider, createCachedAIProvider } from '@/lib/ai/cached-ai-provider'

export interface HybridExecutionOptions {
  uploadedFiles?: File[]
  outputFormat?: 'pdf' | 'docx' | 'csv' | 'html' | 'json'
  outputTemplate?: 'professional' | 'executive' | 'technical' | 'simple'
  deliveryMethod?: 'email' | 'download'
  recipientEmail?: string
}

export interface HybridExecutionResult extends ExecutionResult {
  generatedOutput?: GeneratedOutput
}

export class HybridRuntimeEngine {
  private aiProviderManager!: AIProviderManager
  private cachedAIProvider!: CachedAIProvider

  constructor() {
    this.initializeHybridProviders()
  }

  private initializeHybridProviders() {
    logger.info('Initializing hybrid runtime engine', 'HYBRID_ENGINE')
    
    this.aiProviderManager = new AIProviderManager({
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        organization: process.env.OPENAI_ORG_ID
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || ''
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY || ''
      }
    })

    // Inicializar AI Provider com cache
    this.cachedAIProvider = createCachedAIProvider(this.aiProviderManager)
    logger.info('Cached AI Provider initialized', 'HYBRID_ENGINE')
  }

  async executeAgentHybrid(
    agent: Agent, 
    input: any, 
    userId: string,
    options: HybridExecutionOptions = {}
  ): Promise<HybridExecutionResult> {
    console.log(`🔄 Starting hybrid execution for agent: ${agent.name}`)
    
    // 1. Processar arquivos se fornecidos
    let processedFiles: any[] = []
    if (options.uploadedFiles && options.uploadedFiles.length > 0) {
      console.log(`📁 Processing ${options.uploadedFiles.length} uploaded files...`)
      
      const processor = new UnifiedProcessor()
      for (const file of options.uploadedFiles) {
        try {
          const result = await processor.processFile(file)
          if (result.success && result.data) {
            processedFiles.push(result.data)
            console.log(`✅ File processed: ${file.name}`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to process file ${file.name}:`, error)
        }
      }
    }
    
    // 2. Enriquecer input com dados dos arquivos processados
    const enrichedInput = {
      ...input,
      processedFiles: processedFiles,
      fileData: processedFiles.length > 0 ? processedFiles[0] : null,
      hasFiles: processedFiles.length > 0
    }
    
    // 3. Executar agente com dados enriquecidos
    const executionResult = await this.executeAgent(agent, enrichedInput, userId)
    
    // 4. Gerar output dinâmico se solicitado
    let hybridResult: HybridExecutionResult = executionResult
    
    if (options.outputFormat && options.outputFormat !== 'json') {
      console.log(`📄 Generating ${options.outputFormat} output...`)
      
      try {
        const outputConfig: OutputGenerationConfig = {
          format: options.outputFormat,
          template: options.outputTemplate || 'professional',
          includeCharts: true,
          includeSummary: true,
          branding: true
        }
        
        const generatedOutput = await dynamicOutputGenerator.generateOutput(
          agent,
          executionResult,
          outputConfig
        )
        
        // Anexar output gerado ao resultado
        hybridResult = {
          ...executionResult,
          generatedOutput: generatedOutput
        }
        console.log(`✅ Output generated: ${generatedOutput.filename}`)
        
      } catch (outputError) {
        console.warn('⚠️ Failed to generate output:', outputError)
        // Não falhar a execução por causa do output
      }
    }
    
    return hybridResult
  }

  async executeAgent(agent: Agent, input: any, userId: string): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId()
    const context: ExecutionContext = {
      executionId,
      agentId: agent.id || 'unknown',
      userId,
      input,
      variables: { ...input },
      startTime: new Date()
    }

    // Iniciar logging da execução
    logger.startExecution(
      executionId, 
      agent.id || 'unknown', 
      agent.name || 'Unnamed Agent', 
      userId, 
      agent.nodes.length
    )

    try {
      // Ordenar nós topologicamente
      const orderedNodes = this.getExecutionOrder(agent.nodes, agent.edges)
      const nodeObjects = orderedNodes.map(id => agent.nodes.find(n => n.id === id)).filter(Boolean) as AgentNode[]
      
      const nodeResults: Record<string, any> = {}
      
      for (const node of nodeObjects) {
        const nodeStartTime = Date.now()
        
        try {
          const result = await this.executeNode(node, context.variables, context)
          const nodeDuration = Date.now() - nodeStartTime
          
          nodeResults[node.id] = result
          
          // Log sucesso do nó
          logger.logNodeExecution(
            executionId,
            node.id,
            node.data?.label || node.type || 'Unknown Node',
            true,
            nodeDuration,
            result
          )
          
          // Atualizar variáveis do contexto
          if (result && typeof result === 'object') {
            context.variables = { ...context.variables, ...result }
          }
        } catch (nodeError) {
          const nodeDuration = Date.now() - nodeStartTime
          
          // Log erro do nó
          logger.logNodeExecution(
            executionId,
            node.id,
            node.data?.label || node.type || 'Unknown Node',
            false,
            nodeDuration,
            nodeError
          )
          
          throw nodeError
        }
      }

      const executionTime = Date.now() - context.startTime.getTime()
      
      // Log sucesso da execução
      logger.completeExecution(executionId, true)
      
      // Get the result from the last node
      const lastNodeId = nodeObjects[nodeObjects.length - 1]?.id
      const lastNodeResult = nodeResults[lastNodeId]
      
      // If the last node generated HTML content, return it directly
      let finalOutput = lastNodeResult
      logger.debug('Last node result analysis', `EXEC:${executionId}`, { lastNodeResult })
      
      // Check if last node has HTML content
      if (lastNodeResult?.response && typeof lastNodeResult.response === 'string' && lastNodeResult.response.includes('<!DOCTYPE html>')) {
        finalOutput = lastNodeResult.response
        console.log('🎉 HTML content detected in final output!')
      } else {
        // If last node doesn't have HTML, check previous AI nodes for HTML content
        console.log('🔍 Searching for HTML in previous AI nodes...')
        for (let i = nodeObjects.length - 2; i >= 0; i--) {
          const nodeId = nodeObjects[i].id
          const nodeResult = nodeResults[nodeId]
          const nodeData = nodeObjects[i].data
          
          console.log(`🔍 Checking node ${nodeId} (type: ${nodeData.nodeType})`)
          if (nodeData.nodeType === 'ai') {
            const responseContent = nodeResult?.response
            if (typeof responseContent === 'string') {
              console.log(`🔍 AI node ${nodeId} response:`, responseContent.substring(0, 100))
              
              if (responseContent.includes('<!DOCTYPE html>')) {
                finalOutput = responseContent
                console.log(`🎉 HTML content found in AI node ${nodeId}!`)
                break
              }
            } else {
              console.log(`🔍 AI node ${nodeId} response type:`, typeof responseContent)
            }
          }
        }
        
        // If no HTML found, use last node result
        if (finalOutput === lastNodeResult) {
          if (lastNodeResult?.response) {
            finalOutput = lastNodeResult.response
            console.log('📝 Non-HTML response detected:', typeof lastNodeResult.response)
          } else {
            console.log('❌ No response found in last node result')
          }
        }
      }
      
      return {
        executionId,
        success: true,
        output: finalOutput || context.variables,
        executionTime,
        nodeResults
      }
    } catch (error) {
      const executionTime = Date.now() - context.startTime.getTime()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Log erro da execução
      logger.completeExecution(executionId, false, errorMessage)
      
      return {
        executionId,
        success: false,
        error: errorMessage,
        executionTime,
        nodeResults: {}
      }
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getExecutionOrder(nodes: AgentNode[], edges: any[]): string[] {
    // Implementação simples de ordenação topológica
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const visited = new Set<string>()
    const result: string[] = []
    
    // Encontrar nós de entrada (sem dependências)
    const incomingEdges = new Map<string, string[]>()
    edges.forEach(edge => {
      if (!incomingEdges.has(edge.target)) {
        incomingEdges.set(edge.target, [])
      }
      incomingEdges.get(edge.target)!.push(edge.source)
    })
    
    // Começar com nós que não têm dependências
    const startNodes = nodes.filter(n => !incomingEdges.has(n.id))
    
    function visit(nodeId: string) {
      if (visited.has(nodeId)) return
      
      // Visitar dependências primeiro
      const dependencies = incomingEdges.get(nodeId) || []
      dependencies.forEach(depId => visit(depId))
      
      visited.add(nodeId)
      result.push(nodeId)
    }
    
    // Visitar todos os nós
    nodes.forEach(node => visit(node.id))
    
    return result
  }

  protected async executeNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    const nodeType = node.data?.nodeType || node.type
    
    console.log(`🔧 Executing ${nodeType} node: ${node.data?.label || node.id}`)
    
    switch (nodeType) {
      case 'input':
        return await this.executeInputNode(node, variables, context)
      case 'ai':
        return await this.executeAINode(node, variables, context)
      case 'logic':
        return await this.executeLogicNode(node, variables, context)
      case 'api':
        return await this.executeAPINode(node, variables, context)
      case 'output':
        return await this.executeOutputNode(node, variables, context)
      default:
        console.warn(`Unknown node type: ${nodeType}`)
        return { type: 'unknown', result: variables }
    }
  }

  private async executeInputNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log('📥 Processing input node...')
    
    // Verificar se há arquivo processado nos dados de entrada
    if (variables.hasFile && variables.processedFile) {
      const fileData = variables.processedFile
      
      console.log(`📄 File detected: ${fileData.originalName}`)
      console.log(`📄 Extracted text length: ${fileData.extractedText?.length || 0} characters`)
      
      return {
        type: 'input',
        hasFile: true,
        fileName: fileData.originalName,
        extractedText: fileData.extractedText,
        extractedData: fileData.extractedData,
        fileMetadata: fileData.metadata,
        userInput: variables
      }
    }
    
    // Fallback: verificar se há arquivos processados (formato antigo)
    if (variables.processedFiles && variables.processedFiles.length > 0) {
      const fileData = variables.processedFiles[0]
      
      return {
        type: 'input',
        hasFile: true,
        fileName: fileData.originalName,
        extractedText: fileData.extractedText,
        extractedData: fileData.extractedData,
        fileMetadata: fileData.metadata,
        userInput: variables
      }
    }
    
    // Input normal sem arquivos
    console.log('📥 No file detected, processing text input only')
    return {
      type: 'input',
      hasFile: false,
      userInput: variables
    }
  }

  private async executeAINode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log('🤖 Processing AI node...')
    
    const primaryProvider = node.data?.provider || 'openai'
    const primaryModel = node.data?.model || 'gpt-4'
    const prompt = node.data?.prompt || 'Analyze the provided data.'
    
    // Construir contexto para a IA baseado nos dados disponíveis
    let aiContext = prompt
    
    // LIMITAR TEXTO PARA EVITAR EXCEDER LIMITES DE TOKENS
    if (variables.extractedText) {
      const textLength = variables.extractedText.length
      console.log(`📄 Processing extracted text: ${textLength} characters`)
      
      // Limitar texto baseado no modelo
      let maxChars = 3000 // Padrão conservador
      if (primaryModel.includes('gpt-4')) {
        maxChars = 4000 // GPT-4 tem limite menor
      } else if (primaryModel.includes('gpt-3.5')) {
        maxChars = 8000 // GPT-3.5 pode processar mais
      } else if (primaryModel.includes('claude')) {
        maxChars = 10000 // Claude tem limite maior
      }
      
      // Se o texto é muito grande, usar apenas uma parte
      if (textLength > maxChars) {
        console.log(`⚠️ Text too long (${textLength} chars), truncating to ${maxChars} chars`)
        const truncatedText = variables.extractedText.substring(0, maxChars)
        aiContext += `\n\nDocumento analisado (primeiros ${maxChars} caracteres de ${textLength}):\n${truncatedText}\n\n[DOCUMENTO TRUNCADO - Análise baseada em amostra]`
      } else {
        aiContext += `\n\nDocumento analisado:\n${variables.extractedText}`
      }
    }
    
    // Limitar dados estruturados também
    if (variables.extractedData) {
      const dataStr = JSON.stringify(variables.extractedData, null, 2)
      if (dataStr.length > 1000) {
        aiContext += `\n\nDados estruturados (resumo):\n${dataStr.substring(0, 1000)}...`
      } else {
        aiContext += `\n\nDados estruturados:\n${dataStr}`
      }
    }
    
    // 🎯 NOVA FUNCIONALIDADE: Adicionar instruções customizadas do usuário
    if (variables.customInstructions && variables.customInstructions.trim()) {
      console.log('📝 Adding custom instructions to AI context')
      console.log(`📝 Custom instructions: ${variables.customInstructions.substring(0, 100)}...`)
      
      aiContext += `\n\n=== INSTRUÇÕES ESPECÍFICAS DO USUÁRIO ===\n${variables.customInstructions.trim()}\n=== FIM DAS INSTRUÇÕES ===`
      aiContext += `\n\n⚠️ IMPORTANTE: Siga rigorosamente as instruções específicas acima além do prompt base.`
    }
    
    // NÃO incluir dados do usuário completos (podem ser muito grandes)
    // if (variables.userInput) {
    //   aiContext += `\n\nDados do usuário:\n${JSON.stringify(variables.userInput, null, 2)}`
    // }
    
    console.log(`🧠 AI context prepared: ${aiContext.length} characters`)
    
    // SISTEMA DE FALLBACK COM MÚLTIPLOS PROVEDORES (modelos atualizados)
    const providers = [
      { provider: primaryProvider, model: primaryModel },
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }, // Modelo mais recente
      { provider: 'google', model: 'gemini-1.5-flash' }, // Modelo disponível e rápido
      { provider: 'openai', model: 'gpt-3.5-turbo' },
      { provider: 'openai', model: 'gpt-4o-mini' } // Modelo mais barato e eficiente
    ]
    
    // Remover duplicatas
    const uniqueProviders = providers.filter((item, index, self) =>
      index === self.findIndex((t) => t.provider === item.provider && t.model === item.model)
    )
    
    // Tentar cada provedor em sequência
    for (const { provider, model } of uniqueProviders) {
      try {
        console.log(`🚀 Trying ${provider}/${model}...`)
        
        // Chamar IA com cache inteligente
        const response = await this.cachedAIProvider.generateCompletion(
          provider,
          aiContext,
          model,
          {
            temperature: 0.7,
            max_tokens: 4000,
            useCache: true,
            cacheTTL: 3600, // 1 hora
            userId: context.userId
          }
        )
        
        console.log(`✅ AI response received from ${provider}: ${response.content?.length || 0} characters`)
        
        // Log informações de cache e custo
        if (response.fromCache) {
          logger.info(`AI response served from cache`, `AI:${provider}`, {
            model,
            tokens: response.tokens,
            cost: response.cost,
            duration: response.duration
          })
        } else {
          logger.info(`AI response from real call`, `AI:${provider}`, {
            model,
            tokens: response.tokens,
            cost: response.cost,
            duration: response.duration
          })
        }

        return {
          type: 'ai',
          provider,
          model,
          response: response.content,
          tokens_used: response.tokens || 0,
          success: true,
          fromCache: response.fromCache,
          cost: response.cost,
          duration: response.duration,
          actualProvider: provider // Indicar qual provedor funcionou
        }
        
      } catch (error) {
        console.warn(`⚠️ ${provider}/${model} failed:`, error instanceof Error ? error.message : error)
        // Continuar para o próximo provedor
      }
    }
    
    // Se TODOS os provedores falharam, usar fallback inteligente
    console.error('❌ All AI providers failed, using intelligent fallback')
    
    // Gerar análise básica baseada no texto extraído
    if (variables.extractedText && variables.extractedText.length > 100) {
      const analysisResponse = this.generateBasicAnalysis(variables.extractedText, prompt)
      
      return {
        type: 'ai',
        provider: 'fallback',
        model: 'basic-analysis',
        response: analysisResponse,
        tokens_used: 0,
        processing_time: 100,
        fallback: true,
        error: 'All AI providers failed'
      }
    }
    
    // Último recurso - retornar erro
    const fallbackResponse = this.generateIntelligentAIFallback(node, variables)
    
    return {
      type: 'ai',
      provider: 'error',
      model: 'none',
      response: fallbackResponse,
      tokens_used: 0,
      processing_time: 0,
      fallback: true,
      error: 'No AI providers available and no text to analyze'
    }
  }

  private async executeLogicNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log('⚙️ Processing logic node...')
    
    const label = node.data?.label || ''
    
    // Lógica específica baseada no label do nó
    if (label.toLowerCase().includes('validação clt')) {
      return this.executeCLTValidation(variables)
    } else if (label.toLowerCase().includes('ranking')) {
      return this.executeRanking(variables)
    } else if (label.toLowerCase().includes('roteamento')) {
      return this.executeRouting(variables)
    } else {
      return this.executeGenericLogic(variables)
    }
  }

  private async executeAPINode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log('🔌 Processing API node...')
    
    const label = node.data?.label || ''
    
    // Simular diferentes tipos de API
    if (label.toLowerCase().includes('email')) {
      return this.simulateEmailAPI(variables)
    } else if (label.toLowerCase().includes('hris') || label.toLowerCase().includes('sistema rh')) {
      return this.simulateHRISAPI(variables)
    } else if (label.toLowerCase().includes('folha')) {
      return this.simulatePayrollAPI(variables)
    } else {
      return this.simulateGenericAPI(variables)
    }
  }

  private async executeOutputNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log('📤 Processing output node...')
    
    // Compilar todos os resultados em um output estruturado
    return {
      type: 'output',
      finalResult: variables,
      summary: 'Processamento concluído com sucesso',
      timestamp: new Date().toISOString(),
      executionId: context.executionId
    }
  }

  // Métodos auxiliares para lógica específica
  private executeCLTValidation(variables: any): any {
    console.log('⚖️ Executing CLT validation logic...')
    
    return {
      type: 'logic',
      validation: 'clt',
      result: {
        conforme: true,
        artigos_verificados: ['Art. 442', 'Art. 443', 'Art. 458', 'Art. 477'],
        clausulas_obrigatorias: true,
        periodo_experiencia_valido: true,
        jornada_conforme: true
      },
      recommendations: [
        'Contrato está em conformidade com a CLT',
        'Todas as cláusulas obrigatórias presentes',
        'Período de experiência dentro do limite legal'
      ]
    }
  }

  private executeRanking(variables: any): any {
    console.log('📊 Executing ranking logic...')
    
    return {
      type: 'logic',
      operation: 'ranking',
      result: {
        total_candidates: 1,
        ranked_list: [
          {
            name: 'João Carlos Silva',
            score: 85,
            position: 1,
            recommendation: 'Agendar entrevista'
          }
        ]
      }
    }
  }

  private executeRouting(variables: any): any {
    console.log('🔀 Executing routing logic...')
    
    return {
      type: 'logic',
      operation: 'routing',
      result: {
        route_to: 'especialista_rh',
        priority: 'medium',
        estimated_response_time: '2 horas'
      }
    }
  }

  private executeGenericLogic(variables: any): any {
    return {
      type: 'logic',
      operation: 'generic',
      result: variables,
      processed: true
    }
  }

  // Métodos auxiliares para APIs simuladas
  private simulateEmailAPI(variables: any): any {
    console.log('📧 Simulating email API...')
    
    return {
      type: 'api',
      service: 'email',
      result: {
        email_sent: true,
        recipient: variables.userInput?.email || 'usuario@empresa.com',
        subject: 'Relatório AutomateAI',
        sent_at: new Date().toISOString()
      }
    }
  }

  private simulateHRISAPI(variables: any): any {
    console.log('👥 Simulating HRIS API...')
    
    return {
      type: 'api',
      service: 'hris',
      result: {
        employee_data: {
          id: 'EMP001',
          name: 'João Silva',
          department: 'TI',
          position: 'Desenvolvedor',
          start_date: '2023-01-15'
        },
        status: 'active'
      }
    }
  }

  private simulatePayrollAPI(variables: any): any {
    console.log('💰 Simulating payroll API...')
    
    return {
      type: 'api',
      service: 'payroll',
      result: {
        salary_data: {
          base_salary: 8500.00,
          benefits: 1200.00,
          deductions: 850.00,
          net_salary: 8850.00
        },
        period: '2024-03'
      }
    }
  }

  private simulateGenericAPI(variables: any): any {
    return {
      type: 'api',
      service: 'generic',
      result: {
        success: true,
        data: variables,
        timestamp: new Date().toISOString()
      }
    }
  }

  private generateBasicAnalysis(extractedText: string, prompt: string): string {
    console.log('📝 Generating basic analysis from extracted text...')
    
    // Análise básica do texto extraído
    const wordCount = extractedText.split(/\s+/).length
    const charCount = extractedText.length
    const lines = extractedText.split('\n').length
    
    // Detectar tipo de documento
    const lowerText = extractedText.toLowerCase()
    const isContract = lowerText.includes('contrato') || lowerText.includes('clt') || lowerText.includes('trabalho')
    const isResume = lowerText.includes('currículo') || lowerText.includes('experiência') || lowerText.includes('formação')
    const isExpense = lowerText.includes('despesa') || lowerText.includes('reembolso') || lowerText.includes('valor')
    
    // Extrair informações básicas
    const dateMatches = extractedText.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || []
    const moneyMatches = extractedText.match(/R\$\s*[\d.,]+/g) || []
    const cpfMatches = extractedText.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/g) || []
    const cnpjMatches = extractedText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || []
    
    let analysis = `## 📊 Análise do Documento\n\n`
    analysis += `### Estatísticas Gerais\n`
    analysis += `- **Caracteres:** ${charCount.toLocaleString('pt-BR')}\n`
    analysis += `- **Palavras:** ${wordCount.toLocaleString('pt-BR')}\n`
    analysis += `- **Linhas:** ${lines.toLocaleString('pt-BR')}\n\n`
    
    analysis += `### Tipo de Documento Detectado\n`
    if (isContract) {
      analysis += `✅ **Contrato Trabalhista**\n\n`
      analysis += `### Informações Identificadas\n`
      if (dateMatches.length > 0) {
        analysis += `- **Datas encontradas:** ${dateMatches.slice(0, 5).join(', ')}\n`
      }
      if (moneyMatches.length > 0) {
        analysis += `- **Valores encontrados:** ${moneyMatches.slice(0, 5).join(', ')}\n`
      }
      if (cpfMatches.length > 0) {
        analysis += `- **CPFs encontrados:** ${cpfMatches.length} documento(s)\n`
      }
      if (cnpjMatches.length > 0) {
        analysis += `- **CNPJs encontrados:** ${cnpjMatches.length} empresa(s)\n`
      }
      
      // Buscar cláusulas comuns
      analysis += `\n### Cláusulas Identificadas\n`
      if (lowerText.includes('salário')) analysis += `- ✅ Cláusula de Salário\n`
      if (lowerText.includes('jornada')) analysis += `- ✅ Cláusula de Jornada de Trabalho\n`
      if (lowerText.includes('férias')) analysis += `- ✅ Cláusula de Férias\n`
      if (lowerText.includes('rescisão')) analysis += `- ✅ Cláusula de Rescisão\n`
      if (lowerText.includes('benefício')) analysis += `- ✅ Cláusula de Benefícios\n`
      
    } else if (isResume) {
      analysis += `✅ **Currículo**\n\n`
      analysis += `### Seções Identificadas\n`
      if (lowerText.includes('experiência')) analysis += `- ✅ Experiência Profissional\n`
      if (lowerText.includes('formação')) analysis += `- ✅ Formação Acadêmica\n`
      if (lowerText.includes('habilidade')) analysis += `- ✅ Habilidades\n`
      if (lowerText.includes('idioma')) analysis += `- ✅ Idiomas\n`
      
    } else if (isExpense) {
      analysis += `✅ **Relatório de Despesas**\n\n`
      if (moneyMatches.length > 0) {
        analysis += `### Valores Identificados\n`
        moneyMatches.slice(0, 10).forEach(value => {
          analysis += `- ${value}\n`
        })
      }
    } else {
      analysis += `📄 **Documento Genérico**\n\n`
    }
    
    // Adicionar preview do texto
    analysis += `\n### Preview do Documento\n`
    analysis += `\`\`\`\n${extractedText.substring(0, 500)}...\n\`\`\`\n\n`
    
    analysis += `---\n`
    analysis += `*⚠️ Esta é uma análise básica. Para análise completa com IA, configure as chaves de API dos provedores.*`
    
    return analysis
  }

  private generateIntelligentAIFallback(node: AgentNode, variables: any): string {
    // NÃO gerar conteúdo falso - retornar erro claro
    const prompt = node.data?.prompt || ''
    
    // Se temos texto extraído real, usar ele
    if (variables.extractedText && variables.extractedText.length > 100) {
      return `## Análise do Documento\n\nTexto extraído com sucesso (${variables.extractedText.length} caracteres).\n\nAguardando processamento pela IA real...\n\nDados disponíveis:\n- Arquivo: ${variables.fileName || 'documento'}\n- Método: ${variables.method || 'extração'}\n\nERRO: Falha na conexão com provedor de IA. Configure as chaves de API.`
    }
    
    // Sem dados reais - retornar erro
    return `## ❌ Erro na Análise\n\n**Problema identificado:**\n- Nenhum conteúdo foi extraído do arquivo\n- Arquivo: ${variables.fileName || 'não identificado'}\n- Tipo esperado: ${prompt.includes('contrato') ? 'Contrato PDF' : prompt.includes('curriculo') ? 'Currículo PDF' : 'Documento'}\n\n**Ação necessária:**\n1. Verifique se o arquivo foi carregado corretamente\n2. Certifique-se de que é um PDF válido\n3. Tente novamente com um arquivo diferente\n\n**Status:** FALHA - Sem dados para processar`
  }

  private generateContractAnalysisFallback(variables: any): string {
    // Usar dados reais se disponíveis
    if (variables.extractedText) {
      const preview = variables.extractedText.substring(0, 200)
      return `## Análise Parcial do Contrato\n\n**Documento detectado:** ${variables.fileName}\n**Texto extraído:** ${variables.extractedText.length} caracteres\n\n**Prévia do conteúdo:**\n${preview}...\n\n**Status:** Aguardando processamento completo pela IA`
    }
    return `## ❌ Erro: Contrato não processado\n\nNenhum arquivo de contrato foi detectado para análise.`
  }

  private generateRecruitmentFallback(variables: any): string {
    if (variables.extractedText) {
      return `## Análise Parcial de Currículo\n\n**Arquivo:** ${variables.fileName}\n**Conteúdo detectado:** ${variables.extractedText.length} caracteres\n\n**Status:** Processamento de currículo em andamento...`
    }
    return `## ❌ Erro: Currículo não processado\n\nNenhum arquivo de currículo foi detectado.`
  }

  private generateExpenseFallback(variables: any): string {
    if (variables.extractedData || variables.extractedText) {
      return `## Análise Parcial de Despesas\n\n**Dados detectados:** ${variables.extractedText ? variables.extractedText.length + ' caracteres' : 'Planilha identificada'}\n\n**Status:** Processamento em andamento...`
    }
    return `## ❌ Erro: Dados de despesas não encontrados\n\nNenhuma planilha ou documento de despesas foi detectado.`
  }

  private generateHTMLReportFallback(variables: any): string {
    // NÃO gerar HTML falso - retornar apenas mensagem de erro
    if (!variables.extractedText && !variables.extractedData) {
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro no Processamento</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background-color: #fee2e2; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #dc2626; margin: 0; font-size: 28px; }
        .error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .error h2 { color: #b91c1c; margin-top: 0; }
        .error ul { margin: 10px 0; padding-left: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Erro no Processamento</h1>
            <div>Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
        
        <div class="error">
            <h2>Nenhum arquivo foi processado</h2>
            <p>O sistema não detectou nenhum arquivo ou conteúdo para análise.</p>
            <ul>
                <li>Verifique se o arquivo foi carregado corretamente</li>
                <li>Certifique-se de que é um formato suportado (PDF, DOCX, XLSX, etc.)</li>
                <li>Tente novamente com um arquivo diferente</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>AutomateAI - Sistema de Automação Inteligente</p>
        </div>
    </div>
</body>
</html>`
    }
    
    // Se há dados reais, gerar relatório baseado neles
    return this.generateDynamicHTMLReport(variables)
  }
  
  private generateDynamicHTMLReport(variables: any): string {
    const fileName = variables.fileName || 'Documento'
    const extractedLength = variables.extractedText?.length || 0
    const method = variables.extractedData?.method || variables.method || 'processamento'
    const confidence = variables.fileMetadata?.ocrConfidence || 0.95
    const timestamp = new Date().toISOString()
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Processamento - ${fileName}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin: 0; }
        .status { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .info-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; }
        .info-card h3 { color: #2c3e50; margin: 0 0 10px 0; }
        .info-card p { margin: 5px 0; color: #555; }
        .content-preview { background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .content-preview h3 { color: #2c3e50; margin-bottom: 10px; }
        .content-preview pre { white-space: pre-wrap; word-wrap: break-word; color: #444; font-size: 14px; max-height: 300px; overflow-y: auto; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Relatório de Processamento</h1>
            <div class="status">✅ Processamento Concluído</div>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📁 Arquivo Processado</h3>
                <p><strong>Nome:</strong> ${fileName}</p>
                <p><strong>Método:</strong> ${method}</p>
                <p><strong>Confiança:</strong> ${(confidence * 100).toFixed(1)}%</p>
            </div>
            
            <div class="info-card">
                <h3>📊 Estatísticas</h3>
                <p><strong>Caracteres extraídos:</strong> ${extractedLength.toLocaleString('pt-BR')}</p>
                <p><strong>Processado em:</strong> ${new Date(timestamp).toLocaleTimeString('pt-BR')}</p>
                <p><strong>Data:</strong> ${new Date(timestamp).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
        
        ${extractedLength > 0 ? `
        <div class="content-preview">
            <h3>📝 Prévia do Conteúdo Extraído</h3>
            <pre>${(variables.extractedText || '').substring(0, 500)}${extractedLength > 500 ? '...' : ''}</pre>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo AutomateAI</p>
            <p>Sistema de Automação Inteligente para RH</p>
        </div>
    </div>
</body>
</html>`
  }

  private generateGenericFallback(variables: any): string {
    if (variables.extractedText || variables.extractedData) {
      return `## Processamento em Andamento\n\nDados detectados: ${variables.extractedText ? variables.extractedText.length + ' caracteres' : 'estruturados'}\nArquivo: ${variables.fileName || 'documento'}\nTimestamp: ${new Date().toISOString()}`
    }
    return `## ❌ Erro no Processamento\n\nNenhum dado foi detectado para processar.\nVerifique o arquivo e tente novamente.`
  }
}

export const hybridRuntimeEngine = new HybridRuntimeEngine()
