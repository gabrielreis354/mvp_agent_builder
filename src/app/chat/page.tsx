'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Brain, ArrowRight, Sparkles, Zap, CheckCircle2, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ChatIntroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userAgents, setUserAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      loadUserAgents()
    }
  }, [status])

  async function loadUserAgents() {
    try {
      const response = await fetch('/api/agents/list')
      const data = await response.json()
      setUserAgents(data.agents || [])
    } catch (error) {
      console.error('Erro ao carregar agentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Conversa Natural',
      description: 'Converse com seus agentes como se fosse um chat. A IA entende contexto e faz perguntas inteligentes.'
    },
    {
      icon: Brain,
      title: 'Coleta Inteligente',
      description: 'O agente identifica quais informações precisa e pede apenas o necessário, uma por vez.'
    },
    {
      icon: Sparkles,
      title: 'Execução Contextual',
      description: 'Quando tiver todas as informações, o agente executa automaticamente e retorna o resultado.'
    },
    {
      icon: FileText,
      title: 'Suporta Arquivos',
      description: 'Envie PDFs, imagens e documentos diretamente na conversa.'
    }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-300 mb-6">
            Você precisa estar logado para acessar o chat conversacional.
          </p>
          <Link href="/auth/signin?callbackUrl=/chat">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300">
              Fazer Login
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chat Conversacional com IA
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Uma nova forma de interagir com seus agentes. Natural, inteligente e eficiente.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              <feature.icon className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/30 rounded-xl border border-gray-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            Como Funciona
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Escolha um Agente</h4>
                <p className="text-gray-300 text-sm">Selecione qual agente você quer usar na conversa.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Converse Naturalmente</h4>
                <p className="text-gray-300 text-sm">O agente faz perguntas inteligentes e coleta as informações necessárias.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Receba o Resultado</h4>
                <p className="text-gray-300 text-sm">Quando tiver tudo, o agente executa e retorna o resultado formatado.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Carregando seus agentes...
            </div>
          ) : userAgents.length > 0 ? (
            <div>
              <p className="text-gray-300 mb-6">
                Você tem <strong>{userAgents.length}</strong> agente(s) disponível(is) para chat.
              </p>
              <Link href="/chat-test">
                <button className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto">
                  <MessageSquare className="h-6 w-6" />
                  Começar Conversa
                  <ArrowRight className="h-6 w-6" />
                </button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-6">
                Você ainda não tem nenhum agente. Crie um agente primeiro para começar a conversar!
              </p>
              <Link href="/builder">
                <button className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto">
                  <Brain className="h-6 w-6" />
                  Criar Primeiro Agente
                  <ArrowRight className="h-6 w-6" />
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-gray-400"
        >
          <CheckCircle2 className="h-4 w-4 inline mr-1 text-green-400" />
          Feature BETA - Estamos melhorando continuamente
        </motion.div>
      </div>
    </div>
  )
}
