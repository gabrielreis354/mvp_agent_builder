'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Mail, Eye, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MarkdownResultProps {
  content: string
  executionId?: string
  agentName?: string
}

export function MarkdownResult({ content, executionId, agentName }: MarkdownResultProps) {
  const [view, setView] = useState<'preview' | 'raw'>('preview')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleDownload = async (format: 'pdf' | 'docx' | 'md') => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/reports/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          format,
          executionId,
          agentName,
        }),
      })

      if (!response.ok) throw new Error('Erro ao gerar download')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${executionId || Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar:', error)
      alert('Erro ao gerar download. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    const email = prompt('Digite o email para envio:')
    if (!email) return

    setIsSendingEmail(true)
    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          email,
          executionId,
          agentName,
        }),
      })

      if (!response.ok) throw new Error('Erro ao enviar email')

      alert(`Relatório enviado para ${email} com sucesso!`)
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      alert('Erro ao enviar email. Tente novamente.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header com Ações */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Resultado da Análise</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Preview/Raw */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('preview')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
            <button
              onClick={() => setView('raw')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === 'raw'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Markdown
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 ml-4 border-l border-gray-700 pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('docx')}
              disabled={isDownloading}
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              DOCX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {view === 'preview' ? (
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-4 pb-2 border-b-2 border-blue-500">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-blue-400">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-blue-300 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold bg-blue-900/30 px-1 rounded">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4 text-gray-300">{children}</li>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-700 border border-gray-700">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-blue-900/50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-700 bg-gray-800/50">
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-300">{children}</td>
                ),
                hr: () => <hr className="my-6 border-gray-700" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-900 text-blue-300 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
