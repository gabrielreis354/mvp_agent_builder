'use client'

import { ChatMessage } from '@/lib/agentkit/types'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkdownResult } from './markdown-result'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  agentName?: string
}

export function MessageList({ messages, isLoading, agentName }: MessageListProps) {
  // Detectar se mensagem contém markdown (resultado de execução)
  const isMarkdownResult = (content: string) => {
    return content.includes('**RELATÓRIO') || 
           content.includes('## ') || 
           (content.includes('**') && content.includes('###'))
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isResult = message.role === 'assistant' && isMarkdownResult(message.content)
        
        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && !isResult && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
            )}

            {isResult ? (
              // Renderizar resultado com markdown
              <div className="w-full">
                <MarkdownResult
                  content={message.content}
                  executionId={message.metadata?.executionId}
                  agentName={agentName}
                />
              </div>
            ) : (
              // Mensagem normal
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        )
      })}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
