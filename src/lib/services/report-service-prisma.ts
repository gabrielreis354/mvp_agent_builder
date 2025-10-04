/**
 * Report service com persistência em PostgreSQL via Prisma
 */

import { prisma } from '@/lib/database/prisma'

export interface ReportCache {
  fileType?: string;
  id: string;
  userId: string;
  organizationId: string;
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

export class ReportService {
  async saveReport(report: ReportCache): Promise<boolean> {
    try {
      await prisma.report.create({
        data: {
          id: report.id,
          userId: report.userId,
          organizationId: report.organizationId,
          agentId: report.agentId,
          executionId: report.executionId,
          agentName: report.agentName,
          timestamp: new Date(report.timestamp),
          type: report.type,
          result: report.result,
          fileName: report.fileName,
          fileSize: report.fileSize,
          fileType: report.fileType,
          filePath: report.filePath,
          status: report.status,
          expiresAt: report.expiresAt ? new Date(report.expiresAt) : null,
        },
      })
      
      console.log(`✅ Report saved to database: ${report.id}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar relatório no banco:', error)
      return false
    }
  }

  async listReports(organizationId: string, limit = 20, offset = 0): Promise<ReportCache[]> {
    try {
      const reports = await prisma.report.findMany({
        where: { organizationId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      })

      return reports.map(r => ({
        id: r.id,
        userId: r.userId,
        organizationId: r.organizationId,
        agentId: r.agentId,
        agentName: r.agentName,
        executionId: r.executionId,
        timestamp: r.timestamp.toISOString(),
        type: r.type as any,
        result: r.result,
        fileName: r.fileName || undefined,
        fileSize: r.fileSize || undefined,
        fileType: r.fileType || undefined,
        filePath: r.filePath || undefined,
        status: r.status as any,
        expiresAt: r.expiresAt?.toISOString() || '',
      }))
    } catch (error) {
      console.error('Erro ao listar relatórios:', error)
      return []
    }
  }

  async getReport(reportId: string): Promise<ReportCache | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      })

      if (!report) return null

      return {
        id: report.id,
        userId: report.userId,
        organizationId: report.organizationId,
        agentId: report.agentId,
        agentName: report.agentName,
        executionId: report.executionId,
        timestamp: report.timestamp.toISOString(),
        type: report.type as any,
        result: report.result,
        fileName: report.fileName || undefined,
        fileSize: report.fileSize || undefined,
        fileType: report.fileType || undefined,
        filePath: report.filePath || undefined,
        status: report.status as any,
        expiresAt: report.expiresAt?.toISOString() || '',
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      return null
    }
  }

  async getUserStats(organizationId: string): Promise<UserStats> {
    try {
      const reports = await prisma.report.findMany({
        where: { organizationId },
      })

      const totalReports = reports.length
      const successfulReports = reports.filter(r => r.status === 'success').length
      const successRate = totalReports > 0 ? (successfulReports / totalReports) * 100 : 0

      const agentsUsed = new Set(reports.map(r => r.agentId)).size
      const tokensUsed = 0
      const averageProcessingTime = 0

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const reportsThisMonth = reports.filter(r => r.timestamp >= thisMonth).length

      const agentCounts = new Map<string, { agentName: string; count: number }>()
      reports.forEach(report => {
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

      const recentActivity = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const count = reports.filter(r => 
          r.timestamp.toISOString().startsWith(dateStr)
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

  async searchReports(organizationId: string, query: string, limit = 20): Promise<ReportCache[]> {
    try {
      const reports = await prisma.report.findMany({
        where: {
          organizationId,
          OR: [
            { agentName: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })

      return reports.map(r => ({
        id: r.id,
        userId: r.userId,
        organizationId: r.organizationId,
        agentId: r.agentId,
        agentName: r.agentName,
        executionId: r.executionId,
        timestamp: r.timestamp.toISOString(),
        type: r.type as any,
        result: r.result,
        fileName: r.fileName || undefined,
        fileSize: r.fileSize || undefined,
        fileType: r.fileType || undefined,
        filePath: r.filePath || undefined,
        status: r.status as any,
        expiresAt: r.expiresAt?.toISOString() || '',
      }))
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      return []
    }
  }

  async getAgentReports(agentId: string, limit = 20): Promise<ReportCache[]> {
    try {
      const reports = await prisma.report.findMany({
        where: { agentId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })

      return reports.map(r => ({
        id: r.id,
        userId: r.userId,
        organizationId: r.organizationId,
        agentId: r.agentId,
        agentName: r.agentName,
        executionId: r.executionId,
        timestamp: r.timestamp.toISOString(),
        type: r.type as any,
        result: r.result,
        fileName: r.fileName || undefined,
        fileSize: r.fileSize || undefined,
        fileType: r.fileType || undefined,
        filePath: r.filePath || undefined,
        status: r.status as any,
        expiresAt: r.expiresAt?.toISOString() || '',
      }))
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
      await prisma.report.delete({
        where: { id: reportId },
      })

      return true
    } catch (error) {
      console.error('Erro ao deletar relatório:', error)
      return false
    }
  }
}

// Singleton instance
export const reportService = new ReportService()
