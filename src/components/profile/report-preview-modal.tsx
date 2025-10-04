'use client'

import { useState } from 'react'
import { X, Download, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { JsonViewer } from '@/components/ui/json-viewer'
import type { ReportCache } from '@/lib/services/report-service-prisma'

interface ReportPreviewModalProps {
  report: ReportCache
  onClose: () => void
}

export function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const content = report.result.extractedText || 
                   JSON.stringify(report.result.fields, null, 2)
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (report.result.htmlReport) {
      const blob = new Blob([report.result.htmlReport], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-${report.id}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {report.fileName || report.agentName}
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{report.type}</Badge>
                <span className="text-sm text-gray-400">
                  {new Date(report.timestamp).toLocaleString('pt-BR')}
                </span>
                {report.result.metadata?.confidence && (
                  <Badge variant="outline" className="text-xs">
                    Confiança: {Math.round(report.result.metadata.confidence * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="bg-gray-800 mb-6">
                <TabsTrigger value="fields">Campos Extraídos</TabsTrigger>
                <TabsTrigger value="text">Texto Completo</TabsTrigger>
                <TabsTrigger value="metadata">Metadados</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="space-y-4">
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <JsonViewer data={report.result.fields || report.result} />
                </div>
              </TabsContent>

              <TabsContent value="text">
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono">
                    {report.result.extractedText || 
                     report.result.summary || 
                     'Nenhum texto disponível'}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="metadata">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Informações do Processamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">ID da Execução</label>
                        <p className="text-gray-300 font-mono text-sm">{report.executionId}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Status</label>
                        <p className="text-gray-300">{report.status}</p>
                      </div>
                      {report.result.metadata?.pages && (
                        <div>
                          <label className="text-xs text-gray-400">Páginas</label>
                          <p className="text-gray-300">{report.result.metadata.pages}</p>
                        </div>
                      )}
                      {report.result.metadata?.processingTime && (
                        <div>
                          <label className="text-xs text-gray-400">Tempo de Processamento</label>
                          <p className="text-gray-300">
                            {report.result.metadata.processingTime.toFixed(2)}s
                          </p>
                        </div>
                      )}
                      {report.result.metadata?.tokensUsed && (
                        <div>
                          <label className="text-xs text-gray-400">Tokens Utilizados</label>
                          <p className="text-gray-300">
                            {report.result.metadata.tokensUsed.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      )}
                      {report.result.metadata?.model && (
                        <div>
                          <label className="text-xs text-gray-400">Modelo</label>
                          <p className="text-gray-300">{report.result.metadata.model}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.fileName && (
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-3">Informações do Arquivo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400">Nome do Arquivo</label>
                          <p className="text-gray-300">{report.fileName}</p>
                        </div>
                        {report.fileSize && (
                          <div>
                            <label className="text-xs text-gray-400">Tamanho</label>
                            <p className="text-gray-300">
                              {(report.fileSize / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        )}
                        {report.fileType && (
                          <div>
                            <label className="text-xs text-gray-400">Tipo</label>
                            <p className="text-gray-300">{report.fileType}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
