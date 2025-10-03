'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExecutionStats {
  total: number
  successful: number
  failed: number
  avgProcessingTime: number
}

interface Execution {
  id: string
  agentName: string
  templateId: string
  status: string
  startedAt: string
  duration: number
  tokensUsed: number
  cost: number
}

export default function AgentsDashboard() {
  const [stats, setStats] = useState<ExecutionStats>({
    total: 0,
    successful: 0,
    failed: 0,
    avgProcessingTime: 0
  })
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Buscar estatísticas e execuções
      const [historyResponse, agentsResponse] = await Promise.all([
        fetch('/api/agents/history?limit=10'),
        fetch('/api/agents/save?limit=5')
      ])

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setStats(historyData.stats || stats)
        setRecentExecutions(historyData.executions || [])
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-400 bg-green-400/10'
      case 'failed':
      case 'error':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-yellow-400 bg-yellow-400/10'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Carregando analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics de Agentes</h2>
          <p className="text-gray-400 mt-1">
            Monitoramento e métricas de performance dos seus agentes automatizados
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-300">Erro: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Execuções
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">
              Todas as execuções registradas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Taxa de Sucesso
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.successful} de {stats.total} execuções
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatDuration(stats.avgProcessingTime)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tempo médio de processamento
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Execuções Falharam
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
            <p className="text-xs text-gray-400 mt-1">
              Execuções com erro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Execuções Recentes</CardTitle>
          <CardDescription>
            Últimas execuções de agentes registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentExecutions.length > 0 ? (
            <div className="space-y-3">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {execution.agentName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {execution.templateId} • {formatDate(execution.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDuration(execution.duration)}
                    </span>
                    {execution.tokensUsed > 0 && (
                      <span className="text-xs text-blue-400">
                        {execution.tokensUsed} tokens
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Nenhuma execução registrada
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                Execute alguns agentes para ver os dados de analytics aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance ao Longo do Tempo</CardTitle>
          <CardDescription>
            Gráfico de execuções e performance (implementação futura)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Gráfico de performance será implementado aqui
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Charts.js ou Recharts para visualização de dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
