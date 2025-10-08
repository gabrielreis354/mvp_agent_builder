'use client'

import React, { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'
import { NodeTooltip } from '@/lib/node-tooltips'
import { cn } from '@/lib/utils'

interface ExpandedTooltipProps {
  tooltip: NodeTooltip
  className?: string
}

export function ExpandedTooltip({ tooltip, className }: ExpandedTooltipProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    advanced: 'bg-red-100 text-red-800 border-red-300'
  }

  const difficultyLabels = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado'
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{tooltip.title}</h4>
          <p className="text-sm text-gray-600">{tooltip.shortDescription}</p>
        </div>
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full border ml-2',
          difficultyColors[tooltip.difficulty]
        )}>
          {difficultyLabels[tooltip.difficulty]}
        </span>
      </div>

      {/* Detailed Description */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{tooltip.detailedDescription}</p>
      </div>

      {/* What It Does */}
      <div className="mb-3">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">O que este componente faz:</h5>
        <ul className="space-y-1">
          {tooltip.whatItDoes.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700 py-2 border-t border-gray-200"
      >
        <span>Ver exemplo e quando usar</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-in fade-in-50 duration-200">
          {/* Example */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h5 className="text-sm font-semibold text-blue-900 mb-1 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Exemplo Prático
            </h5>
            <p className="text-sm text-blue-800 leading-relaxed">{tooltip.example}</p>
          </div>

          {/* When to Use */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h5 className="text-sm font-semibold text-green-900 mb-1">Quando Usar</h5>
            <p className="text-sm text-green-800 leading-relaxed">{tooltip.whenToUse}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Versão compacta do tooltip para exibir inline nos cards
 */
interface CompactTooltipProps {
  tooltip: NodeTooltip
  className?: string
}

export function CompactTooltip({ tooltip, className }: CompactTooltipProps) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setShowFull(!showFull)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        title="Ver mais informações"
      >
        <Info className="w-4 h-4 text-gray-500 hover:text-blue-600" />
      </button>

      {showFull && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowFull(false)}
          />
          
          {/* Tooltip Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
            <ExpandedTooltip tooltip={tooltip} />
          </div>
        </>
      )}
    </div>
  )
}
