export interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  category: string
  message: string
  data?: any
  executionId?: string
  agentId?: string
  nodeId?: string
  userId?: string
  duration?: number
}

export interface ExecutionMetrics {
  executionId: string
  agentId: string
  agentName: string
  userId: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  totalNodes: number
  completedNodes: number
  failedNodes: number
  inputSize?: number
  outputSize?: number
  error?: string
}

export class ExecutionLogger {
  private logs: Map<string, LogEntry[]> = new Map()
  private metrics: Map<string, ExecutionMetrics> = new Map()

  log(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      ...entry
    }

    // Armazenar por executionId se disponível
    const key = entry.executionId || 'global'
    const existingLogs = this.logs.get(key) || []
    existingLogs.push(logEntry)
    this.logs.set(key, existingLogs)

    // Console output baseado no nível
    this.outputToConsole(logEntry)
  }

  debug(message: string, data?: any, context?: { executionId?: string; agentId?: string; nodeId?: string; userId?: string }): void {
    this.log({
      level: 'debug',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  info(message: string, data?: any, context?: { executionId?: string; agentId?: string; nodeId?: string; userId?: string }): void {
    this.log({
      level: 'info',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  warn(message: string, data?: any, context?: { executionId?: string; agentId?: string; nodeId?: string; userId?: string }): void {
    this.log({
      level: 'warn',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  error(message: string, error?: any, context?: { executionId?: string; agentId?: string; nodeId?: string; userId?: string }): void {
    this.log({
      level: 'error',
      category: 'system',
      message,
      data: error instanceof Error ? { 
        name: error.name, 
        message: error.message, 
        stack: error.stack 
      } : error,
      ...context
    })
  }

  startExecution(executionId: string, agentId: string, agentName: string, userId: string, totalNodes: number): void {
    const metrics: ExecutionMetrics = {
      executionId,
      agentId,
      agentName,
      userId,
      startTime: new Date().toISOString(),
      status: 'running',
      totalNodes,
      completedNodes: 0,
      failedNodes: 0
    }

    this.metrics.set(executionId, metrics)
    
    this.info(`Execution started: ${agentName}`, { totalNodes }, { 
      executionId, 
      agentId, 
      userId 
    })
  }

  completeExecution(executionId: string, success: boolean, error?: string): void {
    const metrics = this.metrics.get(executionId)
    if (!metrics) return

    const endTime = new Date().toISOString()
    const duration = new Date(endTime).getTime() - new Date(metrics.startTime).getTime()

    metrics.endTime = endTime
    metrics.duration = duration
    metrics.status = success ? 'completed' : 'failed'
    if (error) metrics.error = error

    this.metrics.set(executionId, metrics)

    const level = success ? 'info' : 'error'
    const message = success ? 'Execution completed successfully' : 'Execution failed'
    
    this.log({
      level,
      category: 'execution',
      message,
      data: { duration, success, error },
      executionId,
      agentId: metrics.agentId,
      userId: metrics.userId,
      duration
    })
  }

  logNodeExecution(executionId: string, nodeId: string, nodeName: string, success: boolean, duration: number, data?: any): void {
    const metrics = this.metrics.get(executionId)
    if (metrics) {
      if (success) {
        metrics.completedNodes++
      } else {
        metrics.failedNodes++
      }
      this.metrics.set(executionId, metrics)
    }

    this.log({
      level: success ? 'info' : 'error',
      category: 'node',
      message: `Node ${success ? 'completed' : 'failed'}: ${nodeName}`,
      data,
      executionId,
      nodeId,
      agentId: metrics?.agentId,
      userId: metrics?.userId,
      duration
    })
  }

  getExecutionLogs(executionId: string): LogEntry[] {
    return this.logs.get(executionId) || []
  }

  getExecutionMetrics(executionId: string): ExecutionMetrics | null {
    return this.metrics.get(executionId) || null
  }

  getAllMetrics(): ExecutionMetrics[] {
    return Array.from(this.metrics.values())
  }

  getRecentExecutions(limit: number = 10): ExecutionMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit)
  }

  getExecutionStats(): {
    total: number
    completed: number
    failed: number
    running: number
    avgDuration: number
  } {
    const allMetrics = Array.from(this.metrics.values())
    const completed = allMetrics.filter(m => m.status === 'completed')
    const failed = allMetrics.filter(m => m.status === 'failed')
    const running = allMetrics.filter(m => m.status === 'running')
    
    const avgDuration = completed.length > 0 
      ? completed.reduce((sum, m) => sum + (m.duration || 0), 0) / completed.length
      : 0

    return {
      total: allMetrics.length,
      completed: completed.length,
      failed: failed.length,
      running: running.length,
      avgDuration: Math.round(avgDuration)
    }
  }

  clearOldLogs(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    // Limpar logs antigos
    for (const [key, logs] of Array.from(this.logs.entries())) {
      const filteredLogs = logs.filter((log: LogEntry) => new Date(log.timestamp) > cutoffTime)
      if (filteredLogs.length > 0) {
        this.logs.set(key, filteredLogs)
      } else {
        this.logs.delete(key)
      }
    }

    // Limpar métricas antigas
    for (const [key, metrics] of Array.from(this.metrics.entries())) {
      if (new Date(metrics.startTime) <= cutoffTime) {
        this.metrics.delete(key)
      }
    }

    this.info(`Cleared logs older than ${olderThanHours} hours`)
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`
    const message = `${prefix} ${entry.message}`

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data)
        break
      case 'info':
        console.info(message, entry.data)
        break
      case 'warn':
        console.warn(message, entry.data)
        break
      case 'error':
        console.error(message, entry.data)
        break
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const executionLogger = new ExecutionLogger()
