'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, Grid, List, FileText, 
  Download, Eye, Trash2, Calendar, Clock,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ReportCard } from './report-card'
import type { ReportCache } from '@/lib/services/report-service-prisma'

interface ReportsSectionProps {
  userId: string
}

export function ReportsSection({ userId }: ReportsSectionProps) {
  const [reports, setReports] = useState<ReportCache[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const limit = 12

  useEffect(() => {
    fetchReports()
  }, [filter, page])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString()
      })
      
      if (filter !== 'all') {
        params.append('type', filter)
      }
      
      if (searchQuery) {
        params.append('query', searchQuery)
      }

      const response = await fetch(`/api/reports/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchReports()
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setReports(reports.filter(r => r.id !== reportId))
      }
    } catch (error) {
      console.error('Erro ao deletar relatório:', error)
    }
  }

  const typeLabels = {
    contract: 'Contrato',
    resume: 'Currículo',
    expense: 'Despesa',
    document: 'Documento',
    generic: 'Genérico'
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      {/* Header e Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Relatórios Recentes</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Busca */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar relatórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
          
          {/* Filtros */}
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(0)
            }}
            className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Todos os tipos</option>
            <option value="contract">Contratos</option>
            <option value="resume">Currículos</option>
            <option value="expense">Despesas</option>
            <option value="document">Documentos</option>
            <option value="generic">Genérico</option>
          </select>
          
          {/* Modo de visualização */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Nenhum relatório encontrado</p>
          <p className="text-gray-500 text-sm">
            Execute um agente para gerar seu primeiro relatório
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-4'
          }>
            {reports.map(report => (
              <ReportCard 
                key={report.id} 
                report={report} 
                viewMode={viewMode}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Paginação */}
          {reports.length === limit && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                variant="secondary"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-gray-400">
                Página {page + 1}
              </span>
              
              <Button
                onClick={() => setPage(page + 1)}
                disabled={reports.length < limit}
                variant="secondary"
                size="sm"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
