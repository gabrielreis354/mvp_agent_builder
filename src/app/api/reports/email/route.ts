import { NextRequest, NextResponse } from 'next/server'
import { getEmailService } from '@/lib/email/email-service'
import { marked } from 'marked'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, content, title, format = 'pdf', agentName, executionId } = body

    // Validação
    if (!email || !content) {
      return NextResponse.json(
        { error: 'Email and content are required' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const reportTitle = title || 'Relatório SimplifiqueIA'

    // Converter markdown para HTML primeiro
    let htmlContent = ''
    try {
      if (typeof content === 'string') {
        htmlContent = await marked(content, {
          breaks: true,
          gfm: true,
        })
      } else {
        htmlContent = JSON.stringify(content, null, 2)
      }
    } catch (error) {
      console.warn('⚠️ Failed to convert markdown:', error)
      htmlContent = typeof content === 'string' ? content : JSON.stringify(content)
    }

    // Gerar documento primeiro
    let documentBuffer: Buffer | null = null
    let fileName = `${reportTitle.replace(/\s+/g, '_')}.${format}`
    
    if (format !== 'md') {
      try {
        const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-api-key-fallback',
          },
          body: JSON.stringify({
            content: {
              metadata: {
                titulo_relatorio: reportTitle,
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
            fileName: reportTitle,
          }),
        })

        if (generateResponse.ok) {
          const blob = await generateResponse.blob()
          documentBuffer = Buffer.from(await blob.arrayBuffer())
        }
      } catch (error) {
        console.warn('⚠️ Failed to generate document, sending text only:', error)
      }
    }

    // Preparar conteúdo do email (usar o HTML já convertido)
    const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    const formattedHtmlContent = htmlContent // Já convertido acima

    const emailHtmlTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                📊 ${reportTitle}
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Olá,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Segue em anexo o relatório gerado pela plataforma <strong>SimplifiqueIA</strong>.
              </p>
              
              ${documentBuffer ? `
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #1e293b;">
                  <strong>📎 Arquivo anexado:</strong> ${fileName}
                </p>
              </div>
              ` : `
              <div style="background-color: #ffffff; padding: 30px; margin: 30px 0; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px; font-size: 18px; color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                  📋 Conteúdo do Relatório
                </h3>
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;">
                  ${formattedHtmlContent}
                </div>
              </div>
              `}
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                Qualquer dúvida, estamos à disposição em 
                <a href="mailto:suporte@simplifiqueia.com.br" style="color: #3b82f6; text-decoration: none;">
                  suporte@simplifiqueia.com.br
                </a>
              </p>
              
              <p style="margin: 20px 0 0; font-size: 14px; color: #64748b;">
                Equipe <strong>SimplifiqueIA</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Este email foi enviado automaticamente pela plataforma SimplifiqueIA
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
                SimplifiqueIA RH - Automação Inteligente para Recursos Humanos
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Preparar anexos
    const attachments = documentBuffer ? [{
      filename: fileName,
      content: documentBuffer,
      contentType: format === 'pdf' ? 'application/pdf' : 
                   format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }] : undefined

    // Enviar email
    const emailService = getEmailService()
    const result = await emailService.sendEmail({
      to: email,
      subject: `${reportTitle} - SimplifiqueIA`,
      text: `${reportTitle}\n\n${textContent}`,
      html: emailHtmlTemplate,
      attachments,
    })

    if (!result.success) {
      console.error('❌ [REPORTS EMAIL API] Email service error:', result.error)
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error 
        },
        { status: 500 }
      )
    }

    console.log('✅ [REPORTS EMAIL API] Report sent to:', email)

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully',
      messageId: result.messageId
    })

  } catch (error) {
    console.error('❌ [REPORTS EMAIL API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send report email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
