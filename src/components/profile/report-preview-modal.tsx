'use client'

import { useState } from 'react'
import { X, Download, Copy, CheckCircle, Loader2 } from 'lucide-react'
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
  const [downloading, setDownloading] = useState(false)

  // Proteção contra dados inválidos
  if (!report || !report.result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <p className="text-white">Erro ao carregar relatório</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    const content = report.result.extractedText || 
                   JSON.stringify(report.result.fields, null, 2)
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Extrair título do metadata ou usar fallback
      const reportTitle = report.result?.metadata?.titulo_relatorio || 
                         report.result?.fields?.titulo_relatorio ||
                         report.fileName || 
                         report.agentName || 
                         'relatorio'
      
      const sanitizedTitle = reportTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, '') // Remove hífens do início e fim

      // Tentar baixar HTML se existir
      if (report.result.htmlReport) {
        const blob = new Blob([report.result.htmlReport], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${sanitizedTitle}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return
      }

      // Gerar relatório via API
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: report.result,
          format: 'pdf',
          fileName: reportTitle,
          download: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }

      // Baixar o arquivo
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${sanitizedTitle}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      alert('Erro ao baixar relatório. Tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
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
                disabled={downloading}
                className="text-gray-400 hover:text-white disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
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
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="bg-gray-800 mb-6">
                <TabsTrigger value="fields">Campos Extraídos</TabsTrigger>
                <TabsTrigger value="text">Texto Completo</TabsTrigger>
                <TabsTrigger value="metadata">Metadados</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="space-y-4">
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  {(() => {
                    try {
                      return <JsonViewer data={report.result.fields || report.result} />
                    } catch (error) {
                      console.error('Erro ao renderizar JsonViewer:', error)
                      return (
                        <div className="text-yellow-400 p-4 bg-yellow-900/20 rounded">
                          <p className="font-semibold mb-2">Erro ao exibir dados</p>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(report.result, null, 2)}
                          </pre>
                        </div>
                      )
                    }
                  })()}
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
