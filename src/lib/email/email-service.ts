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
      // ❌ REMOVIDO: Simulação de email
      // Agora EXIGE configuração SMTP para funcionar
      if (!this.transporter || !this.config) {
        const errorMsg = 'Configuração SMTP não encontrada. Configure as variáveis de ambiente SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no arquivo .env.local';
        console.error('❌ [EMAIL SERVICE]', errorMsg);
        
        return {
          success: false,
          error: errorMsg
        }
      }
      
      // ✅ Envio real de email
      console.log(`📧 [EMAIL SERVICE] ===== INICIANDO ENVIO DE EMAIL =====`);
      console.log(`📧 [EMAIL SERVICE] Para: ${options.to}`);
      console.log(`📧 [EMAIL SERVICE] Assunto: ${options.subject}`);
      console.log(`📧 [EMAIL SERVICE] De: ${this.config.auth.user}`);
      console.log(`📧 [EMAIL SERVICE] Servidor SMTP: ${this.config.host}:${this.config.port}`);
      console.log(`📧 [EMAIL SERVICE] Secure: ${this.config.secure}`);
      console.log(`📧 [EMAIL SERVICE] Anexos: ${options.attachments?.length || 0}`);
      
      const info = await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME || 'SimplifiqueIA'} <${this.config.auth.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      })
      
      console.log(`✅ [EMAIL SERVICE] Email enviado com sucesso!`);
      console.log(`✅ [EMAIL SERVICE] MessageId: ${info.messageId}`);
      console.log(`✅ [EMAIL SERVICE] Response: ${info.response}`);
      console.log(`✅ [EMAIL SERVICE] Accepted: ${info.accepted?.join(', ')}`);
      console.log(`✅ [EMAIL SERVICE] Rejected: ${info.rejected?.join(', ') || 'nenhum'}`);
      console.log(`✅ [EMAIL SERVICE] ===== EMAIL ENVIADO =====`);
      
      return {
        success: true,
        messageId: info.messageId
      }
      
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Erro ao enviar email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email'
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
