'use client'

import React from 'react'
import { 
  Download, 
  Brain, 
  ArrowUp as Upload, 
  GitBranch, 
  Globe,
  Bolt as Zap,
  Database,
  MessageSquare
} from 'lucide-react'
import { NodeTemplate } from '@/types/agent'

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'input',
    label: 'Input',
    description: 'Recebe dados de entrada (texto, arquivo, API)',
    icon: 'Download',
    defaultData: {
      label: 'Input Node',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          file: { type: 'string', format: 'binary' }
        }
      }
    },
    requiredFields: ['inputSchema'],
    category: 'Data'
  },
  {
    type: 'ai',
    label: 'AI Processing',
    description: 'Processa dados usando IA (OpenAI, Anthropic, Google)',
    icon: 'Brain',
    defaultData: {
      label: 'AI Node',
      prompt: 'Analise o seguinte texto e extraia as informações principais:',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    },
    requiredFields: ['prompt', 'provider', 'model'],
    category: 'AI'
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Gera saída (JSON, relatório, notificação)',
    icon: 'Upload',
    defaultData: {
      label: 'Output Node',
      outputSchema: {
        type: 'object',
        properties: {
          result: { type: 'string' },
          confidence: { type: 'number' }
        }
      }
    },
    requiredFields: ['outputSchema'],
    category: 'Data'
  },
  {
    type: 'logic',
    label: 'Logic',
    description: 'Aplica lógica condicional e transformações',
    icon: 'GitBranch',
    defaultData: {
      label: 'Logic Node',
      logicType: 'condition',
      condition: 'data.confidence > 0.8'
    },
    requiredFields: ['logicType'],
    category: 'Logic'
  },
  {
    type: 'api',
    label: 'API Call',
    description: 'Integra com APIs externas',
    icon: 'Globe',
    defaultData: {
      label: 'API Node',
      apiEndpoint: 'https://api.exemplo.com/data',
      apiMethod: 'POST',
      apiHeaders: {
        'Content-Type': 'application/json'
      }
    },
    requiredFields: ['apiEndpoint', 'apiMethod'],
    category: 'Integration'
  }
]

const iconMap = {
  Download,
  Brain,
  Upload,
  GitBranch,
  Globe,
  Zap,
  Database,
  MessageSquare
}

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const categories = Array.from(new Set(nodeTemplates.map(template => template.category)))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">Componentes</h3>
        <p className="text-sm text-gray-400">
          Arraste e solte para criar seu agente
        </p>
      </div>

      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            
            <div className="space-y-2">
              {nodeTemplates
                .filter(template => template.category === category)
                .map((template) => {
                  const IconComponent = iconMap[template.icon as keyof typeof iconMap]
                  
                  return (
                    <div
                      key={template.type}
                      draggable
                      onDragStart={(event) => onDragStart(event, template.type)}
                      className="group cursor-move p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${getNodeColor(template.type)}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                            {template.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {template.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.requiredFields.map(field => (
                          <span
                            key={field}
                            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Templates */}
      <div className="p-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
          Templates Rápidos
        </h4>
        
        <div className="space-y-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('addTemplate', { detail: 'contract-analysis' }))}
            className="w-full p-3 text-left rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 hover:border-blue-600 transition-all"
          >
            <div className="text-sm font-medium text-blue-300">Análise de Contrato</div>
            <div className="text-xs text-blue-400/70 mt-1">Input → AI (Claude) → Output</div>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('addTemplate', { detail: 'auto-support' }))}
            className="w-full p-3 text-left rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 hover:border-purple-600 transition-all"
          >
            <div className="text-sm font-medium text-purple-300">Suporte Automático</div>
            <div className="text-xs text-purple-400/70 mt-1">Input → AI → Logic → API</div>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('addTemplate', { detail: 'financial-analysis' }))}
            className="w-full p-3 text-left rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-700/50 hover:border-green-600 transition-all"
          >
            <div className="text-sm font-medium text-green-300">Análise Financeira</div>
            <div className="text-xs text-green-400/70 mt-1">Input → AI (Gemini) → Logic → Output</div>
          </button>
        </div>
      </div>
    </div>
  )
}

function getNodeColor(type: string): string {
  const colors = {
    input: 'bg-blue-500',
    ai: 'bg-purple-500',
    output: 'bg-green-500',
    logic: 'bg-orange-500',
    api: 'bg-red-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}
