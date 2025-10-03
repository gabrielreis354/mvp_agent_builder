'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  StopCircle, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  FileText,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Square
} from 'lucide-react'
import { Agent, AgentExecution, ExecutionLog } from '@/types/agent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { agentAPI, llmAPI } from '@/lib/api'

interface AgentExecutorProps {
  agent: Agent
  onExecutionComplete?: (execution: AgentExecution) => void
}

export function AgentExecutor({ agent, onExecutionComplete }: AgentExecutorProps) {
  const [execution, setExecution] = useState<AgentExecution | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<ExecutionLog[]>([])

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return

    setIsExecuting(true)
    setLogs([])

    try {
      // Start execution
      const newExecution = await agentAPI.executeAgent(agent.id, { text: input })
      setExecution(newExecution)

      // Poll for updates
      const pollInterval = setInterval(async () => {
        try {
          const updatedExecution = await agentAPI.getExecution(newExecution.id)
          setExecution(updatedExecution)
          setLogs(updatedExecution.logs)

          if (updatedExecution.status === 'completed' || updatedExecution.status === 'failed') {
            clearInterval(pollInterval)
            setIsExecuting(false)
            onExecutionComplete?.(updatedExecution)
          }
        } catch (error) {
          console.error('Error polling execution:', error)
          clearInterval(pollInterval)
          setIsExecuting(false)
        }
      }, 1000)

      // Cleanup after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval)
        setIsExecuting(false)
      }, 30000)

    } catch (error) {
      console.error('Error executing agent:', error)
      setIsExecuting(false)
    }
  }

  const handleStop = () => {
    setIsExecuting(false)
    if (execution) {
      setExecution({ ...execution, status: 'failed', error: 'Execution stopped by user' })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-900/20'
      case 'completed': return 'border-green-500 bg-green-900/20'
      case 'failed': return 'border-red-500 bg-red-900/20'
      default: return 'border-gray-500 bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Executar Agente: {agent.name}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Forneça os dados de entrada para processar com o agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dados de Entrada
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite o texto, cole um documento ou forneça os dados para processamento..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                disabled={isExecuting}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleExecute}
                disabled={!input.trim() || isExecuting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Agente
                  </>
                )}
              </Button>

              {isExecuting && (
                <Button
                  onClick={handleStop}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Status */}
      {execution && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${getStatusColor(execution.status)}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {getStatusIcon(execution.status)}
                  Status da Execução
                </CardTitle>
                <CardDescription className="text-gray-400">
                  ID: {execution.id} • Iniciado em {execution.startTime.toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {execution.status === 'completed' ? '100%' : 
                       execution.status === 'running' ? '...' : '0%'}
                    </div>
                    <div className="text-xs text-gray-400">Progresso</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${execution.cost.total.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400">Custo Total</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {execution.cost.breakdown.reduce((sum, b) => sum + b.tokens, 0)}
                    </div>
                    <div className="text-xs text-gray-400">Tokens Usados</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {execution.endTime 
                        ? `${execution.endTime.getTime() - execution.startTime.getTime()}ms`
                        : '...'
                      }
                    </div>
                    <div className="text-xs text-gray-400">Duração</div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                {execution.cost.breakdown.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Detalhamento de Custos:</h4>
                    <div className="space-y-2">
                      {execution.cost.breakdown.map((cost, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">
                              {cost.provider} • {cost.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">{cost.tokens} tokens</span>
                            <span className="text-green-400">${cost.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Logs */}
                {logs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Log de Execução:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 p-2 bg-gray-900/30 rounded text-xs">
                          <div className="text-gray-500 min-w-0 flex-shrink-0">
                            {log.timestamp.toLocaleTimeString()}
                          </div>
                          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                            log.level === 'error' ? 'bg-red-400' :
                            log.level === 'warn' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`} />
                          <div className="text-gray-300 min-w-0">{log.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output */}
                {execution.output && (
                  <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-green-400" />
                      <h4 className="text-sm font-medium text-green-300">Resultado:</h4>
                    </div>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {typeof execution.output === 'string' 
                        ? execution.output 
                        : JSON.stringify(execution.output, null, 2)
                      }
                    </pre>
                  </div>
                )}

                {/* Error */}
                {execution.error && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <h4 className="text-sm font-medium text-red-300">Erro:</h4>
                    </div>
                    <p className="text-sm text-red-300">{execution.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
