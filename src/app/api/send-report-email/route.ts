import { NextRequest, NextResponse } from 'next/server'
import { getEmailService } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, agentName, report, format = 'html', attachment } = await request.json()

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

    // Obter serviço de email
    const emailService = getEmailService()
    
    // Verificar se SMTP está configurado
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return NextResponse.json({
        success: false,
        error: 'Serviço de email não configurado',
        message: 'Configure as variáveis SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no .env.local'
      }, { status: 503 })
    }

    // Preparar conteúdo do email baseado no formato
    let emailContent = ''
    let contentType = 'text/html'

    // Processar report para extrair conteúdo formatado
    let reportContent = '';
    let parsedReport: any = null;
    
    // Parse do report se for string
    if (typeof report === 'string') {
      try {
        parsedReport = JSON.parse(report);
      } catch {
        reportContent = report;
      }
    } else {
      parsedReport = report;
    }
    
    // Se temos um objeto JSON estruturado, extrair campos importantes
    if (parsedReport && typeof parsedReport === 'object') {
      const payload = parsedReport.analise_payload || parsedReport;
      
      // Construir HTML formatado do JSON
      reportContent = '<div style="font-family: sans-serif;">';
      
      // Resumo Executivo
      if (payload.resumo_executivo) {
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">📋 Resumo Executivo</h4>
            <p style="margin: 0;">${payload.resumo_executivo}</p>
          </div>
        `;
      }
      
      // Dados Principais
      if (payload.dados_principais) {
        const dados = payload.dados_principais;
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #065f46;">👤 Dados Principais</h4>
            ${dados.nome ? `<p style="margin: 5px 0;"><strong>Nome:</strong> ${dados.nome}</p>` : ''}
            ${dados.cargo_pretendido ? `<p style="margin: 5px 0;"><strong>Cargo:</strong> ${dados.cargo_pretendido}</p>` : ''}
            ${dados.experiencia_anos ? `<p style="margin: 5px 0;"><strong>Experiência:</strong> ${dados.experiencia_anos} anos</p>` : ''}
            ${dados.formacao ? `<p style="margin: 5px 0;"><strong>Formação:</strong> ${dados.formacao}</p>` : ''}
          </div>
        `;
      }
      
      // Pontuação
      if (payload.pontuacao_geral) {
        const pont = payload.pontuacao_geral;
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">⭐ Pontuação</h4>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #2563eb;">${pont.total}/100</p>
            <p style="margin: 5px 0;"><strong>Classificação:</strong> ${pont.classificacao}</p>
          </div>
        `;
      }
      
      // Pontos Principais
      if (payload.pontos_principais && payload.pontos_principais.length > 0) {
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #166534;">✅ Pontos Fortes</h4>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${payload.pontos_principais.map((p: string) => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      // Pontos de Atenção
      if (payload.pontos_atencao && payload.pontos_atencao.length > 0) {
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Pontos de Atenção</h4>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${payload.pontos_atencao.map((p: string) => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      // Recomendações
      if (payload.recomendacoes && payload.recomendacoes.length > 0) {
        reportContent += `
          <div style="margin-bottom: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #2563eb; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">🎯 Recomendações</h4>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${payload.recomendacoes.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      reportContent += '</div>';
    } else {
      // Fallback: converter \n para <br>
      reportContent = String(reportContent).replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    }

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
            <h1>🤖 SimplifiqueIA RH</h1>
            <p>Relatório de ${agentName}</p>
          </div>
          
          <div class="content">
            <h2>Resultado da Análise</h2>
            <p>Olá! Seu agente <strong>${agentName}</strong> concluiu o processamento.</p>
            
            ${attachment ? '<p><strong>📎 Anexo:</strong> Documento completo em anexo</p>' : ''}
            
            <div class="summary">
              <h3>📋 Resumo:</h3>
              <div>${reportContent}</div>
            </div>

            <p><strong>📅 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>🎯 Agente:</strong> ${agentName}</p>
            <p><strong>✅ Status:</strong> Processamento concluído com sucesso</p>
          </div>

          <div class="footer">
            <p>Este é um email automático gerado pelo SimplifiqueIA RH</p>
            <p>Não responda a este email</p>
          </div>
        </body>
        </html>
      `
    } else {
      contentType = 'text/plain'
      emailContent = `
        SimplifiqueIA RH - Relatório de ${agentName}
        
        Olá! Seu agente ${agentName} concluiu o processamento.
        
        ${attachment ? 'Documento completo em anexo.\n\n' : ''}
        
        Resumo:
        ${reportContent.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}
        
        Data/Hora: ${new Date().toLocaleString('pt-BR')}
        Agente: ${agentName}
        Status: Processamento concluído com sucesso
        
        ---
        Este é um email automático gerado pelo SimplifiqueIA RH
        Não responda a este email
      `
    }

    // Preparar anexo se fornecido
    let attachments = undefined;
    if (attachment) {
      attachments = [{
        filename: attachment.filename,
        content: Buffer.from(attachment.content.data || attachment.content), // Suporta ambos os formatos
        contentType: attachment.contentType
      }];
      console.log(`📎 Anexando arquivo: ${attachment.filename} (${attachments[0].content.length} bytes)`);
    }

    // Enviar email usando o serviço real
    console.log('📧 Enviando email:', {
      to,
      subject,
      contentType,
      contentLength: emailContent.length,
      hasAttachment: !!attachment
    })

    const result = await emailService.sendEmail({
      to,
      subject,
      html: format === 'html' ? emailContent : undefined,
      text: format === 'text' ? emailContent : undefined,
      attachments: attachments
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Falha ao enviar email',
        message: 'Verifique a configuração SMTP no .env.local'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email enviado com sucesso para ${to}`,
      details: {
        to,
        subject,
        sentAt: new Date().toISOString(),
        format,
        messageId: result.messageId,
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
