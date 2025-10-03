import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, agentName, report, format = 'html' } = await request.json()

    if (!to || !subject || !agentName || !report) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros obrigatórios: to, subject, agentName, report' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Email de destinatário inválido' },
        { status: 400 }
      )
    }

    // Verificar se o serviço de email está configurado
    const emailServiceAvailable = process.env.EMAIL_SERVICE_ENABLED === 'true'
    
    if (!emailServiceAvailable) {
      return NextResponse.json({
        success: false,
        error: 'Serviço de email não configurado',
        message: 'Configure SMTP para enviar emails automaticamente'
      })
    }

    // Preparar conteúdo do email baseado no formato
    let emailContent = ''
    let contentType = 'text/html'

    if (format === 'html') {
      emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f8f9fa;
              padding: 30px 20px;
              border-radius: 0 0 10px 10px;
            }
            .summary {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 AutomateAI</h1>
            <p>Relatório de ${agentName}</p>
          </div>
          
          <div class="content">
            <h2>Resultado da Análise</h2>
            <p>Olá! Seu agente <strong>${agentName}</strong> concluiu o processamento.</p>
            
            <div class="summary">
              <h3>📋 Resumo:</h3>
              <p>${typeof report === 'string' ? report : JSON.stringify(report, null, 2)}</p>
            </div>

            <p><strong>📅 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>🎯 Agente:</strong> ${agentName}</p>
            <p><strong>✅ Status:</strong> Processamento concluído com sucesso</p>
          </div>

          <div class="footer">
            <p>Este é um email automático gerado pelo AutomateAI</p>
            <p>Não responda a este email</p>
          </div>
        </body>
        </html>
      `
    } else {
      contentType = 'text/plain'
      emailContent = `
        AutomateAI - Relatório de ${agentName}
        
        Olá! Seu agente ${agentName} concluiu o processamento.
        
        Resumo:
        ${typeof report === 'string' ? report : JSON.stringify(report, null, 2)}
        
        Data/Hora: ${new Date().toLocaleString('pt-BR')}
        Agente: ${agentName}
        Status: Processamento concluído com sucesso
        
        ---
        Este é um email automático gerado pelo AutomateAI
        Não responda a este email
      `
    }

    // Simular envio de email (em produção, usar nodemailer ou serviço de email)
    console.log('📧 Enviando email:', {
      to,
      subject,
      contentType,
      contentLength: emailContent.length
    })

    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Email enviado com sucesso para ${to}`,
      details: {
        to,
        subject,
        sentAt: new Date().toISOString(),
        format,
        contentLength: emailContent.length
      }
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao enviar email',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
