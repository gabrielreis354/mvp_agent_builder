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
  TrendingUp
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-blue-400 mr-3" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SimplifiqueIA
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Automatize seu RH com
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Inteligência Artificial
              </span>
            </h2>
            
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Crie agentes inteligentes para RH em minutos. Interface visual drag-and-drop ou linguagem natural. 
              Multi-usuário, multi-empresa. OpenAI, Anthropic e Google integrados.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Botão Principal - Criar Agente */}
              <Link href="/builder">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-xl transition-all duration-300 transform shadow-xl hover:shadow-2xl flex items-center gap-3"
                >
                  <Brain className="w-6 h-6" />
                  Criar Agente
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* Botões Secundários */}
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Meu Perfil
                </motion.button>
              </Link>

              <Link href="/agents">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Meus Agentes
                </motion.button>
              </Link>
              
              <Link href="/gallery">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Ver Templates
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="py-16 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-gray-400">{metric.label}</div>
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
    </div>
  )
}
