import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
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
  private transporter: nodemailer.Transporter | null = null
  
  constructor(private config?: EmailConfig) {
    if (config) {
      this.initializeTransporter()
    }
  }
  
  private initializeTransporter() {
    if (!this.config) return
    
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      }
    })
  }
  
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Se não há configuração, simular envio
      if (!this.transporter || !this.config) {
        console.log(`[EMAIL SIMULADO] Para: ${options.to}`)
        console.log(`[EMAIL SIMULADO] Assunto: ${options.subject}`)
        console.log(`[EMAIL SIMULADO] Anexos: ${options.attachments?.length || 0}`)
        
        return {
          success: true,
          messageId: `simulated-${Date.now()}`,
          error: 'Email simulado - configure SMTP para envio real'
        }
      }
      
      // Envio real
      const info = await this.transporter.sendMail({
        from: this.config.auth.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      })
      
      return {
        success: true,
        messageId: info.messageId
      }
      
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }
  
  // Método para testar configuração
  async testConnection(): Promise<boolean> {
    if (!this.transporter) return false
    
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Erro na conexão SMTP:', error)
      return false
    }
  }
}

// Instância singleton
let emailService: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailService) {
    // Tentar carregar configuração das variáveis de ambiente
    const config = process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    } : undefined
    
    emailService = new EmailService(config)
  }
  
  return emailService
}
