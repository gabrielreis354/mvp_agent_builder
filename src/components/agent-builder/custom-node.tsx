'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { 
  Download, 
  Brain, 
  Upload, 
  GitBranch, 
  Globe,
  Settings,
  Trash2
} from 'lucide-react'

interface CustomNodeProps {
  data: {
    label: string
    nodeType: 'input' | 'ai' | 'output' | 'logic' | 'api'
    prompt?: string
    provider?: string
    model?: string
    isSelected?: boolean
  }
  selected?: boolean
}

const iconMap = {
  input: Download,
  ai: Brain,
  output: Upload,
  logic: GitBranch,
  api: Globe
}

const colorMap = {
  input: 'from-blue-500 to-blue-600',
  ai: 'from-purple-500 to-purple-600',
  output: 'from-green-500 to-green-600',
  logic: 'from-orange-500 to-orange-600',
  api: 'from-red-500 to-red-600'
}

export function CustomNode({ data, selected }: CustomNodeProps) {
  const IconComponent = iconMap[data.nodeType]
  const colorClass = colorMap[data.nodeType]

  return (
    <div className={`
      relative bg-gray-800 border-2 rounded-lg shadow-lg min-w-[200px] max-w-[250px]
      ${selected ? 'border-blue-400 shadow-blue-400/20' : 'border-gray-600'}
      hover:border-gray-500 transition-all duration-200
    `}>
      {/* Input Handle */}
      {data.nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      {/* Node Header */}
      <div className={`
        flex items-center gap-3 p-3 bg-gradient-to-r ${colorClass} 
        rounded-t-lg text-white
      `}>
        <IconComponent className="h-5 w-5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.label}</div>
          {data.nodeType === 'ai' && data.provider && (
            <div className="text-xs opacity-90 capitalize">
              {data.provider} • {data.model}
            </div>
          )}
        </div>
        
        {selected && (
          <div className="flex gap-1">
            <button className="p-1 hover:bg-white/20 rounded">
              <Settings className="h-3 w-3" />
            </button>
            <button className="p-1 hover:bg-white/20 rounded">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Node Content */}
      <div className="p-3">
        {data.nodeType === 'ai' && data.prompt && (
          <div className="text-xs text-gray-300 leading-relaxed">
            <div className="font-medium text-gray-200 mb-1">Prompt:</div>
            <div className="bg-gray-900 p-2 rounded text-xs font-mono">
              {data.prompt.length > 60 
                ? `${data.prompt.substring(0, 60)}...` 
                : data.prompt
              }
            </div>
          </div>
        )}
        
        {data.nodeType === 'input' && (
          <div className="text-xs text-gray-300">
            <div className="font-medium text-gray-200 mb-1">Aceita:</div>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                Texto
              </span>
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                Arquivo
              </span>
            </div>
          </div>
        )}
        
        {data.nodeType === 'output' && (
          <div className="text-xs text-gray-300">
            <div className="font-medium text-gray-200 mb-1">Gera:</div>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                JSON
              </span>
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                Relatório
              </span>
            </div>
          </div>
        )}
        
        {data.nodeType === 'logic' && (
          <div className="text-xs text-gray-300">
            <div className="font-medium text-gray-200 mb-1">Tipo:</div>
            <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">
              Condição
            </span>
          </div>
        )}
        
        {data.nodeType === 'api' && (
          <div className="text-xs text-gray-300">
            <div className="font-medium text-gray-200 mb-1">Endpoint:</div>
            <div className="bg-gray-900 p-2 rounded text-xs font-mono">
              POST /api/endpoint
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {data.nodeType !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
    </div>
  )
}
