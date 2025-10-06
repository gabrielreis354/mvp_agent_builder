/**
 * Tratamento de Erros Específico para Runtime Engine
 */

import { 
  AppError, 
  ErrorHandler, 
  ValidationError, 
  FileProcessingError,
  AIProviderError,
  NodeExecutionError,
  withErrorHandling,
  retryWithBackoff
} from './error-handler'
import { AgentNode } from '@/types/agent'
import { logger } from '@/lib/utils/logger'

// Re-exportar classes de erro para uso externo
export { FileProcessingError, NodeExecutionError, ValidationError, AIProviderError } from './error-handler'

/**
 * Valida nó antes da execução
 */
export function validateNode(node: AgentNode): void {
  if (!node.id) {
    throw new ValidationError('node.id', 'ID do nó é obrigatório', { node })
  }

  if (!node.data?.nodeType) {
    throw new ValidationError('node.data.nodeType', 'Tipo do nó é obrigatório', { nodeId: node.id })
  }

  // Validações específicas por tipo
  switch (node.data.nodeType) {
    case 'ai':
      if (!node.data.prompt) {
        throw new ValidationError(
          'node.data.prompt',
          'Nó de IA requer um prompt',
          { nodeId: node.id, nodeLabel: node.data.label }
        )
      }
      if (!node.data.provider) {
        throw new ValidationError(
          'node.data.provider',
          'Nó de IA requer um provedor (openai, anthropic, google)',
          { nodeId: node.id, nodeLabel: node.data.label }
        )
      }
      break

    case 'api':
      if (!node.data.apiEndpoint) {
        throw new ValidationError(
          'node.data.apiEndpoint',
          'Nó de API requer um endpoint',
          { nodeId: node.id, nodeLabel: node.data.label }
        )
      }
      if (!node.data.apiMethod) {
        throw new ValidationError(
          'node.data.apiMethod',
          'Nó de API requer um método HTTP',
          { nodeId: node.id, nodeLabel: node.data.label }
        )
      }
      break

    case 'logic':
      if (!node.data.logicType) {
        throw new ValidationError(
          'node.data.logicType',
          'Nó de lógica requer um tipo (condition, transform, validate)',
          { nodeId: node.id, nodeLabel: node.data.label }
        )
      }
      break
  }
}

/**
 * Wrapper para execução de nó com tratamento de erro
 */
export async function executeNodeSafely(
  node: AgentNode,
  executeFn: () => Promise<any>,
  context: { executionId: string; agentId: string }
): Promise<{ success: true; data: any } | { success: false; error: AppError }> {
  // Validar nó antes de executar
  try {
    validateNode(node)
  } catch (error) {
    const appError = ErrorHandler.handle(error, {
      nodeId: node.id,
      nodeType: node.data?.nodeType,
      nodeLabel: node.data?.label,
      ...context
    })
    return { success: false, error: appError }
  }

  // Executar com tratamento de erro
  const result = await withErrorHandling(executeFn, {
    nodeId: node.id,
    nodeType: node.data?.nodeType,
    nodeLabel: node.data?.label,
    ...context
  })

  if (!result.success) {
    // Converter para NodeExecutionError se não for já
    if (!(result.error instanceof NodeExecutionError)) {
      const nodeError = new NodeExecutionError(
        node.id,
        node.data?.label || node.data?.nodeType || 'Unknown',
        result.error.technicalMessage,
        {
          originalError: result.error,
          ...context
        }
      )
      return { success: false, error: nodeError }
    }
  }

  return result
}

/**
 * Executa nó de IA com fallback automático entre providers
 */
export async function executeAINodeWithFallback(
  node: AgentNode,
  aiProviderManager: any,
  prompt: string,
  options: {
    preferredProvider?: string
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<any> {
  const providers = ['openai', 'google', 'anthropic']
  const preferredProvider = options.preferredProvider || node.data.provider || 'openai'
  
  // Colocar provider preferido primeiro
  const orderedProviders = [
    preferredProvider,
    ...providers.filter(p => p !== preferredProvider)
  ]

  let lastError: AppError | undefined

  for (const provider of orderedProviders) {
    try {
      logger.info(`🤖 Tentando provider: ${provider}`, 'AI_FALLBACK', {
        nodeId: node.id,
        attempt: orderedProviders.indexOf(provider) + 1
      })

      const result = await retryWithBackoff(
        () => aiProviderManager.generateCompletion(
          provider,
          prompt,
          options.model || node.data.model,
          {
            temperature: options.temperature || node.data.temperature,
            maxTokens: options.maxTokens || node.data.maxTokens
          }
        ),
        { maxRetries: 2, initialDelayMs: 1000 }
      )

      logger.info(`✅ Provider ${provider} bem-sucedido`, 'AI_FALLBACK', {
        nodeId: node.id,
        tokensUsed: result.tokens_used
      })

      return result
    } catch (error) {
      lastError = new AIProviderError(
        provider,
        error instanceof Error ? error.message : String(error),
        {
          nodeId: node.id,
          prompt: prompt.substring(0, 100),
          attempt: orderedProviders.indexOf(provider) + 1
        }
      )

      logger.warn(`⚠️ Provider ${provider} falhou, tentando próximo...`, 'AI_FALLBACK', {
        nodeId: node.id,
        error: lastError.technicalMessage
      })

      // Se não é o último provider, continuar
      if (provider !== orderedProviders[orderedProviders.length - 1]) {
        continue
      }
    }
  }

  // Todos os providers falharam
  throw new AppError({
    type: 'AI_PROVIDER_ERROR' as any,
    severity: 'CRITICAL' as any,
    userMessage: 'Todos os provedores de IA falharam. Tente novamente em alguns minutos.',
    technicalMessage: `All AI providers failed. Last error: ${lastError?.technicalMessage}`,
    context: {
      nodeId: node.id,
      providers: orderedProviders,
      lastError: lastError?.toJSON()
    },
    suggestedAction: 'Aguarde alguns minutos e tente novamente. Se o problema persistir, entre em contato com o suporte.',
    retryable: true
  })
}

/**
 * Valida texto extraído de arquivo
 */
export function validateExtractedText(
  text: string | undefined,
  context: { nodeId: string; nodeLabel: string; fileName?: string }
): void {
  if (!text || text.trim().length === 0) {
    throw new FileProcessingError(
      context.fileName || 'arquivo',
      'Não foi possível extrair texto do arquivo. O arquivo pode estar vazio, corrompido ou ser uma imagem escaneada.',
      {
        nodeId: context.nodeId,
        nodeLabel: context.nodeLabel,
        textLength: text?.length || 0
      }
    )
  }

  // Validar se texto tem conteúdo mínimo útil
  if (text.trim().length < 50) {
    throw new FileProcessingError(
      context.fileName || 'arquivo',
      'Texto extraído é muito curto. Verifique se o arquivo contém conteúdo válido.',
      {
        nodeId: context.nodeId,
        nodeLabel: context.nodeLabel,
        textLength: text.length,
        textPreview: text.substring(0, 100)
      }
    )
  }
}

/**
 * Valida se prompt requer documento mas não há texto
 */
export function validateDocumentRequirement(
  prompt: string,
  extractedText: string | undefined,
  context: { nodeId: string; nodeLabel: string }
): void {
  const promptLower = prompt.toLowerCase()
  const needsDocument = 
    promptLower.includes('documento') ||
    promptLower.includes('arquivo') ||
    promptLower.includes('pdf') ||
    promptLower.includes('contrato') ||
    promptLower.includes('currículo') ||
    promptLower.includes('analise') ||
    promptLower.includes('extraia')

  if (needsDocument && (!extractedText || extractedText.trim().length === 0)) {
    throw new AppError({
      type: 'VALIDATION_ERROR' as any,
      severity: 'HIGH' as any,
      userMessage: 'Este agente requer um documento, mas nenhum arquivo foi processado.',
      technicalMessage: 'AI node requires document but no extracted text available',
      context: {
        nodeId: context.nodeId,
        nodeLabel: context.nodeLabel,
        promptPreview: prompt.substring(0, 100),
        hasExtractedText: !!extractedText
      },
      suggestedAction: 'Faça upload de um documento (PDF, Word, etc) antes de executar este agente.',
      retryable: false
    })
  }
}

/**
 * Cria mensagem de erro amigável para usuário
 */
export function createUserFriendlyError(error: unknown): {
  title: string
  message: string
  suggestedAction: string
  canRetry: boolean
} {
  const appError = error instanceof AppError ? error : ErrorHandler.handle(error)

  return {
    title: getErrorTitle(appError.type),
    message: appError.userMessage,
    suggestedAction: appError.suggestedAction || 'Tente novamente.',
    canRetry: appError.retryable
  }
}

function getErrorTitle(errorType: string): string {
  const titles: Record<string, string> = {
    VALIDATION_ERROR: 'Erro de Validação',
    FILE_PROCESSING_ERROR: 'Erro ao Processar Arquivo',
    AI_PROVIDER_ERROR: 'Erro na IA',
    AI_QUOTA_EXCEEDED: 'Limite de Uso Atingido',
    NODE_EXECUTION_ERROR: 'Erro na Execução',
    EMAIL_ERROR: 'Erro ao Enviar Email',
    TIMEOUT_ERROR: 'Tempo Esgotado',
    NETWORK_ERROR: 'Erro de Conexão',
    UNKNOWN_ERROR: 'Erro Inesperado'
  }

  return titles[errorType] || 'Erro'
}
