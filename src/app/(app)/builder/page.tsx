'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  MessageSquare, 
  Palette, 
  ArrowLeft,
  Save,
  Play,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { VisualCanvas, VisualCanvasWrapper } from '@/components/agent-builder/visual-canvas'
import { NodeToolbar } from '@/components/agent-builder/node-toolbar'
import { NaturalLanguageBuilder } from '@/components/agent-builder/natural-language-builder'
import { TemplateGallery } from '@/components/agent-builder/template-gallery'
import { FriendlyNodePalette } from '@/components/agent-builder/friendly-node-palette'
import { useSearchParams } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { SaveAgentDialog } from '@/components/agent-builder/save-agent-dialog';
import { useExecutionStore } from '@/lib/store/execution-store';
import { agentTemplates } from '@/lib/templates';
import type { Agent, AgentNode, AgentEdge, ExecutionResult } from '@/types/agent'

// Helper function for safe JSON parsing
function safeJsonParse<T = any>(str: string | null | undefined, fallback: T): T {
  if (!str || typeof str !== 'string') return fallback
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

type BuilderMode = 'templates' | 'visual' | 'natural'

// Componente interno que usa useSearchParams
function BuilderContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<BuilderMode>('templates')
  const [useFriendlyMode, setUseFriendlyMode] = useState(true) // Modo amigável por padrão
  const [agent, setAgent] = useState<Partial<Agent>>({
    id: `agent-${Date.now()}`, // Garantir que sempre tenha um ID
    name: 'Novo Agente',
    description: '',
    category: 'geral',
    nodes: [],
    edges: [],
    tags: [],
    status: 'draft'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Load agent data if editing, previewing, or using template
  useEffect(() => {
    const loadAgentData = async () => {
      const editId = searchParams.get('edit') || searchParams.get('load');
      const previewId = searchParams.get('preview');
      const templateId = searchParams.get('template');
      const shouldExecute = searchParams.get('execute') === 'true';

            
      console.log('Loading agent data:', { editId, previewId, templateId })
      
      // Load existing agent for editing
      if (editId) {
        try {
          console.log(`🔄 Carregando agente para edição: ${editId}`)
          
          // Primeiro tenta carregar do localStorage (dados mais recentes)
          const localStorageData = localStorage.getItem('editingAgent')
          if (localStorageData) {
            try {
              const agentData = safeJsonParse(localStorageData, {} as any)
              console.log('📦 Dados do localStorage carregados:', agentData)
              
              setAgent({
                id: agentData.id,
                name: agentData.name || 'Agente Sem Nome',
                description: agentData.description || '',
                category: 'custom',
                nodes: agentData.configuration?.nodes || agentData.nodes || [],
                edges: agentData.configuration?.edges || agentData.edges || [],
                tags: agentData.tags || ['custom'],
                status: 'draft'
              })
              
              // Limpar localStorage após uso
              localStorage.removeItem('editingAgent')
              console.log('✅ Agente carregado do localStorage com sucesso')
              return
            } catch (error) {
              console.warn('⚠️ Erro ao parsear dados do localStorage:', error)
            }
          }
          
          // Fallback: buscar do banco de dados
          const response = await fetch(`/api/agents/${editId}`)
          if (response.ok) {
            const data = await response.json()
            console.log('📦 Dados do banco carregados:', data)
            
            if (data.success && data.agent) {
              const agentData = data.agent
              setAgent({
                id: agentData.id,
                name: agentData.name || 'Agente Sem Nome',
                description: agentData.description || '',
                category: 'custom',
                nodes: agentData.nodes || [],
                edges: agentData.edges || [],
                tags: agentData.tags || ['custom'],
                status: 'draft'
              })
              console.log('✅ Agente carregado do banco com sucesso')
            } else {
              console.warn('⚠️ Estrutura de dados do agente inesperada:', data)
            }
          } else {
            console.error('❌ Erro ao carregar agente:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('❌ Erro ao carregar agente:', error)
        }
      }
      // Load template for preview or use
      else if (previewId || templateId) {
        try {
          const { agentTemplates } = await import('@/lib/templates')
          const template = agentTemplates.find((t: any) => t.id === (previewId || templateId))
          
          console.log('Found template:', template)
          
          if (template) {
            const newAgent = {
              id: templateId || `template-${Date.now()}`,
              name: templateId ? template.name : `Preview: ${template.name}`,
              description: template.description,
              category: template.category.toLowerCase().replace(' & ', '-'),
              nodes: template.nodes || [],
              edges: template.edges || [],
              tags: template.tags || [],
              status: templateId ? 'draft' as const : 'preview' as const
            }
            
            console.log('Setting agent with template data:', newAgent)
            setAgent(newAgent)
            setIsPreviewMode(!!previewId)
          } else {
            console.error('Template not found:', previewId || templateId)
          }
        } catch (error) {
          console.error('Error loading template:', error)
        }
      }
      setIsLoading(false)
    }

    loadAgentData()
  }, [searchParams])

  const handleSaveAgent = async (nodes: AgentNode[], edges: AgentEdge[]) => {
    const updatedAgent = {
      name: agent.name || 'Novo Agente',
      description: agent.description || '',
      category: agent.category || 'geral',
      nodes,
      edges,
      tags: agent.tags || [],
      author: 'Usuário',
      version: '1.0.0',
      status: 'active' as const
    }

    // Atualizar o estado local do agente
    setAgent(prev => ({
      ...prev,
      nodes,
      edges
    }))

    try {
      const response = await fetch('/api/agents/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedAgent.name || 'Agente Personalizado',
          description: updatedAgent.description || 'Agente criado no builder',
          templateId: (updatedAgent as any).templateId || 'custom-agent',
          configuration: {
            nodes: updatedAgent.nodes,
            edges: updatedAgent.edges,
            metadata: updatedAgent
          }
        }),
        mode: 'cors'
      })

      if (response.ok) {
        const result = await response.json()
        alert('Agente salvo com sucesso!')
        console.log('Agente salvo:', result)
      } else {
        throw new Error('Falha ao salvar agente')
      }
    } catch (error) {
      console.error('Erro ao salvar agente:', error)
      alert('Erro ao salvar agente. Verifique se o backend está rodando.')
    }
  }

  const handleAgentChange = useCallback((nodes: AgentNode[], edges: AgentEdge[]) => {
    setAgent(prev => {
      // Only update if there's actually a change
      if (prev.nodes?.length !== nodes.length || prev.edges?.length !== edges.length) {
        return {
          ...prev,
          nodes,
          edges
        }
      }
      return prev
    })
  }, [])

  const handleSelectTemplate = (templateId: string) => {
    const template = agentTemplates.find((t) => t.id === templateId);

    if (template) {
      setAgent({
        id: `agent-${Date.now()}`,
        name: template.name,
        description: template.description,
        category: template.category.toLowerCase().replace(' & ', '-'),
        nodes: template.nodes || [],
        edges: template.edges || [],
        tags: template.tags || [],
        status: 'draft' as const,
      });
      setMode('visual');
    } else {
      console.error('Template not found:', templateId);
      alert('Template não encontrado!');
    }
  };

  const handleCreateFromScratch = () => {
    setMode('visual')
  }

  const getTemplateDisplayName = (templateId: string): string => {
    const names: Record<string, string> = {
      'resume-analysis': 'Analisador de Currículos',
      'contract-analysis': 'Analisador de Contratos',
      'payroll-analysis': 'Analisador de Folha de Pagamento',
      'auto-support': 'Suporte Automático',
      'financial-analysis': 'Análise Financeira'
    }
    return names[templateId] || 'Agente Personalizado'
  }

  const getTemplateCategory = (templateId: string): string => {
    const categories: Record<string, string> = {
      'resume-analysis': 'rh',
      'contract-analysis': 'juridico',
      'payroll-analysis': 'financeiro',
      'auto-support': 'suporte',
      'financial-analysis': 'financeiro'
    }
    return categories[templateId] || 'geral'
  }

  
  const { openModal } = useExecutionStore();

  const handleTestAgent = () => {
    const currentNodes = agent.nodes || [];
    if (currentNodes.length === 0) {
      alert('Adicione pelo menos um nó para testar o agente');
      return;
    }
    openModal(agent as Agent);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
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
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold bg-transparent border-none outline-none text-white placeholder-gray-300"
                  placeholder="Nome do Agente"
                />
                <div className="text-sm text-gray-400">
                  {agent.nodes?.length || 0} nós • {agent.edges?.length || 0} conexões
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Friendly Mode Toggle */}
              {mode === 'visual' && (
                <button
                  onClick={() => setUseFriendlyMode(!useFriendlyMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    useFriendlyMode
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={useFriendlyMode ? 'Modo Simples (RH)' : 'Modo Avançado (Dev)'}
                >
                  {useFriendlyMode ? '👤 Modo Simples' : '⚙️ Modo Avançado'}
                </button>
              )}

              {/* Mode Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('templates')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'templates' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Templates
                </button>
                <button
                  onClick={() => setMode('visual')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'visual' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Visual
                </button>
                <button
                  onClick={() => setMode('natural')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'natural' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Natural
                </button>
              </div>

              <div className="h-6 w-px bg-gray-600" />

              <Button
                onClick={handleTestAgent}
                variant="secondary"
                className="bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200 border border-green-400/50"
              >
                <Play className="h-4 w-4 mr-2" />
                Testar
              </Button>

              <SaveAgentDialog
                templateId={(agent as any).templateId || 'custom'}
                templateName={agent.name || 'Agente Personalizado'}
                configuration={{
                  nodes: agent.nodes || [],
                  edges: agent.edges || [],
                  metadata: agent
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="h-[calc(100vh-6.25rem)] flex">
        <div className="w-full h-full">
          {mode === 'templates' ? (
            <TemplateGallery
              onSelectTemplate={handleSelectTemplate}
              onCreateFromScratch={handleCreateFromScratch}
            />
          ) : mode === 'visual' ? (
            <VisualCanvasWrapper
              onSave={handleSaveAgent}
              onAgentChange={handleAgentChange}
              initialNodes={agent.nodes}
              initialEdges={agent.edges}
              useFriendlyMode={useFriendlyMode}
            />
          ) : (
            <div className="h-full">
              <NaturalLanguageBuilder
                onAgentGenerated={(generatedAgent) => {
                  setAgent(generatedAgent)
                  setMode('visual') // Switch to visual mode to show the result
                }}
              />
            </div>
          )}
        </div>
        
              </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>Modo: {mode === 'visual' ? 'Visual Builder' : 'Linguagem Natural'}</span>
            <span>•</span>
            <span>Status: {agent.status || 'draft'}</span>
            <span>•</span>
            <span>Última modificação: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-xs">Conectado</span>
          </div>
        </div>
      </div>
      </div>
  )
}

// Componente principal com Suspense
export default function BuilderPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Carregando Builder...</p>
          </div>
        </div>
      }>
        <BuilderContent />
      </Suspense>
    </AuthGuard>
  )
}
