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
      description: "Drag & drop interface como Figma para criar agentes de IA",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Linguagem Natural",
      description: "Descreva o que precisa e a IA cria o agente automaticamente",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Multi-AI Native",
      description: "OpenAI + Anthropic + Google integrados nativamente",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const useCases = [
    {
      title: "Análise de Contratos",
      description: "Extrai dados automaticamente de contratos e documentos jurídicos",
      category: "RH & Jurídico"
    },
    {
      title: "Suporte ao Cliente",
      description: "Classifica e responde tickets automaticamente com IA",
      category: "Atendimento"
    },
    {
      title: "Análise Financeira",
      description: "Processa despesas e detecta anomalias em dados financeiros",
      category: "Financeiro"
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
                AutomateAI
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Democratize a criação de
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}agentes de IA
              </span>
            </h2>
            
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Plataforma híbrida que permite criar agentes inteligentes via Visual Builder 
              ou Linguagem Natural. Multi-AI native com OpenAI, Anthropic e Google.
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
              Duas formas de criar agentes
            </h3>
            <p className="text-xl text-gray-200">
              Escolha a abordagem que funciona melhor para você
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
              Casos de uso reais
            </h3>
            <p className="text-xl text-gray-200">
              Veja como empresas estão usando nossa plataforma
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
              Pronto para democratizar a IA na sua empresa?
            </h3>
            <p className="text-xl text-gray-200 mb-8">
              Crie seu primeiro agente em menos de 5 minutos
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
