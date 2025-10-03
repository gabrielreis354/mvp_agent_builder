import { Agent, AgentNode } from '@/types/agent'
import { ExecutionContext, ExecutionResult } from './engine'
import { UnifiedProcessor } from '@/lib/processors/unified-processor'
import { dynamicOutputGenerator, OutputGenerationConfig, GeneratedOutput } from '@/lib/output/dynamic-output-generator'
import { AIProviderManager } from '@/lib/ai-providers'
import { safeJsonParse } from '@/lib/utils/safe-json'
import { logger } from '@/lib/utils/logger'
import { CachedAIProvider, createCachedAIProvider } from '@/lib/ai/cached-ai-provider'

export interface HybridExecutionOptions {
  uploadedFiles?: File[];
  outputFormat?: 'pdf' | 'docx' | 'csv' | 'html' | 'json';
  outputTemplate?: 'professional' | 'executive' | 'technical' | 'simple';
  deliveryMethod?: 'email' | 'download';
  recipientEmail?: string;
  extractedText?: string;
  fileName?: string;
  organizationId?: string; // Multi-tenancy
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
    logger.info('Initializing hybrid runtime engine with Redis cache', 'HYBRID_ENGINE')
    
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

    // Inicializar AI Provider com cache Redis
    this.cachedAIProvider = createCachedAIProvider(this.aiProviderManager)
    logger.info('Cached AI Provider with Redis initialized', 'HYBRID_ENGINE')
  }

  async executeAgentHybrid(
    agent: Agent, 
    input: any, 
    userId: string,
    options: HybridExecutionOptions = {}
  ): Promise<HybridExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.startExecution(executionId, agent.id || 'unknown', agent.name || 'Unnamed Agent', userId, agent.nodes.length)

    const context: ExecutionContext = {
      executionId,
      agentId: agent.id || 'unknown',
      userId,
      organizationId: options.organizationId, // Multi-tenancy
      input,
      variables: { ...input },
      startTime: new Date()
    }

    try {
      // Processar arquivos se fornecidos
      if (options.uploadedFiles && options.uploadedFiles.length > 0) {
        const processor = new UnifiedProcessor()
        for (const file of options.uploadedFiles) {
          const result = await processor.processFile(file)
          if (result.success && result.data) {
            context.variables.processedFile = result.data
            context.variables.extractedText = result.data.extractedText
            logger.pdf(file.name, 'File processed successfully', {
              textLength: result.data.extractedText.length,
              method: result.method
            })
          }
        }
      }
      
      // Se texto já foi extraído previamente, usar ele
      if (options.extractedText) {
        context.variables.extractedText = options.extractedText
        context.variables.fileName = options.fileName || 'documento.pdf'
        logger.pdf(options.fileName || 'documento.pdf', 'Using pre-extracted text', {
          textLength: options.extractedText.length,
          method: 'pre-processed'
        })
      }

      // Executar nós do agente
      const nodeResults: Record<string, any> = {}
      const orderedNodes = this.getExecutionOrder(agent.nodes, agent.edges)
      
      for (const node of orderedNodes) {
        const nodeStartTime = Date.now()
        
        try {
          const result = await this.executeNode(node, context.variables, context)
          const nodeDuration = Date.now() - nodeStartTime
          
          nodeResults[node.id] = result
          
          // Corrigir spread de string: se result é string, não fazer spread
          if (typeof result === 'string') {
            context.variables = { ...context.variables, [node.id]: result }
          } else if (typeof result === 'object' && result !== null) {
            context.variables = { ...context.variables, ...result }
          } else {
            context.variables = { ...context.variables, [node.id]: result }
          }
          
          logger.logNodeExecution(
            executionId,
            node.id,
            node.data?.label || node.type || 'Unknown Node',
            true,
            nodeDuration,
            result
          )
          
        } catch (nodeError) {
          const nodeDuration = Date.now() - nodeStartTime
          
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
      logger.completeExecution(executionId, true)

      // Obter resultado final
      const lastNodeId = orderedNodes[orderedNodes.length - 1]?.id
      const finalOutput = nodeResults[lastNodeId] || context.variables

      return {
        executionId,
        success: true,
        output: finalOutput,
        executionTime,
        nodeResults
      }

    } catch (error) {
      const executionTime = Date.now() - context.startTime.getTime()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
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

  private async executeNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    console.log(`🔄 [HybridEngine] Executing node ${node.id} (${node.data.nodeType})`);
    
    switch (node.data.nodeType) {
      case 'input':
        return this.executeInputNode(node, variables, context)
      
      case 'ai':
        return this.executeAINodeWithCache(node, variables, context)
      
      case 'logic':
        return this.executeLogicNode(node, variables, context)
      
      case 'api':
        return this.executeAPINode(node, variables, context)
      
      case 'output':
        return this.executeOutputNode(node, variables, context)
      
      default:
        console.log(`⚠️ [HybridEngine] Unknown node type: ${node.data.nodeType}, returning variables`);
        return variables
    }
  }

  private async executeInputNode(node: AgentNode, input: any, context: ExecutionContext): Promise<any> {
    logger.debug('Executing input node', `EXEC:${context.executionId}`, { nodeId: node.id })
    
    // Se já temos arquivo processado, usar ele
    if (input && typeof input === 'object' && input.processedFile) {
      return {
        ...input,
        fileName: input.processedFile.originalName,
        extractedText: input.processedFile.extractedText,
        fileSize: input.processedFile.size,
        mimeType: input.processedFile.mimeType
      }
    }
    
    return input
  }

  private async executeAINodeWithCache(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    const { prompt, provider = 'anthropic', model = 'claude-3-5-haiku-20241022', temperature = 0.7 } = node.data
    
    if (!prompt) {
      throw new Error('AI node must have a prompt')
    }

    // Construir contexto da IA com variáveis
    let aiContext = prompt
    
    // 🎯 VALIDAÇÃO CRÍTICA: Se o prompt menciona documento/arquivo mas não há texto extraído, ABORTAR
    const promptLower = prompt.toLowerCase();
    const needsDocument = promptLower.includes('documento') || 
                          promptLower.includes('arquivo') || 
                          promptLower.includes('pdf') || 
                          promptLower.includes('contrato') ||
                          promptLower.includes('currículo') ||
                          promptLower.includes('analise') ||
                          promptLower.includes('extraia');
    
    if (needsDocument && (!variables.extractedText || variables.extractedText.trim().length === 0)) {
      logger.error('❌ AI node requires document but no text was extracted', `EXEC:${context.executionId}`, {
        nodeId: node.id,
        prompt: prompt.substring(0, 100),
        hasExtractedText: !!variables.extractedText,
        extractedTextLength: variables.extractedText?.length || 0
      });
      
      throw new Error(
        'Nenhum texto foi extraído do documento. Verifique se o arquivo foi enviado corretamente e se é um PDF válido. ' +
        'Não é possível prosseguir com a análise sem o conteúdo do documento.'
      );
    }
    
    if (variables.extractedText) {
      aiContext = `${prompt}\n\nTexto extraído do documento:\n${variables.extractedText}`
      logger.info(`📄 Document text added to AI context: ${variables.extractedText.length} characters`, `EXEC:${context.executionId}`);
    }

    try {
      // Usar AI Provider SEM cache para análises de documentos (cada documento é único)
      const response = await this.cachedAIProvider.generateCompletion(
        provider,
        aiContext,
        model,
        {
          temperature,
          max_tokens: 4000,
          useCache: false, // ❌ DESABILITAR cache para análises únicas
          cacheTTL: 0,
          userId: context.userId
        }
      )

      // Log informações de cache e custo
      if (response.fromCache) {
        logger.info(`💰 AI response served from cache - SAVED $${response.cost.toFixed(4)}`, `AI:${provider}`, {
          model,
          tokens: response.tokens,
          duration: response.duration,
          cacheHit: true
        })
      } else {
        logger.info(`🔥 AI response from real call - COST $${response.cost.toFixed(4)}`, `AI:${provider}`, {
          model,
          tokens: response.tokens,
          duration: response.duration,
          cacheHit: false
        })
      }

      // Retornar APENAS a resposta da IA como string
      // Metadados ficam apenas nos logs, não no fluxo de dados
      return response.content

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';
      logger.error('AI node execution failed', `AI:${provider}`, { model, error: errorMessage }, error as Error);
      // Não usar mais fallback com dados mockados. Propagar o erro.
      throw new Error(`AI provider ${provider} failed: ${errorMessage}`);
    }
  }

  private async executeLogicNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    logger.debug('Executing logic node', `EXEC:${context.executionId}`, { nodeId: node.id })
    
    // Implementação básica de lógica
    const { logicType } = node.data
    
    switch (logicType) {
      case 'validate':
        return { ...variables, validated: true }
      case 'transform':
        return { ...variables, transformed: true }
      case 'condition':
        return { ...variables, conditionEvaluated: true }
      default:
        return variables
    }
  }

  private async executeAPINode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    logger.debug('Executing API node', `EXEC:${context.executionId}`, { nodeId: node.id })
    
    // Implementação básica de API
    const { apiEndpoint, apiMethod = 'POST' } = node.data
    
    if (!apiEndpoint) {
      throw new Error('API endpoint is required')
    }

    // Simular chamada API por enquanto
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      status: 'success',
      endpoint: apiEndpoint,
      method: apiMethod,
      response: 'API call completed',
      input_sent: variables
    }
  }

  private async executeOutputNode(node: AgentNode, variables: any, context: ExecutionContext): Promise<any> {
    logger.debug('Executing output node', `EXEC:${context.executionId}`, { 
      nodeId: node.id,
      variableKeys: Object.keys(variables),
      variableTypes: Object.entries(variables).map(([k, v]) => `${k}: ${typeof v}`)
    })
    
    // PRIORIDADE 1: Buscar por nós de IA específicos primeiro
    for (const [key, value] of Object.entries(variables)) {
      if (key.startsWith('ai-') || key.includes('ai')) {
        if (typeof value === 'string' && value.length > 50) {
          // Verificar se não é apenas texto extraído (filtro mais específico)
          if (!value.includes('CNPJ: 12.345.678/0001-90') && 
              !value.includes('extractedText') &&
              !value.includes('filename')) {
            logger.debug('Found AI response in AI node variable', `EXEC:${context.executionId}`, { 
              key, 
              valueLength: value.length,
              preview: value.substring(0, 100) + '...'
            })
            return value
          } else {
            logger.debug('Skipped AI node - appears to be original text', `EXEC:${context.executionId}`, { 
              key, 
              reason: 'contains original contract identifiers'
            })
          }
        }
      }
    }
    
    // PRIORIDADE 2: Procurar por qualquer string que seja a resposta da IA
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string' && value.length > 50) {
        // Verificar se não é apenas texto extraído (filtro mais específico)
        if (!value.includes('CNPJ: 12.345.678/0001-90') && 
            !key.includes('extractedText') &&
            !value.includes('filename')) {
          logger.debug('Found AI response in variables', `EXEC:${context.executionId}`, { 
            key, 
            valueLength: value.length,
            preview: value.substring(0, 100) + '...'
          })
          return value
        }
      }
    }
    
    // Fallback: procurar por nós de IA específicos
    const aiNodeKeys = Object.keys(variables).filter(key => key.startsWith('ai-') || key.includes('ai'))
    for (const aiKey of aiNodeKeys) {
      const aiValue = variables[aiKey]
      if (typeof aiValue === 'string' && aiValue.length > 10) {
        logger.debug('Found AI response in AI node', `EXEC:${context.executionId}`, { 
          key: aiKey, 
          valueLength: aiValue.length,
          preview: aiValue.substring(0, 100) + '...'
        })
        return aiValue
      }
    }
    
    // Fallback final: retornar a primeira string não vazia
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        logger.debug('Found fallback string in variables', `EXEC:${context.executionId}`, { 
          key, 
          valueLength: value.length,
          preview: value.substring(0, 50) + '...'
        })
        return value
      }
    }
    
    // Se não encontrar nada, retornar objeto com debug info
    logger.warn('No AI response found in output node', `EXEC:${context.executionId}`, {
      availableKeys: Object.keys(variables),
      variableTypes: Object.entries(variables).map(([k, v]) => `${k}: ${typeof v}`)
    })
    
    return {
      message: 'No AI response found',
      timestamp: new Date().toISOString(),
      debug: {
        availableKeys: Object.keys(variables),
        variableTypes: Object.entries(variables).map(([k, v]) => `${k}: ${typeof v}`)
      }
    }
  }


  private getExecutionOrder(nodes: AgentNode[], edges: any[]): AgentNode[] {
    console.log('🔍 [HybridEngine] Ordering nodes for execution:', {
      totalNodes: nodes.length,
      nodeIds: nodes.map(n => n.id),
      nodeTypes: nodes.map(n => n.data?.nodeType),
      totalEdges: edges?.length || 0
    });
    
    // Se não há edges, executar em ordem simples: input -> ai -> output
    if (!edges || edges.length === 0) {
      const inputNodes = nodes.filter(n => n.data?.nodeType === 'input');
      const aiNodes = nodes.filter(n => n.data?.nodeType === 'ai');
      const outputNodes = nodes.filter(n => n.data?.nodeType === 'output');
      const otherNodes = nodes.filter(n => !['input', 'ai', 'output'].includes(n.data?.nodeType || ''));
      
      const orderedNodes = [...inputNodes, ...aiNodes, ...outputNodes, ...otherNodes];
      console.log('✅ [HybridEngine] Simple ordering (no edges):', orderedNodes.map(n => `${n.id}(${n.data?.nodeType || 'unknown'})`));
      return orderedNodes;
    }
    
    // Implementação de ordenação topológica baseada nas edges
    const visited = new Set<string>();
    const result: AgentNode[] = [];
    const inDegree = new Map<string, number>();
    
    // Calcular grau de entrada para cada nó
    nodes.forEach(node => inDegree.set(node.id, 0));
    edges.forEach(edge => {
      const currentDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, currentDegree + 1);
    });
    
    // Começar com nós que não têm dependências (grau 0)
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });
    
    // Processar nós em ordem topológica
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId);
      
      if (node && !visited.has(nodeId)) {
        visited.add(nodeId);
        result.push(node);
        
        // Reduzir grau de entrada dos nós conectados
        edges.forEach(edge => {
          if (edge.source === nodeId) {
            const targetDegree = inDegree.get(edge.target)! - 1;
            inDegree.set(edge.target, targetDegree);
            
            if (targetDegree === 0) {
              queue.push(edge.target);
            }
          }
        });
      }
    }
    
    // Adicionar nós restantes que não foram visitados
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        result.push(node);
      }
    });
    
    console.log('✅ [HybridEngine] Topological ordering:', result.map(n => `${n.id}(${n.data?.nodeType || 'unknown'})`));
    return result;
  }
}

// Singleton instance para compatibilidade
export const hybridRuntimeEngine = new HybridRuntimeEngine()
