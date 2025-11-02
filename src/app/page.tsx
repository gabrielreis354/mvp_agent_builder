'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Bolt as Zap, 
  User,
  Users, 
  ArrowRight, 
  Sparkles, 
  Building2,
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const features = [
    {
      icon: Brain,
      title: "Visual Builder",
      description: "Interface drag & drop intuitiva. Crie agentes sem código, como no Canva",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Linguagem Natural",
      description: "Descreva o que precisa em português e a IA cria o agente automaticamente",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Multi-Empresa",
      description: "Gestão multi-usuário e multi-tenancy. Perfeito para equipes de RH",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const useCases = [
    {
      title: "Análise de Currículos",
      description: "Triagem automática com IA. Ranking de candidatos em segundos",
      category: "Recrutamento"
    },
    {
      title: "Análise de Contratos",
      description: "Extrai dados de contratos CLT, identifica riscos e valida conformidade",
      category: "Jurídico RH"
    },
    {
      title: "Gestão de Despesas",
      description: "Processa vale-transporte, refeição e benefícios automaticamente",
      category: "Financeiro RH"
    }
  ]

  const metrics = [
    { label: "Redução de Tempo", value: "88%", icon: TrendingUp },
    { label: "Empresas Atendidas", value: "50+", icon: Building2 },
    { label: "Agentes Criados", value: "200+", icon: Brain },
    { label: "ROI Médio", value: "300%", icon: Target }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mr-2 sm:mr-3" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SimplifiqueIA
              </h1>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Automatize seu RH com
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Inteligência Artificial
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Crie agentes inteligentes para RH em minutos. Interface visual drag-and-drop ou linguagem natural. 
              Multi-usuário, multi-empresa. OpenAI, Anthropic e Google integrados.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Botão Principal - Criar Agente */}
              <Link href="/builder">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 min-h-[44px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-base sm:text-lg md:text-xl transition-all duration-300 transform shadow-xl hover:shadow-2xl flex items-center gap-2 sm:gap-3"
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Criar Agente</span>
                  <span className="sm:hidden">Criar</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>

              {/* Botões Secundários */}
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 min-h-[44px] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Meu Perfil
                </motion.button>
              </Link>

              <Link href="/agents">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 min-h-[44px] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Meus Agentes
                </motion.button>
              </Link>
              
              <Link href="/gallery">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 min-h-[44px] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Ver Templates
                </motion.button>
              </Link>

              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 min-h-[44px] bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 backdrop-blur-sm text-white rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 border border-green-500/40 hover:border-green-400/60 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">Chat com IA</span>
                  <span className="sm:hidden">Chat</span>
                  <span className="text-xs px-2 py-0.5 bg-green-500/30 rounded-full">NOVO</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="py-16 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <metric.icon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm sm:text-base text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Simples como deve ser
            </h3>
            <p className="text-xl text-gray-200">
              Duas formas de criar: visual ou por texto. Você escolhe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <div className="h-full p-8 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                  <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Automatize processos críticos de RH
            </h3>
            <p className="text-xl text-gray-200">
              Templates prontos para usar. Resultados em minutos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-6 rounded-xl bg-gray-800/30 border border-gray-700"
              >
                <div className="text-sm text-blue-400 font-medium mb-2">
                  {useCase.category}
                </div>
                <h4 className="text-xl font-bold mb-3">{useCase.title}</h4>
                <p className="text-gray-200">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Simplifique seu RH com IA
            </h3>
            <p className="text-xl text-gray-200 mb-8">
              Comece grátis. Primeiro agente em 5 minutos. Sem cartão de crédito.
            </p>
            
            <Link href="/builder">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-xl flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform"
              >
                <Brain className="h-6 w-6" />
                Começar Agora - Grátis
                <ArrowRight className="h-6 w-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna 1: Sobre */}
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-bold">SimplifiqueIA</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatize processos de RH com inteligência artificial. 
                Interface visual simples, sem código.
              </p>
            </div>

            {/* Coluna 2: Links Rápidos */}
            <div>
              <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/builder" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Criar Agente
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Dar Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:suporte@simplifiqueia.com.br"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <Mail className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm">suporte@simplifiqueia.com.br</span>
                </a>
                <Link 
                  href="/feedback"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Enviar Feedback Rápido
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SimplifiqueIA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
