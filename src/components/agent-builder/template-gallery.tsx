'use client'

import React, { useState } from 'react';
import { agentTemplates } from '@/lib/templates';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Calculator, 
  MessageSquare, 
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  Brain // Adicionar Brain que estava faltando
} from 'lucide-react';
import { AgentTemplate } from '@/types/agent'; // Importar o tipo correto
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// A lista de templates agora é importada de @/lib/templates
const templates = agentTemplates;

// Mapeamento de ícones para manter a interface
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'Analisador de Contratos RH': FileText,
  'Suporte RH Automático': MessageSquare,
  'Analisador de Despesas RH': Calculator,
  'Processador de Documentos Trabalhistas': Users,
  'Comunicação Interna RH': MessageSquare,
  'Gestor de Processos RH': TrendingUp,
  'Triagem de Currículos': Users,
  // Adicione outros mapeamentos se necessário
};

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
  onCreateFromScratch: () => void
}

export function TemplateGallery({ onSelectTemplate, onCreateFromScratch }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const categories = ['Todos', ...Array.from(new Set(templates.map(t => t.category)))]
  
  const filteredTemplates = selectedCategory === 'Todos' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/50 text-green-300 border border-green-500/50';
      case 'intermediate': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/50';
      case 'advanced': return 'bg-red-900/50 text-red-300 border border-red-500/50';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    // Normalizar categoria para comparação
    const normalizedCategory = category.toLowerCase();
    
    if (normalizedCategory.includes('rh') || normalizedCategory.includes('jurídico')) {
      return 'bg-blue-900/50 text-blue-300 border border-blue-500/50';
    }
    if (normalizedCategory.includes('financeiro')) {
      return 'bg-green-900/50 text-green-300 border border-green-500/50';
    }
    if (normalizedCategory.includes('suporte')) {
      return 'bg-orange-900/50 text-orange-300 border border-orange-500/50';
    }
    return 'bg-gray-700/50 text-gray-300 border border-gray-600/50';
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Galeria de Templates</h2>
            <p className="text-gray-400 mt-1">Escolha um template otimizado para seu caso de uso</p>
          </div>
          <Button 
            variant="outline" 
            onClick={onCreateFromScratch}
            className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
            Criar do Zero
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white'}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = iconMap[template.name] || Brain; // Usar o mapa de ícones
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="h-full cursor-pointer bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-all duration-200"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(template.category)} variant="secondary">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed text-slate-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {template.estimatedTime}
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)} variant="secondary">
                          {template.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-slate-300 mb-2">Caso de Uso:</p>
                      <p className="text-xs text-slate-400">{template.useCase}</p>
                      <Button 
                        className="w-full mt-4" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(template.id);
                        }}
                      >
                        Usar Template
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="h-8 w-8 text-blue-600">{React.createElement(iconMap[selectedTemplate.name] || Brain)}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(selectedTemplate.category)}>
                        {selectedTemplate.category}
                      </Badge>
                      <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                        {selectedTemplate.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">{selectedTemplate.description}</p>
              <div className="mt-6 pt-6 border-t">
                <div>
                  <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Caso de Uso Principal</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedTemplate.useCase}</p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      onSelectTemplate(selectedTemplate.id)
                      setSelectedTemplate(null)
                    }}
                  >
                    Usar Este Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                    className="dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
