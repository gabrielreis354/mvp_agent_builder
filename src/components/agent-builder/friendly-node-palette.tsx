'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  MessageSquare, 
  FileCheck, 
  UserCheck,
  Scale,
  GitBranch,
  Send,
  FileOutput,
  Globe,
  Settings
} from 'lucide-react'
import { friendlyNodeTemplates, advancedNodeTemplates } from '@/lib/friendly-nodes'

const iconMap = {
  FileText,
  MessageSquare,
  FileCheck,
  UserCheck,
  Scale,
  GitBranch,
  Send,
  FileOutput,
  Globe,
  Settings
}

export function FriendlyNodePalette() {
  const [advancedMode, setAdvancedMode] = useState(false)

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const visibleTemplates = advancedMode 
    ? [...friendlyNodeTemplates, ...advancedNodeTemplates]
    : friendlyNodeTemplates

  const categories = Array.from(new Set(visibleTemplates.map(t => t.category)))

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      {/* Header com Toggle */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Componentes</h3>
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all
              ${advancedMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {advancedMode ? '⚙️ Modo Avançado' : '👤 Modo Simples'}
          </button>
        </div>
        <p className="text-sm text-gray-400">
          {advancedMode 
            ? 'Arraste cards técnicos para customização avançada'
            : 'Arraste e solte para criar seu fluxo de trabalho'
          }
        </p>
      </div>

      {/* Cards por Categoria */}
      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
              {getCategoryIcon(category)}
              {category}
            </h4>
            
            <div className="space-y-2">
              {visibleTemplates
                .filter(template => template.category === category)
                .map((template) => {
                  const IconComponent = iconMap[template.icon as keyof typeof iconMap]
                  
                  return (
                    <div
                      key={`${template.type}-${template.label}`}
                      draggable
                      onDragStart={(event) => onDragStart(event, template.type)}
                      className="group cursor-move p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${getNodeColor(template.type)}`}>
                          {IconComponent && <IconComponent className="h-4 w-4 text-white" />}
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
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Templates */}
      {!advancedMode && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            🚀 Templates Prontos
          </h4>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('addTemplate', { detail: 'contract-analysis' }))}
              className="w-full p-3 text-left rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 hover:border-blue-600 transition-all"
            >
              <div className="text-sm font-medium text-blue-300">📋 Análise de Contrato Completa</div>
              <div className="text-xs text-blue-400/70 mt-1">Receber → Analisar → Validar → Email + PDF</div>
            </button>
            
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('addTemplate', { detail: 'resume-analysis' }))}
              className="w-full p-3 text-left rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 hover:border-purple-600 transition-all"
            >
              <div className="text-sm font-medium text-purple-300">👤 Triagem de Currículos</div>
              <div className="text-xs text-purple-400/70 mt-1">Receber → Analisar → Pontuar → Decidir</div>
            </button>
          </div>
        </div>
      )}

      {/* Dica de Uso */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-lg">💡</span>
            <div className="text-xs text-blue-300">
              <strong>Dica:</strong> {advancedMode 
                ? 'Use cards técnicos para integrações customizadas e lógica avançada.'
                : 'Comece com um template pronto e customize depois!'
              }
            </div>
          </div>
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

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Receber Dados': '📥',
    'Analisar com IA': '🤖',
    'Validar e Verificar': '✅',
    'Enviar e Gerar': '📤',
    'Avançado': '⚙️'
  }
  return icons[category] || '📦'
}
