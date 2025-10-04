'use client'

import { useState } from 'react'
import { 
  CheckCircle, AlertCircle, XCircle, Download, Eye, Calendar, FileText, User, Clock, Trash2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReportPreviewModal } from './report-preview-modal'
import type { ReportCache } from '@/lib/services/report-service-prisma'

interface ReportCardProps {
  report: ReportCache
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
}

export function ReportCard({ report, viewMode, onDelete }: ReportCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  
  const typeColors = {
    contract: 'from-blue-500 to-blue-600',
    resume: 'from-green-500 to-green-600',
    expense: 'from-yellow-500 to-yellow-600',
    document: 'from-purple-500 to-purple-600',
    generic: 'from-gray-500 to-gray-600'
  }

  const typeLabels = {
    contract: 'Contrato',
    resume: 'Currículo',
    expense: 'Despesa',
    document: 'Documento',
    generic: 'Genérico'
  }

  const statusIcons = {
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    partial: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    processing: <AlertCircle className="h-4 w-4 text-blue-500" />
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Extrair informações principais para preview
  const mainFields = Object.entries(report.result.fields || {})
    .filter(([key]) => !key.startsWith('_'))
    .slice(0, 3)

  return (
    <>
      <div className={`
        bg-gray-800/80 backdrop-blur-lg rounded-xl overflow-hidden
        border border-gray-600 hover:border-blue-500/50 transition-all
        hover:shadow-xl hover:shadow-blue-500/10 hover:bg-gray-800/90
        ${viewMode === 'list' ? 'flex items-center p-4' : ''}
      `}>
        {/* Indicador de tipo */}
        <div className={`
          bg-gradient-to-r ${typeColors[report.type]} 
          ${viewMode === 'grid' ? 'h-2' : 'w-2 h-full -m-4 mr-4'}
        `} />
        
        {/* Conteúdo */}
        <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 flex items-center justify-between'}`}>
          {/* Header */}
          <div className={viewMode === 'grid' ? '' : 'flex-1'}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                  {report.fileName || report.agentName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[report.type]}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {report.agentName}
                  </span>
                  {statusIcons[report.status as keyof typeof statusIcons] || statusIcons.processing}
                </div>
              </div>
            </div>

            {/* Preview de campos */}
            {viewMode === 'grid' && mainFields.length > 0 && (
              <div className="space-y-2 mb-3 pt-3 border-t border-gray-600">
                {mainFields.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-white font-medium">
                      {typeof value === 'object' ? (
                        <span className="text-blue-400 text-xs">Ver detalhes no modal</span>
                      ) : (
                        String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '')
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Metadados */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(report.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(report.timestamp)}
              </span>
              {report.fileSize && (
                <span>
                  {(report.fileSize / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
          
          {/* Ações */}
          <div className={`
            flex gap-2 
            ${viewMode === 'grid' ? 'mt-4 pt-4 border-t border-gray-700' : 'ml-4'}
          `}>
            <Button
              onClick={() => setShowPreview(true)}
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
              title="Visualizar"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-600/20"
              title="Baixar"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(report.id)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <ReportPreviewModal
          report={report}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}
