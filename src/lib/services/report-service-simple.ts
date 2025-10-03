/**
 * Versão simplificada do report service para deploy
 * Remove dependências problemáticas do Redis
 */

export interface ReportCache {
  fileType?: string;
  id: string;
  userId: string;
  organizationId: string; // Multi-tenancy
  agentId: string
  agentName: string
  executionId: string
  timestamp: string
  type: 'contract' | 'resume' | 'expense' | 'document' | 'generic'
  result: any
  fileName?: string
  fileSize?: number
  filePath?: string
  status: 'success' | 'error' | 'processing'
  expiresAt: string
}

export interface UserStats {
  lastActivity?: string
  totalTokensUsed?: number
  totalReports: number
  successRate: number
  agentsUsed: number
  tokensUsed: number
  averageProcessingTime: number
  reportsThisMonth: number
  topAgents: Array<{ agentId: string; agentName: string; count: number }>
  recentActivity: Array<{ date: string; count: number }>
}

// Versão simplificada que usa localStorage/memória para MVP
export class ReportService {
  private reports: Map<string, ReportCache> = new Map()

  async saveReport(report: ReportCache): Promise<boolean> {
    try {
      this.reports.set(report.id, report)
      
      // Salvar no localStorage se disponível (client-side)
      if (typeof window !== 'undefined') {
        const existingReports = this.getLocalReports()
        existingReports.push(report)
        localStorage.setItem('automateai_reports', JSON.stringify(existingReports.slice(-50))) // Manter só os 50 mais recentes
      }
      
      return true
    } catch (error) {
      console.error('Erro ao salvar relatório:', error)
      return false
    }
  }

  async listReports(organizationId: string, limit = 20, offset = 0): Promise<ReportCache[]> {
    try {
      // Filtrar relatórios da organização
      const orgReports = Array.from(this.reports.values())
        .filter(report => report.organizationId === organizationId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(offset, offset + limit)

      // Complementar com localStorage se disponível
      if (typeof window !== 'undefined') {
        const localReports = this.getLocalReports();
        const filteredLocal = localReports
          .filter(report => report.organizationId === organizationId)
          .slice(offset, offset + limit)
        
        // Combinar sem duplicatas
        const combined = [...orgReports];
        filteredLocal.forEach(local => {
          if (!combined.find(r => r.id === local.id)) {
            combined.push(local);
          }
        });
        
        return combined.slice(0, limit);
      }

      return orgReports;
    } catch (error) {
      console.error('Erro ao listar relatórios:', error)
      return []
    }
  }

  async getReport(reportId: string): Promise<ReportCache | null> {
    try {
      // Tentar memória primeiro
      const memoryReport = this.reports.get(reportId)
      if (memoryReport) return memoryReport

      // Tentar localStorage
      if (typeof window !== 'undefined') {
        const localReports = this.getLocalReports()
        return localReports.find(r => r.id === reportId) || null
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      return null
    }
  }

  async getUserStats(organizationId: string): Promise<UserStats> {
    try {
      const orgReports = Array.from(this.reports.values())
        .filter(report => report.organizationId === organizationId)

      // Complementar com localStorage
      let allReports = orgReports;
      if (typeof window !== 'undefined') {
        const localReports = this.getLocalReports();
        const filteredLocal = localReports.filter(report => report.organizationId === organizationId);
        
        // Combinar sem duplicatas
        filteredLocal.forEach(local => {
          if (!allReports.find(r => r.id === local.id)) {
            allReports.push(local)
          }
        })
      }

      const totalReports = allReports.length
      const successfulReports = allReports.filter(r => r.status === 'success').length
      const successRate = totalReports > 0 ? (successfulReports / totalReports) * 100 : 0

      // Estatísticas básicas
      const agentsUsed = new Set(allReports.map(r => r.agentId)).size
      const tokensUsed = 0 // Simplificado para MVP
      const averageProcessingTime = 0 // Simplificado para MVP

      // Relatórios deste mês
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const reportsThisMonth = allReports.filter(r => 
        new Date(r.timestamp) >= thisMonth
      ).length

      // Top agentes
      const agentCounts = new Map<string, { agentName: string; count: number }>()
      allReports.forEach(report => {
        const existing = agentCounts.get(report.agentId)
        if (existing) {
          existing.count++
        } else {
          agentCounts.set(report.agentId, {
            agentName: report.agentName,
            count: 1
          })
        }
      })

      const topAgents = Array.from(agentCounts.entries())
        .map(([agentId, data]) => ({ agentId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Atividade recente (últimos 7 dias)
      const recentActivity = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const count = allReports.filter(r => 
          r.timestamp.startsWith(dateStr)
        ).length
        
        recentActivity.push({ date: dateStr, count })
      }

      return {
        totalReports,
        successRate,
        agentsUsed,
        tokensUsed,
        averageProcessingTime,
        reportsThisMonth,
        topAgents,
        recentActivity
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      return {
        totalReports: 0,
        successRate: 0,
        agentsUsed: 0,
        tokensUsed: 0,
        averageProcessingTime: 0,
        reportsThisMonth: 0,
        topAgents: [],
        recentActivity: []
      }
    }
  }

  private getLocalReports(): ReportCache[] {
    try {
      if (typeof window === 'undefined') return []
      
      const stored = localStorage.getItem('automateai_reports')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Erro ao ler relatórios do localStorage:', error)
      return []
    }
  }

  async searchReports(organizationId: string, query: string, limit = 20): Promise<ReportCache[]> {
    try {
      const allReports = await this.listReports(organizationId, 100);
      return allReports.filter(report => 
        report.agentName.toLowerCase().includes(query.toLowerCase()) ||
        (report.result?.summary || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit)
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      return []
    }
  }

  async getAgentReports(agentId: string, limit = 20): Promise<ReportCache[]> {
    try {
      const allReports = Array.from(this.reports.values())
        .filter(report => report.agentId === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
      return allReports
    } catch (error) {
      console.error('Erro ao buscar relatórios do agente:', error)
      return []
    }
  }

  async getUserReports(organizationId: string, limit = 20, offset = 0): Promise<ReportCache[]> {
    return this.listReports(organizationId, limit, offset);
  }

  async deleteReport(reportId: string): Promise<boolean> {
    try {
      this.reports.delete(reportId)

      // Remover do localStorage
      if (typeof window !== 'undefined') {
        const localReports = this.getLocalReports()
        const filtered = localReports.filter(r => r.id !== reportId)
        localStorage.setItem('automateai_reports', JSON.stringify(filtered))
      }

      return true
    } catch (error) {
      console.error('Erro ao deletar relatório:', error)
      return false
    }
  }
}

// Singleton instance
export const reportService = new ReportService()
