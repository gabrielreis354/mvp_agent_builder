'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

interface ExecutionResult {
  executionId: string
  status: 'success' | 'error' | 'running'
  startTime: string
  endTime?: string
  duration?: number
  steps: ExecutionStep[]
  finalOutput?: any
  error?: string
  metadata?: {
    totalTokens?: number
    totalCost?: number
    provider?: string
  }
}

interface ExecutionStep {
  nodeId: string
  nodeName: string
  status: 'success' | 'error' | 'running' | 'pending'
  startTime: string
  endTime?: string
  duration?: number
  input?: any
  output?: any
  error?: string
}

interface ExecutionResultsModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  result: ExecutionResult
}

export function ExecutionResultsModal({ 
  isOpen, 
  onClose, 
  agentName, 
  result 
}: ExecutionResultsModalProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Resultado copiado para a área de transferência",
    })
  }

  const downloadResult = () => {
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${agentName}-${result.executionId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900/50 text-green-300 border-green-600'
      case 'error':
        return 'bg-red-900/50 text-red-300 border-red-600'
      case 'running':
        return 'bg-blue-900/50 text-blue-300 border-blue-600'
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-600'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Resultado da Execução
                  </h2>
                  <p className="text-sm text-gray-400">
                    {agentName} • {result.executionId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(result.status)}>
                  {result.status === 'success' ? 'Sucesso' : 
                   result.status === 'error' ? 'Erro' : 'Executando'}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Início</p>
                  <p className="text-sm font-medium text-white">
                    {formatTime(result.startTime)}
                  </p>
                </div>
                
                {result.endTime && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Fim</p>
                    <p className="text-sm font-medium text-white">
                      {formatTime(result.endTime)}
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Duração</p>
                  <p className="text-sm font-medium text-white">
                    {formatDuration(result.duration)}
                  </p>
                </div>
                
                {result.metadata?.totalTokens && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Tokens</p>
                    <p className="text-sm font-medium text-white">
                      {result.metadata.totalTokens.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Steps */}
              {result.steps && result.steps.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium text-white">Etapas de Execução</h3>
                  
                  <div className="space-y-3">
                    {result.steps.map((step, index) => (
                    <div
                      key={step.nodeId}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-white">
                            {step.nodeName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {step.nodeId}
                          </Badge>
                        </div>
                        
                        <span className="text-xs text-gray-400">
                          {formatDuration(step.duration)}
                        </span>
                      </div>

                      {step.error && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
                          {step.error}
                        </div>
                      )}

                      {step.output && step.status === 'success' && (
                        <div className="mt-2 p-2 bg-gray-700 rounded text-sm text-gray-300 font-mono">
                          {typeof step.output === 'string' 
                            ? step.output.slice(0, 200) + (step.output.length > 200 ? '...' : '')
                            : JSON.stringify(step.output, null, 2).slice(0, 200) + '...'
                          }
                        </div>
                      )}
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Output */}
              {result.finalOutput && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Resultado Final</h3>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Output</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(
                          typeof result.finalOutput === 'string' 
                            ? result.finalOutput 
                            : JSON.stringify(result.finalOutput, null, 2)
                        )}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    
                    <div className="bg-gray-900 rounded p-3 text-sm text-gray-200 font-mono max-h-40 overflow-y-auto">
                      {typeof result.finalOutput === 'string' 
                        ? result.finalOutput
                        : JSON.stringify(result.finalOutput, null, 2)
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="text-xs text-gray-400">
                ID: {result.executionId}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResult}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download JSON
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
