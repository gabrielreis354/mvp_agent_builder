import { BaseConnector, ConnectorConfig, ConnectorResult } from './base'
import { getEmailService } from '@/lib/email/email-service'

export interface EmailConfig extends ConnectorConfig {
  provider: 'smtp' | 'sendgrid' | 'resend'
  apiKey?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  fromEmail: string
  fromName?: string
}

export interface EmailInput {
  to: string | string[]
  subject: string
  body: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export class EmailConnector extends BaseConnector {
  name = 'email'
  description = 'Send emails via SMTP or email service providers'
  
  configSchema = {
    type: 'object',
    properties: {
      provider: { type: 'string', enum: ['smtp', 'sendgrid', 'resend'] },
      apiKey: { type: 'string' },
      smtpHost: { type: 'string' },
      smtpPort: { type: 'number' },
      smtpUser: { type: 'string' },
      smtpPassword: { type: 'string' },
      fromEmail: { type: 'string', format: 'email' },
      fromName: { type: 'string' }
    },
    required: ['provider', 'fromEmail']
  }

  async execute(config: EmailConfig, input: EmailInput): Promise<ConnectorResult> {
    try {
      console.log(`📧 [EmailConnector] Sending email via ${config.provider}`)
      console.log(`📧 [EmailConnector] To: ${Array.isArray(input.to) ? input.to.join(', ') : input.to}`)
      console.log(`📧 [EmailConnector] Subject: ${input.subject}`)
      
      // ✅ USAR EmailService REAL (não mais simulação)
      const emailService = getEmailService()
      
      // Converter destinatários para string se for array
      const recipients = Array.isArray(input.to) ? input.to[0] : input.to
      
      // Enviar email real
      const result = await emailService.sendEmail({
        to: recipients,
        subject: input.subject,
        text: input.body,
        html: input.html || input.body,
        attachments: input.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content),
          contentType: att.contentType || 'application/octet-stream'
        }))
      })
      
      if (!result.success) {
        console.error(`❌ [EmailConnector] Failed to send email: ${result.error}`)
        return this.createResult(false, null, result.error || 'Email send failed')
      }
      
      console.log(`✅ [EmailConnector] Email sent successfully! MessageId: ${result.messageId}`)
      
      return this.createResult(true, {
        messageId: result.messageId,
        status: 'sent',
        recipients: Array.isArray(input.to) ? input.to : [input.to],
        provider: config.provider
      })
      
    } catch (error) {
      console.error(`❌ [EmailConnector] Error:`, error)
      return this.createResult(false, null, error instanceof Error ? error.message : 'Email send failed')
    }
  }

  validate(config: EmailConfig): boolean {
    if (!config.fromEmail || !config.provider) return false
    
    if (config.provider === 'smtp') {
      return !!(config.smtpHost && config.smtpPort && config.smtpUser && config.smtpPassword)
    }
    
    if (config.provider === 'sendgrid' || config.provider === 'resend') {
      return !!config.apiKey
    }
    
    return false
  }

  async test(config: EmailConfig): Promise<boolean> {
    try {
      const testResult = await this.execute(config, {
        to: config.fromEmail,
        subject: 'Test Email from AutomateAI',
        body: 'This is a test email to verify the email connector configuration.'
      })
      
      return testResult.success
    } catch {
      return false
    }
  }
}
