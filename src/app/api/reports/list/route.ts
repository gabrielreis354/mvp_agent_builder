import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession({ req: request as any, ...authOptions })
    
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const query = searchParams.get('query')
    
    // Buscar execuções do banco de dados que representam os "relatórios"
    const executions = await prisma.agentExecution.findMany({
      where: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        status: 'COMPLETED', // Apenas execuções concluídas
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })
    
    console.log(`📊 [Reports API] Found ${executions.length} completed executions for user ${session.user.id}`);
    
    // Transformar execuções em formato de "relatórios" compatível com ReportCache
    const reports = executions.map((exec: any) => {
      // Parse do outputData se for string
      let parsedOutput = exec.outputData;
      if (typeof parsedOutput === 'string') {
        try {
          parsedOutput = JSON.parse(parsedOutput);
        } catch (e) {
          parsedOutput = { raw: parsedOutput };
        }
      }

      return {
        id: exec.id,
        userId: exec.userId,
        organizationId: exec.organizationId,
        agentId: exec.agentId,
        agentName: exec.agent?.name || 'Agente Desconhecido',
        executionId: exec.executionId,
        timestamp: exec.createdAt.toISOString(),
        type: (exec.agent?.category?.toLowerCase() || 'generic') as 'contract' | 'resume' | 'expense' | 'document' | 'generic',
        result: {
          fields: parsedOutput?.analise_payload || parsedOutput || {},
          htmlReport: null, // Pode ser gerado sob demanda
          summary: parsedOutput?.analise_payload?.resumo_executivo || parsedOutput?.summary || '',
        },
        fileName: exec.inputData?.fileName || null,
        fileSize: exec.inputData?.fileSize || null,
        filePath: null,
        status: exec.status === 'COMPLETED' ? 'success' : (exec.status === 'FAILED' ? 'error' : 'processing'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      };
    })
    
    // Filtrar por query se fornecida
    let filteredReports = reports
    if (query) {
      filteredReports = reports.filter((r: any) => 
        r.agentName?.toLowerCase().includes(query.toLowerCase()) ||
        r.fileName?.toLowerCase().includes(query.toLowerCase()) ||
        r.result?.summary?.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    // Filtrar por tipo se fornecido
    if (type && type !== 'all') {
      filteredReports = filteredReports.filter((r: any) => r.type === type)
    }
    
    return NextResponse.json({
      success: true,
      reports: filteredReports,
      total: filteredReports.length
    })
    
  } catch (error) {
    console.error('Erro ao listar relatórios:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar relatórios',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
