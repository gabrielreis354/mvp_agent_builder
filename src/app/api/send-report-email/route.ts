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
    
    // Função auxiliar para formatar nome de campo
    const formatFieldName = (fieldName: string): string => {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Função auxiliar para escolher cor do card baseado no tipo de campo
    const getCardStyle = (fieldName: string, index: number) => {
      const styles = [
        { bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '#3b82f6', color: '#1e40af' }, // Azul
        { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '#10b981', color: '#065f46' }, // Verde
        { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#f59e0b', color: '#92400e' }, // Amarelo
        { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '#2563eb', color: '#1e40af' }, // Azul escuro
        { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', border: '#ec4899', color: '#831843' }, // Rosa
      ];
      
      // Cores especiais para campos conhecidos
      if (fieldName.includes('resumo')) return styles[0];
      if (fieldName.includes('dados') || fieldName.includes('informacoes')) return styles[1];
      if (fieldName.includes('pontuacao') || fieldName.includes('score')) return styles[2];
      if (fieldName.includes('recomendacoes') || fieldName.includes('sugestoes')) return styles[3];
      if (fieldName.includes('riscos') || fieldName.includes('alertas')) return { bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '#dc2626', color: '#991b1b' };
      
      // Rotacionar cores para outros campos
      return styles[index % styles.length];
    };

    // Função recursiva para renderizar qualquer estrutura de dados
    const renderDynamicContent = (data: any, depth: number = 0, cardIndex: number = 0): string => {
      let html = '';
      
      if (typeof data === 'string') {
        return `<p style="margin: 0; color: #334155; line-height: 1.6;">${data}</p>`;
      }
      
      if (typeof data === 'number' || typeof data === 'boolean') {
        return `<p style="margin: 0; color: #334155; font-weight: 600;">${data}</p>`;
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) return '';
        
        // Se é array de strings simples, renderizar como lista
        if (data.every(item => typeof item === 'string')) {
          return `
            <ul style="margin: 0; padding-left: 20px; list-style: none;">
              ${data.map(item => `<li style="margin: 8px 0; padding: 10px; background: white; border-radius: 6px; position: relative; padding-left: 30px;"><span style="position: absolute; left: 10px; color: #3b82f6; font-weight: bold;">•</span>${item}</li>`).join('')}
            </ul>
          `;
        }
        
        // Se é array de objetos, renderizar cada um
        return data.map((item, idx) => renderDynamicContent(item, depth + 1, cardIndex + idx)).join('');
      }
      
      if (typeof data === 'object' && data !== null) {
        let localCardIndex = cardIndex;
        
        for (const [key, value] of Object.entries(data)) {
          // Pular campos internos ou vazios
          if (key === 'full_analysis' || key === 'metadata' || value === null || value === undefined) continue;
          
          const fieldTitle = formatFieldName(key);
          const style = getCardStyle(key, localCardIndex);
          
          // Se é um objeto simples (chave-valor), renderizar como card de dados
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length <= 5) {
            const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined);
            if (entries.length > 0) {
              html += `
                <div style="margin-bottom: 16px; padding: 20px; background: ${style.bg}; border-left: 5px solid ${style.border}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <h4 style="margin: 0 0 12px 0; color: ${style.color}; font-size: 18px;">📊 ${fieldTitle}</h4>
                  <div style="display: grid; gap: 8px;">
                    ${entries.map(([k, v]) => `
                      <p style="margin: 0; padding: 8px; background: white; border-radius: 6px;">
                        <strong style="color: ${style.border};">${formatFieldName(k)}:</strong> 
                        <span style="color: #334155;">${v}</span>
                      </p>
                    `).join('')}
                  </div>
                </div>
              `;
            }
          }
          // Se é uma string ou número, renderizar como card simples
          else if (typeof value === 'string' || typeof value === 'number') {
            html += `
              <div style="margin-bottom: 16px; padding: 20px; background: ${style.bg}; border-left: 5px solid ${style.border}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 12px 0; color: ${style.color}; font-size: 18px;">📋 ${fieldTitle}</h4>
                ${renderDynamicContent(value, depth + 1, localCardIndex)}
              </div>
            `;
          }
          // Se é um array, renderizar como card com lista
          else if (Array.isArray(value) && value.length > 0) {
            html += `
              <div style="margin-bottom: 16px; padding: 20px; background: ${style.bg}; border-left: 5px solid ${style.border}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 12px 0; color: ${style.color}; font-size: 18px;">📌 ${fieldTitle}</h4>
                ${renderDynamicContent(value, depth + 1, localCardIndex)}
              </div>
            `;
          }
          // Se é um objeto complexo, renderizar recursivamente
          else if (typeof value === 'object') {
            html += `
              <div style="margin-bottom: 16px; padding: 20px; background: ${style.bg}; border-left: 5px solid ${style.border}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 12px 0; color: ${style.color}; font-size: 18px;">🔍 ${fieldTitle}</h4>
                ${renderDynamicContent(value, depth + 1, localCardIndex)}
              </div>
            `;
          }
          
          localCardIndex++;
        }
      }
      
      return html;
    };

    // Se temos um objeto JSON estruturado, renderizar dinamicamente
    if (parsedReport && typeof parsedReport === 'object') {
      const payload = parsedReport.analise_payload || parsedReport;
      
      console.log('📧 Renderizando email com campos:', Object.keys(payload));
      
      // Construir HTML formatado dinamicamente
      reportContent = '<div style="font-family: sans-serif;">';
      reportContent += renderDynamicContent(payload, 0, 0);
      reportContent += '</div>';
      
      // Se não gerou nenhum conteúdo, usar fallback
      if (reportContent === '<div style="font-family: sans-serif;"></div>') {
        console.log('⚠️ Nenhum conteúdo renderizado, usando fallback');
        reportContent = `<p style="color: #334155;">${JSON.stringify(payload, null, 2).replace(/\n/g, '<br>')}</p>`;
      }
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
              padding: 0;
              border-radius: 12px;
              margin: 20px 0;
            }
            .card {
              margin-bottom: 16px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              overflow: hidden;
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
            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h2 style="margin: 0 0 10px 0; color: #1e293b;">✨ Resultado da Análise</h2>
              <p style="margin: 0; color: #64748b;">Seu agente <strong style="color: #667eea;">${agentName}</strong> concluiu o processamento com sucesso!</p>
            </div>
            
            ${attachment ? '<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #f59e0b;"><p style="margin: 0; color: #92400e;"><strong>📎 Anexo:</strong> Documento completo disponível em anexo</p></div>' : ''}
            
            <div class="summary">
              ${reportContent}
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="display: grid; gap: 10px;">
                <p style="margin: 0; padding: 10px; background: #f8fafc; border-radius: 6px;"><strong style="color: #667eea;">📅 Data/Hora:</strong> <span style="color: #334155;">${new Date().toLocaleString('pt-BR')}</span></p>
                <p style="margin: 0; padding: 10px; background: #f8fafc; border-radius: 6px;"><strong style="color: #667eea;">🎯 Agente:</strong> <span style="color: #334155;">${agentName}</span></p>
                <p style="margin: 0; padding: 10px; background: #f0fdf4; border-radius: 6px;"><strong style="color: #16a34a;">✅ Status:</strong> <span style="color: #166534; font-weight: 600;">Processamento concluído</span></p>
              </div>
            </div>
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
      console.log('📎 [SEND-REPORT-EMAIL] Processando anexo:', {
        filename: attachment.filename,
        mimeType: attachment.contentType,
        hasContent: !!attachment.content,
        contentIsBuffer: Buffer.isBuffer(attachment.content),
        contentHasData: !!(attachment.content?.data),
        contentType: typeof attachment.content
      });

      // Converter conteúdo para Buffer
      let contentBuffer: Buffer;
      
      if (Buffer.isBuffer(attachment.content)) {
        // Já é um Buffer
        contentBuffer = attachment.content;
        console.log('📎 [SEND-REPORT-EMAIL] Conteúdo já é Buffer');
      } else if (attachment.content?.data && Array.isArray(attachment.content.data)) {
        // Buffer serializado como JSON (formato: {type: 'Buffer', data: [...]})
        contentBuffer = Buffer.from(attachment.content.data);
        console.log('📎 [SEND-REPORT-EMAIL] Convertido de JSON serializado para Buffer');
      } else if (attachment.content?.data && Buffer.isBuffer(attachment.content.data)) {
        // Nested buffer
        contentBuffer = attachment.content.data;
        console.log('📎 [SEND-REPORT-EMAIL] Extraído Buffer aninhado');
      } else if (typeof attachment.content === 'string') {
        // String base64 ou texto
        contentBuffer = Buffer.from(attachment.content, 'base64');
        console.log('📎 [SEND-REPORT-EMAIL] Convertido de string base64 para Buffer');
      } else {
        console.error('❌ [SEND-REPORT-EMAIL] Formato de conteúdo não reconhecido:', attachment.content);
        throw new Error('Formato de anexo inválido');
      }

      attachments = [{
        filename: attachment.filename,
        content: contentBuffer,
        contentType: attachment.contentType
      }];
      
      console.log(`✅ [SEND-REPORT-EMAIL] Anexo preparado: ${attachment.filename} (${contentBuffer.length} bytes, ${attachment.contentType})`);
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
