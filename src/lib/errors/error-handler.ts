/**
 * Sistema Centralizado de Tratamento de Erros
 * Seguindo princípios de resiliência e fallbacks inteligentes
 */

import { logger } from '@/lib/utils/logger'

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

export enum ErrorType {
  // Erros de Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Erros de Processamento
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  PDF_EXTRACTION_ERROR = 'PDF_EXTRACTION_ERROR',
  TEXT_EXTRACTION_ERROR = 'TEXT_EXTRACTION_ERROR',
  
  // Erros de IA
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  
  // Erros de Execução
  NODE_EXECUTION_ERROR = 'NODE_EXECUTION_ERROR',
  AGENT_EXECUTION_ERROR = 'AGENT_EXECUTION_ERROR',
  WORKFLOW_ERROR = 'WORKFLOW_ERROR',
  
  // Erros de Integração
  API_ERROR = 'API_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Erros de Sistema
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',           // Erro recuperável, não afeta execução
  MEDIUM = 'MEDIUM',     // Erro recuperável com fallback
  HIGH = 'HIGH',         // Erro crítico, interrompe execução
  CRITICAL = 'CRITICAL'  // Erro sistêmico, requer atenção imediata
}

// ============================================================================
// CLASSE BASE DE ERRO
// ============================================================================

export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>
  public readonly timestamp: Date
  public readonly userMessage: string
  public readonly technicalMessage: string
  public readonly suggestedAction?: string
  public readonly retryable: boolean

  constructor(config: {
    type: ErrorType
    severity: ErrorSeverity
    userMessage: string
    technicalMessage: string
    context?: Record<string, any>
    suggestedAction?: string
    retryable?: boolean
    isOperational?: boolean
  }) {
    super(config.technicalMessage)
    
    this.type = config.type
    this.severity = config.severity
    this.userMessage = config.userMessage
    this.technicalMessage = config.technicalMessage
    this.context = config.context
    this.suggestedAction = config.suggestedAction
    this.retryable = config.retryable ?? false
    this.isOperational = config.isOperational ?? true
    this.timestamp = new Date()
    
    // Manter stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      type: this.type,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      context: this.context,
      suggestedAction: this.suggestedAction,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString()
    }
  }
}

// ============================================================================
// ERROS ESPECÍFICOS
// ============================================================================

export class ValidationError extends AppError {
  constructor(field: string, message: string, context?: Record<string, any>) {
    super({
      type: ErrorType.VALIDATION_ERROR,
      severity: ErrorSeverity.MEDIUM,
      userMessage: `Campo inválido: ${field}. ${message}`,
      technicalMessage: `Validation failed for field: ${field}`,
      context: { field, ...context },
      suggestedAction: 'Verifique os dados informados e tente novamente.',
      retryable: true
    })
  }
}

export class FileProcessingError extends AppError {
  constructor(fileName: string, reason: string, context?: Record<string, any>) {
    super({
      type: ErrorType.FILE_PROCESSING_ERROR,
      severity: ErrorSeverity.HIGH,
      userMessage: `Não foi possível processar o arquivo "${fileName}". ${reason}`,
      technicalMessage: `File processing failed: ${fileName}`,
      context: { fileName, reason, ...context },
      suggestedAction: 'Verifique se o arquivo está corrompido ou tente outro formato.',
      retryable: true
    })
  }
}

export class AIProviderError extends AppError {
  constructor(provider: string, reason: string, context?: Record<string, any>) {
    super({
      type: ErrorType.AI_PROVIDER_ERROR,
      severity: ErrorSeverity.HIGH,
      userMessage: `Erro ao processar com IA. Tentando provedor alternativo...`,
      technicalMessage: `AI Provider ${provider} failed: ${reason}`,
      context: { provider, reason, ...context },
      suggestedAction: 'O sistema tentará automaticamente outro provedor de IA.',
      retryable: true
    })
  }
}

export class AIQuotaExceededError extends AppError {
  constructor(provider: string, context?: Record<string, any>) {
    super({
      type: ErrorType.AI_QUOTA_EXCEEDED,
      severity: ErrorSeverity.CRITICAL,
      userMessage: `Limite de uso da IA atingido. Tente novamente em alguns minutos.`,
      technicalMessage: `AI quota exceeded for provider: ${provider}`,
      context: { provider, ...context },
      suggestedAction: 'Aguarde alguns minutos ou entre em contato com o suporte.',
      retryable: true
    })
  }
}

export class NodeExecutionError extends AppError {
  constructor(nodeId: string, nodeLabel: string, reason: string, context?: Record<string, any>) {
    super({
      type: ErrorType.NODE_EXECUTION_ERROR,
      severity: ErrorSeverity.HIGH,
      userMessage: `Erro ao executar etapa "${nodeLabel}". ${reason}`,
      technicalMessage: `Node execution failed: ${nodeId}`,
      context: { nodeId, nodeLabel, reason, ...context },
      suggestedAction: 'Verifique a configuração desta etapa e tente novamente.',
      retryable: true
    })
  }
}

export class EmailError extends AppError {
  constructor(recipient: string, reason: string, context?: Record<string, any>) {
    super({
      type: ErrorType.EMAIL_ERROR,
      severity: ErrorSeverity.MEDIUM,
      userMessage: `Não foi possível enviar email para ${recipient}. ${reason}`,
      technicalMessage: `Email sending failed to: ${recipient}`,
      context: { recipient, reason, ...context },
      suggestedAction: 'Verifique o endereço de email e tente novamente.',
      retryable: true
    })
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export class ErrorHandler {
  /**
   * Trata erro e retorna resposta padronizada
   */
  static handle(error: unknown, context?: Record<string, any>): AppError {
    // Se já é AppError, apenas logar e retornar
    if (error instanceof AppError) {
      this.logError(error)
      return error
    }

    // Se é Error nativo, converter para AppError
    if (error instanceof Error) {
      return this.convertNativeError(error, context)
    }

    // Erro desconhecido
    const unknownError = new AppError({
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
      technicalMessage: `Unknown error: ${String(error)}`,
      context: { originalError: error, ...context },
      suggestedAction: 'Tente novamente. Se o problema persistir, entre em contato com o suporte.',
      retryable: true
    })

    this.logError(unknownError)
    return unknownError
  }

  /**
   * Converte erro nativo para AppError
   */
  private static convertNativeError(error: Error, context?: Record<string, any>): AppError {
    const message = error.message.toLowerCase()

    // Detectar tipo de erro pela mensagem
    if (message.includes('quota') || message.includes('rate limit')) {
      return new AIQuotaExceededError('unknown', { originalError: error.message, ...context })
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return new AppError({
        type: ErrorType.TIMEOUT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'A operação demorou muito tempo. Tente novamente.',
        technicalMessage: error.message,
        context: { originalError: error.message, ...context },
        suggestedAction: 'Tente novamente com um arquivo menor ou aguarde alguns minutos.',
        retryable: true
      })
    }

    if (message.includes('network') || message.includes('fetch failed')) {
      return new AppError({
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Erro de conexão. Verifique sua internet.',
        technicalMessage: error.message,
        context: { originalError: error.message, ...context },
        suggestedAction: 'Verifique sua conexão com a internet e tente novamente.',
        retryable: true
      })
    }

    if (message.includes('pdf') || message.includes('file')) {
      return new FileProcessingError('arquivo', error.message, context)
    }

    // Erro genérico
    return new AppError({
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Ocorreu um erro durante o processamento.',
      technicalMessage: error.message,
      context: { originalError: error.message, stack: error.stack, ...context },
      suggestedAction: 'Tente novamente. Se o problema persistir, entre em contato com o suporte.',
      retryable: true
    })
  }

  /**
   * Loga erro de forma estruturada
   */
  private static logError(error: AppError): void {
    const logData = {
      type: error.type,
      severity: error.severity,
      message: error.technicalMessage,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(`🚨 CRITICAL: ${error.technicalMessage}`, 'ERROR_HANDLER', logData)
        // TODO: Enviar alerta para equipe (Sentry, Slack, etc)
        break
      
      case ErrorSeverity.HIGH:
        logger.error(`❌ HIGH: ${error.technicalMessage}`, 'ERROR_HANDLER', logData)
        break
      
      case ErrorSeverity.MEDIUM:
        logger.warn(`⚠️ MEDIUM: ${error.technicalMessage}`, 'ERROR_HANDLER', logData)
        break
      
      case ErrorSeverity.LOW:
        logger.info(`ℹ️ LOW: ${error.technicalMessage}`, 'ERROR_HANDLER', logData)
        break
    }
  }

  /**
   * Formata erro para resposta HTTP
   */
  static toHTTPResponse(error: AppError, includeStack = false) {
    const statusCode = this.getHTTPStatusCode(error.type)
    
    return {
      status: statusCode,
      body: {
        success: false,
        error: {
          type: error.type,
          message: error.userMessage,
          suggestedAction: error.suggestedAction,
          retryable: error.retryable,
          timestamp: error.timestamp.toISOString(),
          ...(includeStack && process.env.NODE_ENV === 'development' && {
            technicalDetails: {
              message: error.technicalMessage,
              context: error.context,
              stack: error.stack
            }
          })
        }
      }
    }
  }

  /**
   * Mapeia tipo de erro para status HTTP
   */
  private static getHTTPStatusCode(errorType: ErrorType): number {
    const statusMap: Record<ErrorType, number> = {
      [ErrorType.VALIDATION_ERROR]: 400,
      [ErrorType.MISSING_REQUIRED_FIELD]: 400,
      [ErrorType.INVALID_INPUT]: 400,
      [ErrorType.FILE_PROCESSING_ERROR]: 422,
      [ErrorType.PDF_EXTRACTION_ERROR]: 422,
      [ErrorType.TEXT_EXTRACTION_ERROR]: 422,
      [ErrorType.AI_PROVIDER_ERROR]: 503,
      [ErrorType.AI_QUOTA_EXCEEDED]: 429,
      [ErrorType.AI_TIMEOUT]: 504,
      [ErrorType.AI_INVALID_RESPONSE]: 502,
      [ErrorType.NODE_EXECUTION_ERROR]: 500,
      [ErrorType.AGENT_EXECUTION_ERROR]: 500,
      [ErrorType.WORKFLOW_ERROR]: 500,
      [ErrorType.API_ERROR]: 502,
      [ErrorType.EMAIL_ERROR]: 503,
      [ErrorType.DATABASE_ERROR]: 503,
      [ErrorType.TIMEOUT_ERROR]: 504,
      [ErrorType.NETWORK_ERROR]: 503,
      [ErrorType.UNKNOWN_ERROR]: 500
    }

    return statusMap[errorType] || 500
  }

  /**
   * Verifica se erro é recuperável
   */
  static isRecoverable(error: AppError): boolean {
    return error.retryable && error.severity !== ErrorSeverity.CRITICAL
  }

  /**
   * Sugere estratégia de retry
   */
  static getRetryStrategy(error: AppError): { shouldRetry: boolean; delayMs: number; maxRetries: number } {
    if (!error.retryable) {
      return { shouldRetry: false, delayMs: 0, maxRetries: 0 }
    }

    switch (error.type) {
      case ErrorType.AI_QUOTA_EXCEEDED:
        return { shouldRetry: true, delayMs: 60000, maxRetries: 3 } // 1 min
      
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return { shouldRetry: true, delayMs: 5000, maxRetries: 3 } // 5 seg
      
      case ErrorType.AI_PROVIDER_ERROR:
        return { shouldRetry: true, delayMs: 2000, maxRetries: 2 } // 2 seg (fallback para outro provider)
      
      case ErrorType.FILE_PROCESSING_ERROR:
        return { shouldRetry: true, delayMs: 1000, maxRetries: 2 } // 1 seg
      
      default:
        return { shouldRetry: true, delayMs: 3000, maxRetries: 2 } // 3 seg
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wrapper para executar função com tratamento de erro
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    const appError = ErrorHandler.handle(error, context)
    return { success: false, error: appError }
  }
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelayMs?: number
    maxDelayMs?: number
    backoffMultiplier?: number
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2
  } = options

  let lastError: Error | undefined
  let delay = initialDelayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, 'RETRY', {
          error: lastError.message
        })
        
        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * backoffMultiplier, maxDelayMs)
      }
    }
  }

  throw lastError
}
