import { NextRequest, NextResponse } from 'next/server'
import { marked } from 'marked'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, format, title, agentName, executionId } = body

    if (!content || !format) {
      return NextResponse.json(
        { error: 'Content and format are required' },
        { status: 400 }
      )
    }

    // Converter markdown para HTML formatado
    let htmlContent = ''
    try {
      if (typeof content === 'string') {
        // Converter markdown para HTML
        htmlContent = await marked(content, {
          breaks: true,
          gfm: true,
        })
      } else {
        htmlContent = JSON.stringify(content, null, 2)
      }
    } catch (error) {
      console.warn('⚠️ Failed to convert markdown, using raw content:', error)
      htmlContent = typeof content === 'string' ? content : JSON.stringify(content)
    }

    // Redirecionar para a API existente de geração de documentos
    // 🔓 Passar header de API interna para bypass da autenticação
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-api-key-fallback',
      },
      body: JSON.stringify({
        content: {
          metadata: {
            titulo_relatorio: title || agentName || 'Relatório SimplifiqueIA',
            tipo_analise: 'Análise Geral',
            execution_id: executionId,
            is_html_content: true, // Flag para microserviço saber que é HTML
          },
          analise_payload: {
            // ✅ Enviar HTML APENAS em um campo principal
            summary: htmlContent, // Campo que o microserviço já usa
            // Manter estrutura mínima para compatibilidade
            full_analysis: {
              html: htmlContent,
              raw_markdown: typeof content === 'string' ? content : JSON.stringify(content),
            }
          }
        },
        format,
        fileName: title || agentName || 'relatorio',
      }),
    })

    if (!generateResponse.ok) {
      const error = await generateResponse.json()
      throw new Error(error.details || 'Failed to generate document')
    }

    // Retornar o blob do documento gerado
    const blob = await generateResponse.blob()
    const headers = new Headers(generateResponse.headers)
    
    return new NextResponse(blob, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('❌ [REPORTS DOWNLOAD API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to download report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
