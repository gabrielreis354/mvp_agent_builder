import { BaseConnector, ConnectorConfig, ConnectorResult } from './base'

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
      console.log(`Sending email via ${config.provider}`)
      console.log(`To: ${Array.isArray(input.to) ? input.to.join(', ') : input.to}`)
      console.log(`Subject: ${input.subject}`)
      
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return this.createResult(true, {
        messageId,
        status: 'sent',
        recipients: Array.isArray(input.to) ? input.to : [input.to],
        provider: config.provider
      })
      
    } catch (error) {
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
