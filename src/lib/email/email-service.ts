import sgMail from '@sendgrid/mail'

export interface EmailConfig {
  provider: 'sendgrid' | 'smtp'
  sendgrid?: {
    apiKey: string
    fromEmail: string
    fromName: string
  }
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
}

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export class EmailService {
  private isConfigured: boolean = false
  
  constructor(private config?: EmailConfig) {
    if (config) {
      this.initialize()
    }
  }
  
  private initialize() {
    if (!this.config) return
    
    if (this.config.provider === 'sendgrid' && this.config.sendgrid) {
      sgMail.setApiKey(this.config.sendgrid.apiKey)
      this.isConfigured = true
      console.log('✅ [EMAIL SERVICE] SendGrid configurado com sucesso')
    } else if (this.config.provider === 'smtp' && this.config.smtp) {
      // SMTP não é mais suportado - apenas SendGrid
      console.warn('⚠️ [EMAIL SERVICE] SMTP não é mais suportado. Use SendGrid.')
      this.isConfigured = false
    }
  }
  
  async sendEmail({ to, subject, text, html, attachments }: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured || !this.config) {
        const errorMsg = 'Serviço de email não configurado. Configure SENDGRID_API_KEY, SENDGRID_FROM_EMAIL e SENDGRID_FROM_NAME no .env.local';
        console.error('❌ [EMAIL SERVICE]', errorMsg);
        return {
          success: false,
          error: errorMsg
        }
      }

      if (this.config.provider !== 'sendgrid' || !this.config.sendgrid) {
        return {
          success: false,
          error: 'Apenas SendGrid é suportado como provedor de email'
        }
      }

      // Validar que há conteúdo (text ou html)
      if (!text && !html) {
        return {
          success: false,
          error: 'Email deve ter conteúdo (text ou html)'
        }
      }

      console.log(`📧 [EMAIL SERVICE] ===== ENVIANDO EMAIL VIA SENDGRID =====`);
      console.log(`📧 [EMAIL SERVICE] Para: ${to}`);
      console.log(`📧 [EMAIL SERVICE] Assunto: ${subject}`);
      console.log(`📧 [EMAIL SERVICE] De: ${this.config.sendgrid.fromName} <${this.config.sendgrid.fromEmail}>`);
      console.log(`📧 [EMAIL SERVICE] Conteúdo HTML: ${html?.length || 0} chars`);
      console.log(`📧 [EMAIL SERVICE] Conteúdo Text: ${text?.length || 0} chars`);
      console.log(`📧 [EMAIL SERVICE] Anexos: ${attachments?.length || 0}`);
      
      if (attachments && attachments.length > 0) {
        attachments.forEach((att, idx) => {
          console.log(`📎 [EMAIL SERVICE] Anexo ${idx + 1}: ${att.filename} (${att.content.length} bytes, ${att.contentType})`);
        });
      }

      // Preparar mensagem SendGrid
      const msg: any = {
        to,
        from: {
          email: this.config.sendgrid.fromEmail,
          name: this.config.sendgrid.fromName
        },
        subject,
        // Headers profissionais
        headers: {
          'X-Mailer': 'SimplifiqueIA RH',
          'X-Priority': '3',
        },
        // Tracking
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false
          },
          openTracking: {
            enable: true
          }
        },
        // Categorias para analytics
        categories: ['transactional', 'reports']
      }

      // Adicionar conteúdo (priorizar HTML sobre text)
      if (html) {
        msg.html = html
        if (text) {
          msg.text = text
        }
      } else if (text) {
        msg.text = text
      }

      // Adicionar anexos se existirem
      if (attachments && attachments.length > 0) {
        msg.attachments = attachments.map(att => ({
          content: att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      }

      // Enviar via SendGrid
      const response = await sgMail.send(msg)
      
      console.log(`✅ [EMAIL SERVICE] Email enviado com sucesso via SendGrid!`);
      console.log(`✅ [EMAIL SERVICE] Status: ${response[0].statusCode}`);
      console.log(`✅ [EMAIL SERVICE] MessageId: ${response[0].headers['x-message-id']}`);
      console.log(`✅ [EMAIL SERVICE] ===== EMAIL ENVIADO =====`);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string
      }
      
    } catch (error: any) {
      console.error('❌ [EMAIL SERVICE] Erro ao enviar email:', error)
      
      // Log detalhado de erros SendGrid
      if (error.response) {
        console.error('❌ [EMAIL SERVICE] Status:', error.response.statusCode)
        console.error('❌ [EMAIL SERVICE] Body:', error.response.body)
      }
      
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao enviar email'
      }
    }
  }
  
  // Método para testar configuração
  async testConnection(): Promise<boolean> {
    return this.isConfigured
  }
  
  // Email de boas-vindas para novos usuários
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao SimplifiqueIA RH</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header com gradiente e logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              ${process.env.NEXT_PUBLIC_LOGO_URL ? `
              <!-- Logo -->
              <img 
                src="${process.env.NEXT_PUBLIC_LOGO_URL}" 
                alt="SimplifiqueIA RH" 
                width="80" 
                height="80"
                style="margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"
              />
              ` : ''}
              
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🎉 Bem-vindo ao SimplifiqueIA RH!
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Olá <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Sua conta foi criada com sucesso! 🚀
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Estamos muito felizes em tê-lo(a) conosco. O <strong>SimplifiqueIA RH</strong> foi desenvolvido para transformar a forma como profissionais de RH trabalham com automação inteligente baseada em IA.
              </p>
              
              <!-- Primeiros Passos -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; font-size: 18px; color: #1e40af;">
                  🎯 Primeiros Passos
                </h2>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #3b82f6;">1.</strong>
                      <a href="${appUrl}/builder" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                        Criar seu primeiro agente
                      </a>
                      <p style="margin: 5px 0 0 20px; font-size: 14px; color: #64748b;">
                        Use o construtor visual para criar agentes personalizados
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #3b82f6;">2.</strong>
                      <a href="${appUrl}/gallery" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                        Explorar templates prontos
                      </a>
                      <p style="margin: 5px 0 0 20px; font-size: 14px; color: #64748b;">
                        Análise de currículos, contratos, folha de pagamento e mais
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #3b82f6;">3.</strong>
                      <a href="${appUrl}/profile" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                        Acessar seu perfil
                      </a>
                      <p style="margin: 5px 0 0 20px; font-size: 14px; color: #64748b;">
                        Gerencie seus agentes e visualize seu histórico
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Dica em destaque -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>💡 DICA:</strong> Comece com o template de <strong>"Análise de Currículos"</strong> para ver o poder da plataforma em ação! Em poucos cliques você terá análises profissionais automatizadas.
                </p>
              </div>
              
              <!-- Recursos -->
              <h3 style="margin: 30px 0 15px; font-size: 16px; color: #1e293b;">
                📚 Recursos Úteis
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                <li>Templates especializados para RH</li>
                <li>Processamento inteligente de documentos</li>
                <li>Geração automática de relatórios em PDF</li>
                <li>Suporte via email</li>
              </ul>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/builder" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6;">
                      Começar Agora →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Qualquer dúvida, estamos à disposição em 
                <a href="mailto:suporte@simplifiqueia.com.br" style="color: #3b82f6; text-decoration: none;">
                  suporte@simplifiqueia.com.br
                </a>
              </p>
              
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Equipe <strong>SimplifiqueIA RH</strong> 💙
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">
                Este email foi enviado porque você criou uma conta em SimplifiqueIA RH.
              </p>
              <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">
                Se não foi você, por favor 
                <a href="mailto:suporte@simplifiqueia.com.br" style="color: #3b82f6; text-decoration: none;">
                  nos avise imediatamente
                </a>.
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
                SimplifiqueIA RH - Automação Inteligente para Recursos Humanos<br>
                <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">www.simplifiqueia.com.br</a>
              </p>
              <p style="margin: 10px 0 0; font-size: 10px; color: #cbd5e1;">
                Para não receber mais emails, 
                <a href="mailto:suporte@simplifiqueia.com.br?subject=Cancelar%20inscricao" style="color: #64748b; text-decoration: underline;">
                  clique aqui
                </a>.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const textContent = `
Bem-vindo ao SimplifiqueIA RH!

Olá ${userName},

Sua conta foi criada com sucesso! 🚀

Estamos muito felizes em tê-lo(a) conosco. O SimplifiqueIA RH foi desenvolvido para transformar a forma como profissionais de RH trabalham com automação inteligente baseada em IA.

🎯 PRIMEIROS PASSOS:

1. Criar seu primeiro agente
   → ${appUrl}/builder
   Use o construtor visual para criar agentes personalizados

2. Explorar templates prontos
   → ${appUrl}/gallery
   Análise de currículos, contratos, folha de pagamento e mais

3. Acessar seu perfil
   → ${appUrl}/profile
   Gerencie seus agentes e visualize seu histórico

💡 DICA: Comece com o template de "Análise de Currículos" para ver o poder da plataforma em ação! Em poucos cliques você terá análises profissionais automatizadas.

📚 RECURSOS ÚTEIS:

• Templates especializados para RH
• Processamento inteligente de documentos
• Geração automática de relatórios em PDF
• Suporte via email

Qualquer dúvida, estamos à disposição em suporte@simplifiqueia.com.br

Equipe SimplifiqueIA RH 💙

---
Este email foi enviado porque você criou uma conta em SimplifiqueIA RH.
Se não foi você, por favor nos avise imediatamente em suporte@simplifiqueia.com.br
    `;
    
    return this.sendEmail({
      to: userEmail,
      subject: '🎉 Bem-vindo ao SimplifiqueIA RH!',
      text: textContent,
      html: htmlContent
    });
  }
}

// Instância singleton
let emailService: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailService) {
    // Configurar SendGrid a partir das variáveis de ambiente
    const config: EmailConfig | undefined = process.env.SENDGRID_API_KEY ? {
      provider: 'sendgrid',
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@simplifiqueia.com.br',
        fromName: process.env.SENDGRID_FROM_NAME || 'SimplifiqueIA RH'
      }
    } : undefined
    
    emailService = new EmailService(config)
  }
  
  return emailService
}
