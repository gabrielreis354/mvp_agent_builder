import { NextRequest, NextResponse } from 'next/server'
import { getEmailService } from '@/lib/email/email-service'
import { BRANDING } from '@/config/branding'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, type, rating, message } = body

    // Validação
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Emojis por tipo de feedback
    const typeEmojis: Record<string, string> = {
      suggestion: '💡',
      bug: '🐛',
      compliment: '👏',
      question: '❓',
      other: '💬'
    }

    // Labels por tipo
    const typeLabels: Record<string, string> = {
      suggestion: 'Sugestão',
      bug: 'Reportar Bug',
      compliment: 'Elogio',
      question: 'Dúvida',
      other: 'Outro'
    }

    const typeEmoji = typeEmojis[type] || '💬'
    const typeLabel = typeLabels[type] || 'Feedback'

    // Gerar estrelas para avaliação
    const starsDisplay = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)

    // Preparar HTML do email
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Feedback - SimplifiqueIA</title>
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
                ${typeEmoji} Novo Feedback Recebido
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Tipo e Avaliação -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <strong style="color: #1e293b; font-size: 14px;">Tipo de Feedback:</strong>
                      <span style="display: inline-block; margin-left: 10px; background-color: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                        ${typeLabel}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong style="color: #1e293b; font-size: 14px;">Avaliação:</strong>
                      <span style="margin-left: 10px; font-size: 18px;">
                        ${starsDisplay}
                      </span>
                      <span style="color: #64748b; font-size: 14px; margin-left: 5px;">
                        (${rating}/5)
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Dados do Usuário -->
              <h2 style="margin: 0 0 15px; font-size: 16px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                👤 Informações do Usuário
              </h2>
              
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="color: #64748b; font-size: 14px; width: 100px;"><strong>Nome:</strong></td>
                  <td style="color: #1e293b; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
                  <td style="color: #1e293b; font-size: 14px;">
                    <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">
                      ${email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px;"><strong>Data:</strong></td>
                  <td style="color: #1e293b; font-size: 14px;">
                    ${new Date().toLocaleString('pt-BR', { 
                      dateStyle: 'long', 
                      timeStyle: 'short' 
                    })}
                  </td>
                </tr>
              </table>
              
              <!-- Mensagem -->
              <h2 style="margin: 0 0 15px; font-size: 16px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                💬 Mensagem
              </h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message}
                </p>
              </div>
              
              <!-- Ação Rápida -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:${email}?subject=Re: ${typeLabel} - SimplifiqueIA" 
                       style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      📧 Responder Feedback
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Este email foi gerado automaticamente pelo sistema de feedback do SimplifiqueIA
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
                SimplifiqueIA RH - Feedback System
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

    // Texto alternativo
    const textContent = `
NOVO FEEDBACK RECEBIDO - SimplifiqueIA

${typeEmoji} TIPO: ${typeLabel}
⭐ AVALIAÇÃO: ${rating}/5 estrelas

👤 INFORMAÇÕES DO USUÁRIO
Nome: ${name}
Email: ${email}
Data: ${new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}

💬 MENSAGEM:
${message}

---
Para responder, envie um email para: ${email}
    `

    // Enviar email
    const emailService = getEmailService()
    const result = await emailService.sendEmail({
      to: BRANDING.contact.supportEmail, // suporte@simplifiqueia.com.br
      subject: `${typeEmoji} Novo Feedback: ${typeLabel} - ${name}`,
      text: textContent,
      html: htmlContent
    })

    if (!result.success) {
      console.error('❌ [FEEDBACK API] Erro ao enviar email:', result.error)
      return NextResponse.json(
        { 
          error: 'Erro ao enviar feedback. Por favor, tente novamente ou envie um email diretamente.',
          details: result.error 
        },
        { status: 500 }
      )
    }

    console.log('✅ [FEEDBACK API] Feedback enviado com sucesso para:', BRANDING.contact.supportEmail)

    return NextResponse.json({
      success: true,
      message: 'Feedback enviado com sucesso!',
      messageId: result.messageId
    })

  } catch (error) {
    console.error('❌ [FEEDBACK API] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro ao processar feedback' },
      { status: 500 }
    )
  }
}
