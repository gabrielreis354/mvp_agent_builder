/**
 * Sistema de Logging Profissional
 * Substitui console.log/warn/error por logging estruturado
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  userId?: string
  executionId?: string
  error?: Error
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString()
    const levelName = LogLevel[entry.level]
    const context = entry.context ? `[${entry.context}]` : ''
    
    return `${timestamp} ${levelName} ${context} ${entry.message}`
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    }

    // Em desenvolvimento, usar console colorido
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry)
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug('🔍', formattedMessage, data || '')
          break
        case LogLevel.INFO:
          console.info('ℹ️', formattedMessage, data || '')
          break
        case LogLevel.WARN:
          console.warn('⚠️', formattedMessage, data || '')
          break
        case LogLevel.ERROR:
          console.error('❌', formattedMessage, data || '', error || '')
          break
        case LogLevel.FATAL:
          console.error('💀', formattedMessage, data || '', error || '')
          break
      }
    } else {
      // Em produção, usar JSON estruturado
      console.log(JSON.stringify(entry))
    }

    // TODO: Em produção, enviar para serviço de logging (Sentry, DataDog, etc.)
    if (level >= LogLevel.ERROR && !this.isDevelopment) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // TODO: Implementar integração com Sentry/DataDog
    // Por enquanto, apenas armazenar localmente para debug
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]')
      logs.push(entry)
      // Manter apenas os últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      localStorage.setItem('app_error_logs', JSON.stringify(logs))
    }
  }

  // Métodos públicos
  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data)
  }

  error(message: string, context?: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, message, context, data, error)
  }

  fatal(message: string, context?: string, data?: any, error?: Error) {
    this.log(LogLevel.FATAL, message, context, data, error)
  }

  // Métodos especializados para contextos específicos
  execution(executionId: string, message: string, data?: any) {
    this.info(message, `EXEC:${executionId}`, data)
  }

  api(endpoint: string, message: string, data?: any) {
    this.info(message, `API:${endpoint}`, data)
  }

  pdf(fileName: string, message: string, data?: any) {
    this.info(message, `PDF:${fileName}`, data)
  }

  ai(provider: string, message: string, data?: any) {
    this.info(message, `AI:${provider}`, data)
  }

  security(message: string, data?: any) {
    this.warn(message, 'SECURITY', data)
  }

  // Métodos específicos para execução de agentes
  startExecution(executionId: string, agentId: string, agentName: string, userId: string, nodeCount: number) {
    this.info(`Starting execution of agent "${agentName}" with ${nodeCount} nodes`, `EXEC:${executionId}`, {
      agentId,
      agentName,
      userId,
      nodeCount
    })
  }

  logNodeExecution(executionId: string, nodeId: string, nodeLabel: string, success: boolean, duration: number, result?: any) {
    const message = `Node "${nodeLabel}" ${success ? 'completed' : 'failed'} in ${duration}ms`
    if (success) {
      this.info(message, `EXEC:${executionId}:${nodeId}`, { duration, result })
    } else {
      this.error(message, `EXEC:${executionId}:${nodeId}`, { duration }, result as Error)
    }
  }

  completeExecution(executionId: string, success: boolean, errorMessage?: string) {
    if (success) {
      this.info(`Execution completed successfully`, `EXEC:${executionId}`)
    } else {
      this.error(`Execution failed: ${errorMessage}`, `EXEC:${executionId}`, { errorMessage })
    }
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export const log = logger
export default logger
