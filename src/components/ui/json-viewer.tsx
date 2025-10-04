'use client'

import React from 'react'

interface JsonViewerProps {
  data: any
  level?: number
}

export function JsonViewer({ data, level = 0 }: JsonViewerProps) {
  const indent = level * 20

  // Renderizar valores primitivos
  if (data === null || data === undefined) {
    return <span className="text-gray-500 italic">null</span>
  }

  if (typeof data === 'string') {
    return <span className="text-green-400">"{data}"</span>
  }

  if (typeof data === 'number') {
    return <span className="text-blue-400">{data}</span>
  }

  if (typeof data === 'boolean') {
    return <span className="text-purple-400">{data.toString()}</span>
  }

  // Renderizar arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-400">[]</span>
    }

    return (
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} style={{ marginLeft: `${indent}px` }} className="flex gap-2">
            <span className="text-gray-500 font-mono">•</span>
            <div className="flex-1">
              <JsonViewer data={item} level={level + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar objetos
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    
    if (entries.length === 0) {
      return <span className="text-gray-400">{'{}'}</span>
    }

    return (
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} style={{ marginLeft: `${indent}px` }} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">
                {key.replace(/_/g, ' ')}:
              </span>
            </div>
            <div className="ml-4">
              <JsonViewer data={value} level={level + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <span className="text-gray-300">{String(data)}</span>
}
