'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ChatMessage } from '@/lib/agentkit/types'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ChatInterfaceProps {
  agentId: string
  agentName: string
}

export function ChatInterface({ agentId, agentName }: ChatInterfaceProps) {
  const router = useRouter()
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string, fileContent?: string) => {
    if (!message.trim()) return

    // Adicionar mensagem do usuário imediatamente (UI otimista)
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThreadId,
          agentId,
          message,
          fileContent, // Incluir conteúdo do arquivo se houver
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao enviar mensagem')
      }

      const data = await response.json()
      
      // Atualizar com resposta real do agente
      setMessages((prev) => [...prev, data.message])
      
      // Atualizar thread ID se for novo
      if (!currentThreadId && data.threadId) {
        setCurrentThreadId(data.threadId)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setCurrentThreadId(null)
    setMessages([])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Navegação Esquerda */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="h-8 w-px bg-gray-700" />
            
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Início</span>
              </Button>
            </Link>
          </div>

          {/* Título Central */}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-white truncate">{agentName}</h2>
            <p className="text-xs text-gray-400">
              {currentThreadId ? 'Conversa em andamento' : 'Nova conversa'}
            </p>
          </div>

          {/* Ações Direita */}
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-400 max-w-md">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Olá! Como posso ajudar?
              </h3>
              <p className="text-sm mb-4">
                Sou um assistente de RH especializado. Posso ajudar com:
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li>📄 Análise de currículos</li>
                <li>📋 Validação de contratos CLT</li>
                <li>🎯 Processos de onboarding</li>
                <li>💰 Gestão de despesas</li>
                <li>⭐ Avaliação 360°</li>
              </ul>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} agentName={agentName} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Digite sua mensagem..."
      />
    </div>
  )
}
