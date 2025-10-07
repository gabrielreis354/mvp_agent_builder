'use client'

import { useState, useEffect } from 'react'
import { Brain, Plus, Edit, Play } from 'lucide-react';
import { AgentCardSkeleton } from './agent-card-skeleton';
import { useExecutionStore } from '@/lib/store/execution-store';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AgentsSectionProps {
  userId: string
}

export function AgentsSection({ userId }: AgentsSectionProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useExecutionStore();

  useEffect(() => {
    fetchAgents()
  }, [userId])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      // Usar API específica para agentes salvos (não executados)
      const response = await fetch('/api/agents/saved')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
        console.log(`📋 Seção perfil: ${data.agents?.length || 0} agentes criados encontrados`)
      } else {
        // Fallback: tentar a API original
        const fallbackResponse = await fetch('/api/agents/save')
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setAgents(fallbackData.agents || fallbackData.workflows || [])
          console.log(`📋 Seção perfil (fallback): ${(fallbackData.agents || fallbackData.workflows || []).length} agentes encontrados`)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar agentes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Meus Agentes</h2>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled><Plus className="w-4 h-4 mr-2" />Novo Agente</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Meus Agentes</h2>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => window.location.href = '/builder'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Lista de Agentes */}
      {agents.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Nenhum agente encontrado</p>
          <p className="text-gray-500 text-sm">
            Crie seu primeiro agente para começar a automatizar processos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="group relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              {/* Ícone do Agente */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>

              {/* Conteúdo Principal */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 pr-8 line-clamp-1">
                  {agent.name}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                  {agent.description || 'Sem descrição disponível'}
                </p>
              </div>

              {/* Badge e Metadados */}
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs font-medium px-2 py-1"
                >
                  {agent.type || 'Custom'}
                </Badge>
                {agent.nodes && (
                  <span className="text-xs text-gray-400">
                    {agent.nodes.length} nós
                  </span>
                )}
              </div>

              {/* Separador */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/agents/${agent.id}`);
                      if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.agent) {
                          openModal(data.agent);
                        } else {
                          console.error('Failed to fetch full agent data:', data.error);
                          alert('Erro ao carregar dados do agente.');
                        }
                      } else {
                        throw new Error('Failed to fetch agent data');
                      }
                    } catch (error) {
                      console.error('Error executing agent:', error);
                      alert('Ocorreu um erro ao tentar executar o agente.');
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Executar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
                  onClick={() => window.location.href = `/builder?load=${agent.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
