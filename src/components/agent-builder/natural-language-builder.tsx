'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Brain, 
  Sparkles, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Wand2,
  Info,
  TrendingUp
} from 'lucide-react'
import { Agent, AgentNode, AgentEdge } from '@/types/agent'
import { Button } from '@/components/ui/button'

function generateId() {
  // Gera um ID único simples baseado em timestamp e um número aleatório
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agent?: Partial<Agent>
}

interface NaturalLanguageBuilderProps {
  onAgentGenerated: (agent: Partial<Agent>) => void
}

const examplePrompts = [
  "Crie um agente que analisa contratos de trabalho e extrai informações pessoais, salário e benefícios",
  "Automatize o suporte ao cliente: classifique emails por urgência e gere respostas automáticas",
  "Processe despesas corporativas, detecte gastos suspeitos e aplique regras de aprovação",
  "Analise documentos jurídicos e identifique cláusulas importantes e riscos",
  "Monitore redes sociais para menções da marca e classifique sentimentos"
]

export function NaturalLanguageBuilder({ onAgentGenerated }: NaturalLanguageBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Olá! Sou seu assistente de criação de agentes IA. Descreva o que você gostaria de automatizar e eu criarei um agente personalizado para você.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const [showPromptTips, setShowPromptTips] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImprovePrompt = async () => {
    if (!input.trim() || isImprovingPrompt) return

    setIsImprovingPrompt(true)

    try {
      // Tentar usar API de melhoria de prompts
      const response = await fetch('/api/prompts/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input })
      })

      if (response.ok) {
        const data = await response.json()
        setInput(data.improvedPrompt)
        
        // Adicionar mensagem explicativa com melhorias específicas
        const improvementsText = data.improvements.map((imp: string) => `• ${imp}`).join('\n')
        const tipMessage: Message = {
          id: generateId(),
          type: 'system',
          content: `🎯 **Prompt otimizado com IA!** 

**Melhorias aplicadas:**
${improvementsText}

💡 **Dica:** Prompts mais específicos geram agentes mais precisos e eficazes. A IA analisou seu comando e adicionou contexto relevante para RH.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, tipMessage])
      } else {
        // Fallback para lógica local se API falhar
        const improvedPrompt = improvePromptLocally(input)
        setInput(improvedPrompt)
        
        const tipMessage: Message = {
          id: generateId(),
          type: 'system',
          content: `💡 **Prompt melhorado!** Adicionei mais detalhes para obter uma resposta mais precisa da IA. Quanto mais específico for seu comando, melhor será o agente gerado.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, tipMessage])
      }
      
    } catch (error) {
      console.error('Error improving prompt:', error)
      
      // Fallback para lógica local em caso de erro
      const improvedPrompt = improvePromptLocally(input)
      setInput(improvedPrompt)
      
      const tipMessage: Message = {
        id: generateId(),
        type: 'system',
        content: `💡 **Prompt melhorado!** Adicionei mais detalhes para obter uma resposta mais precisa da IA. Quanto mais específico for seu comando, melhor será o agente gerado.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, tipMessage])
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  const improvePromptLocally = (originalPrompt: string): string => {
    const prompt = originalPrompt.toLowerCase()
    let improved = originalPrompt

    // Adicionar contexto específico baseado no tipo de tarefa
    if (prompt.includes('contrato') || prompt.includes('jurídico')) {
      improved += '. Extraia informações como partes envolvidas, valores, prazos, cláusulas importantes e identifique riscos jurídicos.'
    } else if (prompt.includes('currículo') || prompt.includes('cv') || prompt.includes('candidato')) {
      improved += '. Analise experiência profissional, formação acadêmica, habilidades técnicas e forneça uma pontuação de 0-100 com recomendação de contratação.'
    } else if (prompt.includes('despesa') || prompt.includes('financeiro') || prompt.includes('folha')) {
      improved += '. Identifique gastos suspeitos, categorize despesas (fixas vs variáveis), calcule métricas financeiras e sugira oportunidades de economia.'
    } else if (prompt.includes('email') || prompt.includes('suporte') || prompt.includes('atendimento')) {
      improved += '. Classifique por urgência (baixa/média/alta), categoria (técnico/comercial/financeiro) e sentimento (positivo/neutro/negativo).'
    }

    // Adicionar formato de saída se não especificado
    if (!prompt.includes('relatório') && !prompt.includes('formato')) {
      improved += ' Gere um relatório estruturado em HTML para visualização profissional.'
    }

    // Adicionar especificação de entrada se não clara
    if (!prompt.includes('arquivo') && !prompt.includes('upload') && !prompt.includes('documento')) {
      improved += ' Aceite upload de arquivos PDF, DOC ou planilhas Excel.'
    }

    return improved
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agents/generate-from-nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate agent from API');
      }

      const agentStructure = await response.json();

      const generatedAgent: Partial<Agent> = {
        name: agentStructure.name || `Agente para "${currentInput.substring(0, 20)}..."`,
        description: currentInput,
        nodes: agentStructure.nodes,
        edges: agentStructure.edges,
        status: 'draft',
      };

      const assistantMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: `Perfeito! Criei um agente personalizado baseado na sua descrição. O agente possui ${generatedAgent.nodes?.length} nós e está pronto para ser usado.`,
        timestamp: new Date(),
        agent: generatedAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating agent:', error);
      const errorMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao gerar o agente. A IA pode estar sobrecarregada. Tente novamente ou reformule sua solicitação.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  
  const handleExampleClick = (example: string) => {
    setInput(example)
  }

  const handleUseAgent = (agent: Partial<Agent>) => {
    onAgentGenerated(agent)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Criação por Linguagem Natural</h2>
            <p className="text-gray-400">Descreva o que precisa e a IA criará seu agente automaticamente</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'system'
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-purple-900/50 text-white'
              } rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  {message.type !== 'user' && (
                    <div className="p-1 bg-purple-600 rounded">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.agent && (
                      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{message.agent.name}</h4>
                            <p className="text-xs text-gray-400">{message.agent.nodes?.length} nós • {message.agent.category}</p>
                          </div>
                          <Button
                            onClick={() => message.agent && handleUseAgent(message.agent)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Usar Agente
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-400 mb-2">Fluxo do agente:</div>
                        <div className="flex items-center gap-2 text-xs">
                          {message.agent.nodes?.map((node, index) => (
                            <React.Fragment key={node.id}>
                              <span className={`px-2 py-1 rounded text-xs ${
                                node.type === 'input' ? 'bg-blue-900/50 text-blue-300' :
                                node.type === 'ai' ? 'bg-purple-900/50 text-purple-300' :
                                node.type === 'logic' ? 'bg-orange-900/50 text-orange-300' :
                                'bg-green-900/50 text-green-300'
                              }`}>
                                {node.data.label}
                              </span>
                              {index < (message.agent?.nodes?.length ?? 0) - 1 && (
                                <span className="text-gray-500">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-purple-900/50 text-white rounded-lg p-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-purple-600 rounded">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analisando sua solicitação e criando o agente...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Examples */}
      {messages.length === 1 && (
        <div className="p-6 border-t border-gray-700">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Exemplos para começar:</span>
            </div>
            <div className="grid gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-gray-300 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Tips */}
      {showPromptTips && (
        <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Dica: Prompts melhores = Agentes melhores</h4>
              <p className="text-xs text-gray-300 mb-3">
                Quanto mais específico e detalhado for seu comando, melhor será o agente gerado pela IA. 
                Use o botão "Melhorar Prompt" para otimizar automaticamente sua descrição.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Seja específico sobre entrada e saída</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Mencione o tipo de documento</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Defina o formato do resultado</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPromptTips(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Descreva o agente que você gostaria de criar... (Ex: Analise contratos de trabalho e extraia salário, benefícios e cláusulas importantes)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              disabled={isLoading || isImprovingPrompt}
            />
            
            {/* Improve Prompt Button */}
            {input.trim() && (
              <div className="absolute top-2 right-2">
                <Button
                  onClick={handleImprovePrompt}
                  disabled={isImprovingPrompt || isLoading}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400"
                >
                  {isImprovingPrompt ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  <span className="ml-1 text-xs">Melhorar</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isImprovingPrompt}
              className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            
            {input.trim() && (
              <Button
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt || isLoading}
                size="sm"
                variant="outline"
                className="px-3 bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
              >
                {isImprovingPrompt ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </div>
          
          {input.trim() && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Info className="h-3 w-3" />
              <span>Use "Melhorar Prompt" para otimizar sua descrição</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
