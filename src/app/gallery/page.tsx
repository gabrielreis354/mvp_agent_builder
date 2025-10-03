'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ArrowLeft,
  Eye,
  Download,
  Star,
  Brain,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentTemplate } from '@/types/agent'
import { agentTemplates } from '@/lib/templates'

const categories = ['Todos', 'RH & Jurídico', 'Atendimento', 'Financeiro', 'Documentos', 'Marketing', 'Produtividade']
const difficulties = ['Todos', 'beginner', 'intermediate', 'advanced']

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos')
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'category'>('name')

  const filteredTemplates = agentTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'Todos' || template.difficulty === selectedDifficulty
      
      return matchesSearch && matchesCategory && matchesDifficulty
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'difficulty') {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      }
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/30'
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/30'
      case 'advanced': return 'text-red-400 bg-red-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      default: return difficulty
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-600" />
              <div>
                <h1 className="text-lg font-semibold">Galeria de Agentes</h1>
                <div className="text-sm text-gray-400">
                  {filteredTemplates.length} templates disponíveis
                </div>
              </div>
            </div>
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-4 w-4 mr-2" />
                Criar Novo Agente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dificuldade</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'Todos' ? 'Todos' : getDifficultyLabel(difficulty)}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="name">Nome</option>
                <option value="difficulty">Dificuldade</option>
                <option value="category">Categoria</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total de Templates</span>
            </div>
            <div className="text-2xl font-bold text-white">{agentTemplates.length}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Categorias</span>
            </div>
            <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Mais Usado</span>
            </div>
            <div className="text-sm font-medium text-white">Suporte Automático</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Economia Média</span>
            </div>
            <div className="text-2xl font-bold text-white">75%</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-400">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded">
                      {template.category}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(template.difficulty)}`}>
                      {getDifficultyLabel(template.difficulty)}
                    </span>
                    <span className="text-xs text-gray-400">{template.estimatedTime}</span>
                  </div>
                  <CardDescription className="text-gray-300 text-sm leading-relaxed">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-2">Caso de Uso:</div>
                      <div className="text-sm text-gray-300">{template.useCase}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-2">Fluxo:</div>
                      <div className="text-xs text-gray-400 font-mono bg-gray-900/50 p-2 rounded">
                        {template.preview}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/builder?preview=${template.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/builder?template=${template.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Download className="h-4 w-4 mr-2" />
                          Usar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros ou criar um novo agente</p>
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-4 w-4 mr-2" />
                Criar Novo Agente
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
