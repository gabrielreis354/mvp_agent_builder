'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  Star, 
  Clock, 
  Trash2, 
  Edit, 
  MoreVertical,
  FileText,
  Calendar,
  Activity,
  Filter,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { GenericResultsModal } from './generic-results-modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { AgentExecutionModalV2 } from './agent-execution-modal-v2'

interface SavedAgent {
  id: string
  name: string
  description: string
  category: string;
  nodes: any;
  edges: any;
  templateId: string
  createdAt: Date
  updatedAt: Date
  executions: number
  lastExecuted?: string
  isFavorite: boolean
  configuration?: {
    nodes: any[]
    edges: any[]
  }
}

export function SavedAgentsList() {
  const [agents, setAgents] = useState<SavedAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [executingAgent, setExecutingAgent] = useState<SavedAgent | null>(null)
  const [executionStartTime, setExecutionStartTime] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<SavedAgent | null>(null)
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [agentToExecute, setAgentToExecute] = useState<SavedAgent | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAgents()
    
    // Escutar evento de agente salvo
    const handleAgentSaved = () => fetchAgents()
    window.addEventListener('agent-saved', handleAgentSaved)
    
    return () => {
      window.removeEventListener('agent-saved', handleAgentSaved)
    }
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/save?userId=demo-user')
      const data = await response.json()
      
      if (data.success) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async (agent: SavedAgent) => {
    try {
      toast({ title: "Carregando agente...", description: `Preparando ${agent.name} para execução.` });

      // 🎯 CORREÇÃO: Buscar a configuração completa do agente via API.
      const response = await fetch(`/api/agents/save?id=${agent.id}`);
      const data = await response.json();

      if (!data.success || !data.agent) {
        throw new Error(data.error || 'Não foi possível carregar a configuração do agente.');
      }

      const fullAgentConfig = data.agent;

      // Verificar se a configuração completa foi recebida
      if (!fullAgentConfig.nodes || !fullAgentConfig.edges) {
         throw new Error('A configuração recebida da API está incompleta (sem nós ou conexões).');
      }

      setExecutionStartTime(new Date().toISOString());
      setAgentToExecute(fullAgentConfig);
      setShowExecutionModal(true);

    } catch (error) {
      console.error('Error loading agent for execution:', error);
      toast({
        title: "Erro ao preparar execução",
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        variant: "destructive",
      });
    }
  }

  const handleExecutionComplete = (result: any) => {
    console.log('📊 handleExecutionComplete - result:', result)
    console.log('📊 handleExecutionComplete - result structure:', {
      type: typeof result,
      keys: result ? Object.keys(result) : 'null',
      nodeResults: result?.nodeResults ? Object.keys(result.nodeResults) : 'no nodeResults',
      hasResult: !!result?.result,
      resultType: typeof result?.result
    })
    
    console.log('📊 handleExecutionComplete - FULL result object:', JSON.stringify(result, null, 2).substring(0, 1000))
    
    // ✅ CORREÇÃO: NÃO fechar modal aqui - deixar o modal interno controlar
    // O AgentExecutionModalV2 agora mostra o resultado e tem botão "Fechar"
    // setShowExecutionModal(false) // ← Removido para permitir visualização do resultado
    
    // 🎯 CORREÇÃO CRÍTICA: Melhorar estruturação dos dados para o GenericResultsModal
    const formattedResult = {
      // Preservar a estrutura original que o modal precisa
      ...result,
      // 🔧 NOVO: Garantir que nodeResults existe e está bem estruturado
      nodeResults: result.nodeResults || result.result?.nodeResults || {},
      // 🔧 NOVO: Se o resultado principal tem output, garantir que está acessível
      result: {
        ...result.result,
        // Garantir que o output está disponível em múltiplos locais para o parser encontrar
        output: result.result?.output || result.output || result.finalOutput,
        response: result.result?.response || result.response,
        summary: result.result?.summary || result.summary
      },
      // Metadata para compatibilidade
      metadata: {
        totalTokens: result.result?.tokens_used || 0,
        provider: result.result?.provider || 'openai',
        format: result.metadata?.format || result.result?.format || result.format
      },
      // Compatibilidade com estrutura antiga
      executionId: result.executionId,
      status: result.success ? 'success' : 'error',
      startTime: result.startTime || new Date().toISOString(),
      endTime: result.completedAt || new Date().toISOString(),
      duration: result.executionTime || 0,
      steps: result.steps || [],
      finalOutput: result.result || result,
      error: result.success ? undefined : result.error
    }
    
    console.log('🔧 [SavedAgentsList] Formatted result for GenericResultsModal:', {
      hasNodeResults: !!formattedResult.nodeResults,
      nodeResultsKeys: Object.keys(formattedResult.nodeResults || {}),
      hasResultOutput: !!formattedResult.result?.output,
      resultOutputType: typeof formattedResult.result?.output,
      resultOutputPreview: typeof formattedResult.result?.output === 'string' ? 
        formattedResult.result.output.substring(0, 200) + '...' : 'not string'
    })
    
    // Mostrar resultados no modal
    setExecutionResult(formattedResult)
    setShowResultModal(true)
    setExecutingAgent(agentToExecute)
    
    // Atualizar lista para refletir nova execução
    fetchAgents()
    
    toast({
      title: "Agente executado com sucesso!",
      description: `${agentToExecute?.name} foi executado com dados reais`,
    })
  }

  const handleToggleFavorite = async (agent: SavedAgent) => {
    try {
      const response = await fetch('/api/agents/save', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: agent.id,
          isFavorite: !agent.isFavorite
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: !agent.isFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos",
          description: agent.name,
        })
        
        // Atualizar estado local
        setAgents(agents.map(a => 
          a.id === agent.id ? { ...a, isFavorite: !a.isFavorite } : a
        ))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Erro",
        description: `Erro ao ${agent.isFavorite ? 'remover dos' : 'adicionar aos'} favoritos`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (agent: SavedAgent) => {
    try {
      // Buscar dados completos do agente
      const response = await fetch(`/api/agents/${agent.id}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar agente')
      }
      
      const fullAgent = data.agent
      
      // Configuração completa do agente
      const agentConfig = {
        id: fullAgent.id,
        name: fullAgent.name,
        description: fullAgent.description || '',
        templateId: fullAgent.metadata?.templateId || agent.templateId,
        configuration: {
          nodes: fullAgent.nodes || [],
          edges: fullAgent.edges || []
        },
        metadata: fullAgent.metadata || {}
      }
      
      // Armazenar no localStorage para o builder carregar
      localStorage.setItem('editingAgent', JSON.stringify(agentConfig))
      
      toast({
        title: "Carregando editor",
        description: `Abrindo ${agent.name} para edição...`,
      })
      
      // Redirecionar para o builder após um pequeno delay
      setTimeout(() => {
        window.location.href = `/builder?edit=${agent.id}`
      }, 500)
      
    } catch (error) {
      console.error('Error loading agent for edit:', error)
      toast({
        title: "Erro ao carregar agente",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (agent: SavedAgent) => {
    setAgentToDelete(agent)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return
    
    try {
      const response = await fetch(`/api/agents/save?id=${agentToDelete.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Agente excluído",
          description: `${agentToDelete.name} foi excluído com sucesso`,
          variant: "destructive",
        })
        
        // Remover da lista local
        setAgents(agents.filter(a => a.id !== agentToDelete.id))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast({
        title: "Erro ao excluir",
        description: `Falha ao excluir ${agentToDelete.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      })
    } finally {
      setAgentToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtrar agentes baseado no filtro selecionado
  const filteredAgents = agents.filter(agent => {
    if (filter === 'favorites') {
      return agent.isFavorite
    }
    return true
  })

  const favoriteCount = agents.filter(agent => agent.isFavorite).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando agentes salvos...</span>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum agente salvo</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Customize um template e clique em "Salvar Agente" para criar sua biblioteca pessoal
          </p>
        </CardContent>
      </Card>
    )
  }

  if (filteredAgents.length === 0 && filter === 'favorites') {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Heart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum favorito ainda</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Adicione agentes aos favoritos para acessá-los rapidamente
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilter('all')} 
            className="mt-4"
          >
            Ver todos os agentes
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Meus Agentes Salvos</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-600 overflow-hidden">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-none border-0"
            >
              <Filter className="h-3 w-3 mr-1" />
              Todos ({agents.length})
            </Button>
            <Button
              variant={filter === 'favorites' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('favorites')}
              className="rounded-none border-0"
            >
              <Star className="h-3 w-3 mr-1" />
              Favoritos ({favoriteCount})
            </Button>
          </div>
          <Badge variant="secondary">{filteredAgents.length} {filter === 'favorites' ? 'favoritos' : 'agentes'}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="relative hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {agent.description || 'Agente personalizado criado no builder'}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleFavorite(agent)}>
                      <Star className="mr-2 h-4 w-4" />
                      {agent.isFavorite ? 'Remover favorito' : 'Adicionar favorito'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(agent)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(agent)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Criado {formatDate(agent.createdAt.toISOString())}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  <span>{agent.executions} execuções</span>
                </div>
                
                {agent.lastExecuted && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Última: {formatDate(agent.lastExecuted)}</span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pt-3">
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => handleExecute(agent)}
              >
                <Play className="mr-2 h-4 w-4" />
                Executar
              </Button>
            </CardFooter>
            
            {agent.isFavorite && (
              <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
            )}
          </Card>
        ))}
      </div>

      {/* Modal de Resultados Genérico */}
      <GenericResultsModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        agentName={executingAgent?.name || 'Agente'}
        result={executionResult}
        executedAt={executionStartTime || new Date().toISOString()}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setAgentToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Agente"
        description={`Tem certeza que deseja excluir "${agentToDelete?.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        icon={<Trash2 className="h-6 w-6" />}
      />

      {/* Modal de Execução de Agente */}
      {showExecutionModal && agentToExecute && (
        <AgentExecutionModalV2
          isOpen={showExecutionModal}
          onClose={() => {
            setShowExecutionModal(false)
            setAgentToExecute(null)
          }}
          agent={agentToExecute}
          onExecutionComplete={handleExecutionComplete}
        />
      )}
    </div>
  )
}
