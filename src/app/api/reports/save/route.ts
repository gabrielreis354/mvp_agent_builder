import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { reportService } from '@/lib/services/report-service-simple'
import type { ReportCache } from '@/lib/services/report-service-simple'

export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const report: ReportCache = await request.json()
    
    // Garantir que o userId seja do usuário autenticado
    report.userId = session.user.id
    
    // Gerar ID único se não tiver
    if (!report.id) {
      report.id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Definir timestamp se não tiver
    if (!report.timestamp) {
      report.timestamp = new Date().toISOString()
    }
    
    // Salvar relatório
    await reportService.saveReport(report)
    
    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Relatório salvo com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao salvar relatório:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao salvar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
