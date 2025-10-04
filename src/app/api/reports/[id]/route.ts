import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { reportService } from '@/lib/services/report-service-prisma'

// GET - Buscar relatório específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const report = await reportService.getReport(params.id)
    
    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário tem permissão
    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este relatório' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      success: true,
      report
    })
    
  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// DELETE - Deletar relatório
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const success = await reportService.deleteReport(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Não foi possível deletar o relatório' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Relatório deletado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao deletar relatório:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao deletar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
