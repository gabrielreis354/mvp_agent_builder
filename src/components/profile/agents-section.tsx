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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{agent.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {agent.description || 'Sem descrição'}
                  </p>
                </div>
                <Brain className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {agent.type || 'Custom'}
                </Badge>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300"
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
                    title="Executar agente"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-300"
                    onClick={() => window.location.href = `/builder?load=${agent.id}`}
                    title="Editar agente"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
