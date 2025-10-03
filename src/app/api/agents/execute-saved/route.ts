/**
 * API para executar agentes salvos
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { RuntimeEngine } from '@/lib/runtime-engine'
// Removido: import { reportGenerator } from '@/lib/reports/report-generator' - usando sistema JSON universal

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, inputData, parameters } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'ID do agente é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar agente no banco
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      )
    }

    // Preparar configuração do agente para execução
    const agentConfig = {
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      category: agent.category || 'custom',
      nodes: agent.nodes as any[],
      edges: agent.edges as any[],
      tags: agent.tags || [],
      version: agent.version || '1.0.0',
      isTemplate: agent.isTemplate || false,
      isPublic: agent.isPublic || false
    }

    // Executar agente usando o RuntimeEngine
    const engine = new RuntimeEngine()
    const executionResult = await engine.executeAgent(
      agentConfig,
      inputData || {},
      parameters
    )

    // Registrar execução no banco (incrementar contador)
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        metadata: {
          ...(agent.metadata as any),
          lastExecuted: new Date().toISOString(),
          executions: ((agent.metadata as any)?.executions || 0) + 1
        }
      }
    })

    // Se um formato de saída foi especificado, gerar o relatório
    const outputFormat = inputData?.outputFormat
    if (outputFormat && outputFormat !== 'json' && executionResult.success) {
      try {
        // 🎯 CORREÇÃO: Estruturar dados corretamente para o microserviço
        let reportContent;
        let aiResponse = '';
        
        // Extrair resposta da IA do resultado da execução
        if (typeof executionResult.output === 'string') {
          aiResponse = executionResult.output
        } else if (executionResult.output?.response) {
          aiResponse = executionResult.output.response
        } else if (executionResult.nodeResults) {
          // Procurar por nós de IA nos resultados
          const aiNodes = Object.values(executionResult.nodeResults).filter(
            (nodeResult: any) => nodeResult?.response && typeof nodeResult.response === 'string'
          )
          if (aiNodes.length > 0) {
            aiResponse = (aiNodes[0] as any).response
          }
        }
        
        if (aiResponse && aiResponse.length > 0) {
          // Se temos resposta da IA, estruturar como objeto de relatório
          reportContent = {
            summary: aiResponse,
            key_points: extractKeyPoints(aiResponse),
            recommendations: extractRecommendations(aiResponse),
            analysis_type: getAnalysisTypeFromAgent(agent, aiResponse),
            generated_at: new Date().toISOString(),
            raw_content: aiResponse // Incluir conteúdo bruto para debug
          }
        } else {
          // Fallback: usar output direto se disponível
          reportContent = executionResult.output || {
            summary: 'Análise processada com sucesso',
            key_points: ['Processamento concluído'],
            recommendations: ['Verifique os resultados'],
            analysis_type: 'Análise de Documento',
            generated_at: new Date().toISOString()
          }
        }
        
        // Função para detectar tipo de análise dinamicamente
        function getAnalysisTypeFromAgent(agent: any, aiResponse: string): string {
          // Verificar no nome do agente
          const agentName = (agent?.name || '').toLowerCase()
          if (agentName.includes('contrato')) return 'Análise de Contrato'
          if (agentName.includes('curriculo') || agentName.includes('triagem')) return 'Análise de Currículo'
          if (agentName.includes('educac') || agentName.includes('aula')) return 'Análise Educacional'
          if (agentName.includes('planilha') || agentName.includes('folha') || agentName.includes('finance')) return 'Análise Financeira'
          
          // Detectar pela resposta da IA
          const responseLower = aiResponse.toLowerCase()
          if (responseLower.includes('currículo') || responseLower.includes('curriculo') || responseLower.includes('candidato') || responseLower.includes('experiência relevante')) {
            return 'Análise de Currículo'
          }
          if (responseLower.includes('resumo') || responseLower.includes('matéria') || responseLower.includes('aula')) {
            return 'Resumo da Matéria'
          }
          if (responseLower.includes('contrato') || responseLower.includes('trabalhista')) {
            return 'Análise de Contrato'
          }
          if (responseLower.match(/planilha|folha|pagamento|despesa|gasto|financeir|orçamento|orcamento/)) {
            return 'Análise Financeira'
          }
          
          return 'Análise de Documento' // Fallback
        }

        console.log('🔍 Report content structure for saved agent:', {
          type: typeof reportContent,
          keys: Object.keys(reportContent),
          summaryLength: reportContent.summary?.length || 0
        })

        // 🔧 USAR SISTEMA JSON UNIVERSAL DIRETAMENTE (sem reportGenerator paralelo)
        console.log('🎯 [API SavedAgent] Using direct JSON Universal System instead of parallel reportGenerator');
        
        // Fazer chamada direta para o sistema universal
        const generateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: reportContent, 
            format: outputFormat,
            download: true,
            fileName: `${agent.name || 'relatorio'}.${outputFormat}`
          })
        });

        if (!generateResponse.ok) {
          throw new Error(`Document generation failed: ${generateResponse.statusText}`);
        }

        const reportResult = {
          fileBuffer: await generateResponse.arrayBuffer(),
          fileName: `${agent.name || 'relatorio'}.${outputFormat}`,
          mimeType: outputFormat === 'pdf' ? 'application/pdf' : 
                   outputFormat === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
                   'text/html'
        }
        
        // Funções auxiliares para extrair informações estruturadas
        function extractSection(text: string, titleRegex: RegExp): string[] {
          const sections: string[] = []
          const re = new RegExp(`${titleRegex.source}[:\n\s]*([\s\S]*?)(?=\n\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+:|\n\s*\u25A0|$)`, 'i')
          const match = text.match(re)
          if (match && match[1]) {
            const raw = match[1]
            const bullets = raw.split(/\n/)
              .map(l => l.trim())
              .filter(l => l.length > 0)
            sections.push(...bullets)
          }
          return sections
        }

        function extractBullets(text: string): string[] {
          return text.split('\n')
            .map(l => l.trim())
            .filter(l => /^(?:[-•*]|\d+[\.)])\s+/.test(l))
        }

        function topSentences(text: string, max = 6): string[] {
          const sentences = text
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 40)
          // Simples score por palavras-chave
          const keywords = /(anomalias?|disparidade|suspeit|despesa|gasto|economia|recomend|melhor|risco|conformidade|erro|oportunidade)/i
          return sentences
            .sort((a, b) => Number(b.match(keywords) !== null) - Number(a.match(keywords) !== null))
            .slice(0, max)
        }

        function extractKeyPoints(text: string): string[] {
          // Tentar extrair de seções comuns (exclui sugestões de economia para não duplicar com recomendações)
          const fromSections = [
            ...extractSection(text, /GASTOS SUSPEITOS|ITENS SUSPEITOS/),
            ...extractSection(text, /PADR[ÕO]ES AN[ÔO]MALOS?|ANOMALIAS/),
            ...extractSection(text, /CATEGORIZA[ÇC][ÃA]O DE DESPESAS|CATEGORIAS/),
            // sugestões de economia serão tratadas como recomendações
            ...extractSection(text, /PONTOS PRINCIPAIS|DESTAQUES|RESUMO EXECUTIVO/),
          ].filter(Boolean)

          const bullets = extractBullets(text)
          const combined = [...fromSections, ...bullets]
            .map(l => l.replace(/^(?:[-•*]|\d+[\.)])\s+/, '').trim())
            .filter((v, i, arr) => v && arr.indexOf(v) === i)

          if (combined.length >= 3) return combined.slice(0, 15)

          // Fallback: frases mais informativas
          const sentences = topSentences(text, 8)
          if (sentences.length > 0) return sentences

          return [text.substring(0, 300) + '...']
        }

        function extractRecommendations(text: string): string[] {
          const recs = [
            ...extractSection(text, /RECOMENDA[ÇC][ÕO]ES(?: ADICIONAIS)?/),
            ...extractSection(text, /A[ÇC][ÕO]ES SUGERIDAS|PR[ÓO]XIMOS PASSOS/),
            ...extractSection(text, /PLANO DE A[ÇC][ÃA]O/),
            ...extractSection(text, /SUGEST[ÕO]ES DE ECONOMIA|OTIMIZA[ÇC][ÃA]O/),
          ]

          if (recs.length >= 1) {
            return recs
              .map(l => l.replace(/^(?:[-•*]|\d+[\.)])\s+/, '').trim())
              .filter((v, i, arr) => v && arr.indexOf(v) === i)
              .slice(0, 12)
          }
          
          // Fallback simples
          return ['Revisar documento para possíveis melhorias']
        }

        // Preparar cabeçalhos com metadados úteis para o frontend e corrigir encoding do filename
        const originalFileName = reportResult.fileName || `${agent.name || 'relatorio'}.${outputFormat}`
        const asciiFileName = originalFileName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w.-]/g, '_')
        const encodedFileName = encodeURIComponent(originalFileName)

        // Extrair categorias de despesas e seções nomeadas para enriquecer a UI
        function extractExpenseCategories(text: string): { fixed: string[]; variable: string[] } {
          const result = { fixed: [] as string[], variable: [] as string[] }
          const catLines = extractSection(text, /CATEGORIZA[ÇC][ÃA]O DE DESPESAS|CATEGORIAS/)
          if (catLines.length === 0) return result
          let current: 'fixed' | 'variable' | '' = ''
          for (const raw of catLines) {
            const line = raw.trim()
            if (/Despesas\s*Fixas/i.test(line)) { current = 'fixed'; continue }
            if (/Despesas\s*Vari[áa]veis/i.test(line)) { current = 'variable'; continue }
            if (/^[-•*]/.test(line)) {
              if (current === 'fixed') result.fixed.push(line.replace(/^[-•*]\s*/, ''))
              else if (current === 'variable') result.variable.push(line.replace(/^[-•*]\s*/, ''))
            }
          }
          return result
        }

        const sectionsForMeta = {
          gastos_suspeitos: extractSection(aiResponse || String((reportContent as any)?.summary || ''), /GASTOS SUSPEITOS|ITENS SUSPEITOS/),
          padroes_anomalos: extractSection(aiResponse || String((reportContent as any)?.summary || ''), /PADR[ÕO]ES AN[ÔO]MALOS?|ANOMALIAS/),
          sugestoes_economia: extractSection(aiResponse || String((reportContent as any)?.summary || ''), /SUGEST[ÕO]ES DE ECONOMIA|OTIMIZA[ÇC][ÃA]O/),
        }
        const expenseCategoriesForMeta = extractExpenseCategories(aiResponse || String((reportContent as any)?.summary || ''))

        // Preparar metadados em Base64 (ASCII-safe para header)
        let encodedMeta = ''
        try {
          const metadataForHeader = {
            summary: String((reportContent as any)?.summary || ''),
            analysis_type: String((reportContent as any)?.analysis_type || ''),
            key_points: Array.isArray((reportContent as any)?.key_points) ? (reportContent as any).key_points.slice(0, 10) : [],
            recommendations: Array.isArray((reportContent as any)?.recommendations) ? (reportContent as any).recommendations.slice(0, 10) : [],
            sections: sectionsForMeta,
            expense_categories: expenseCategoriesForMeta
          }
          encodedMeta = Buffer.from(JSON.stringify(metadataForHeader), 'utf-8').toString('base64')
        } catch (e) {
          console.warn('⚠️ Failed to encode report metadata for header')
        }

        // Sanitizar valores dos headers para evitar caracteres inválidos
        const sanitizeHeaderValue = (value: string): string => {
          return value
            .replace(/[\r\n\t]/g, ' ')  // Remover quebras de linha e tabs
            .replace(/\s+/g, ' ')       // Normalizar espaços múltiplos
            .trim()                     // Remover espaços das bordas
            .substring(0, 1000)         // Limitar tamanho (mantém acentos)
        }

        const headers: Record<string, string> = {
          'Content-Type': reportResult.mimeType,
          // Inclui filename ASCII e UTF-8 (RFC 5987) para compatibilidade ampla
          'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
          // Metadados para a UI poder exibir resumo mesmo quando a resposta é binária
          'X-Report-Format': String(outputFormat),
          'X-Analysis-Type': sanitizeHeaderValue(String((reportContent as any)?.analysis_type || '')),
          'X-Analysis-Summary-Preview': sanitizeHeaderValue(String((reportContent as any)?.summary || '')),
          'X-Report-Execution-Id': String((executionResult as any)?.executionId || ''),
          'X-Report-File-Name': originalFileName,
          'X-Report-Metadata': encodedMeta,
        }

        return new NextResponse(reportResult.fileBuffer as any, {
          headers,
        })
      } catch (reportError) {
        console.error('❌ Report generation failed for saved agent:', reportError)
        
        // 🎯 CORREÇÃO: Retornar resposta de sucesso com aviso, não erro 500
        // O agente executou com sucesso, apenas a geração do relatório falhou
        return NextResponse.json({
          success: true,
          executionId: executionResult.executionId,
          result: executionResult,
          agent: { id: agent.id, name: agent.name },
          warning: `Agente executado com sucesso! Porém, houve um problema na geração do relatório no formato solicitado.`,
          reportError: reportError instanceof Error ? reportError.message : String(reportError),
          fallbackSuggestion: 'Tente novamente com formato PDF ou visualize o resultado na tela.',
          message: 'Execução concluída com sucesso (resultado disponível como JSON)'
        })
      }
    }

    // Se nenhum formato de saída foi especificado, retornar o resultado JSON
    return NextResponse.json({
      success: true,
      executionId: executionResult.executionId,
      result: executionResult,
      agent: {
        id: agent.id,
        name: agent.name
      },
      message: 'Agente executado com sucesso!'
    })

  } catch (error) {
    console.error('Error executing saved agent:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao executar agente',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
