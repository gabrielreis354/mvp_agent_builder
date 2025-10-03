export interface Credential {
  id: string
  userId: string
  service: string
  name: string
  type: 'api_key' | 'oauth' | 'basic_auth' | 'custom'
  value: string
  metadata?: {
    createdAt: string
    updatedAt: string
    expiresAt?: string
    isActive: boolean
    [key: string]: any
  }
}

export interface CredentialConfig {
  service: string
  type: 'api_key' | 'oauth' | 'basic_auth' | 'custom'
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'url'
    required: boolean
    placeholder?: string
  }>
}

export class CredentialManager {
  private credentials: Map<string, Credential> = new Map()
  
  // Configurações de credenciais por serviço
  private serviceConfigs: Map<string, CredentialConfig> = new Map([
    ['openai', {
      service: 'openai',
      type: 'api_key',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
        { name: 'baseURL', label: 'Base URL (opcional)', type: 'url', required: false, placeholder: 'https://api.openai.com/v1' }
      ]
    }],
    ['anthropic', {
      service: 'anthropic',
      type: 'api_key',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-ant-...' }
      ]
    }],
    ['google', {
      service: 'google',
      type: 'api_key',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'AIza...' }
      ]
    }],
    ['smtp', {
      service: 'smtp',
      type: 'basic_auth',
      fields: [
        { name: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
        { name: 'port', label: 'Port', type: 'text', required: true, placeholder: '587' },
        { name: 'username', label: 'Username', type: 'text', required: true, placeholder: 'user@example.com' },
        { name: 'password', label: 'Password', type: 'password', required: true }
      ]
    }],
    ['sendgrid', {
      service: 'sendgrid',
      type: 'api_key',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'SG...' }
      ]
    }]
  ])

  async setCredential(userId: string, service: string, name: string, values: Record<string, string>): Promise<string> {
    const credentialId = this.generateCredentialId()
    
    // Validar campos obrigatórios
    const config = this.serviceConfigs.get(service)
    if (config) {
      const requiredFields = config.fields.filter(f => f.required).map(f => f.name)
      for (const field of requiredFields) {
        if (!values[field]) {
          throw new Error(`Required field '${field}' is missing for service '${service}'`)
        }
      }
    }

    const credential: Credential = {
      id: credentialId,
      userId,
      service,
      name,
      type: config?.type || 'custom',
      value: this.encryptValues(values),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
    }

    this.credentials.set(credentialId, credential)
    console.log(`Credential stored for service: ${service}`)
    
    return credentialId
  }

  async getCredential(userId: string, service: string): Promise<Credential | null> {
    // Buscar credencial ativa para o usuário e serviço
    for (const credential of Array.from(this.credentials.values())) {
      if (credential.userId === userId && 
          credential.service === service && 
          credential.metadata?.isActive) {
        return {
          ...credential,
          value: this.decryptValues(credential.value)
        }
      }
    }
    return null
  }

  async listCredentials(userId: string): Promise<Array<Omit<Credential, 'value'>>> {
    const userCredentials: Array<Omit<Credential, 'value'>> = []
    
    for (const credential of Array.from(this.credentials.values())) {
      if (credential.userId === userId && credential.metadata?.isActive) {
        userCredentials.push({
          id: credential.id,
          userId: credential.userId,
          service: credential.service,
          name: credential.name,
          type: credential.type,
          metadata: credential.metadata
        })
      }
    }
    
    return userCredentials
  }

  async deleteCredential(userId: string, credentialId: string): Promise<boolean> {
    const credential = this.credentials.get(credentialId)
    
    if (!credential || credential.userId !== userId) {
      return false
    }

    // Soft delete - marcar como inativo
    credential.metadata = {
      ...credential.metadata,
      isActive: false,
      updatedAt: new Date().toISOString(),
      createdAt: credential.metadata?.createdAt || new Date().toISOString(),
      expiresAt: credential.metadata?.expiresAt
    }

    this.credentials.set(credentialId, credential)
    return true
  }

  async testCredential(userId: string, service: string): Promise<{ success: boolean; error?: string }> {
    const credential = await this.getCredential(userId, service)
    
    if (!credential) {
      return { success: false, error: 'Credential not found' }
    }

    try {
      // Testar credencial baseado no serviço
      switch (service) {
        case 'openai':
        case 'anthropic':
        case 'google':
          return await this.testAIProvider(service, credential.value)
        
        case 'smtp':
        case 'sendgrid':
          return await this.testEmailProvider(service, credential.value)
        
        default:
          return { success: true } // Para serviços não implementados
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed' 
      }
    }
  }

  getServiceConfig(service: string): CredentialConfig | null {
    return this.serviceConfigs.get(service) || null
  }

  listSupportedServices(): string[] {
    return Array.from(this.serviceConfigs.keys())
  }

  private async testAIProvider(service: string, values: string): Promise<{ success: boolean; error?: string }> {
    console.log(`Testing AI provider: ${service}`)
    
    // Simular teste de API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock de teste bem-sucedido
    return { success: true }
  }

  private async testEmailProvider(service: string, values: string): Promise<{ success: boolean; error?: string }> {
    console.log(`Testing email provider: ${service}`)
    
    // Simular teste de email
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock de teste bem-sucedido
    return { success: true }
  }

  private encryptValues(values: Record<string, string>): string {
    // TODO: Implementar criptografia real
    // Por enquanto, apenas codificar em base64
    return Buffer.from(JSON.stringify(values)).toString('base64')
  }

  private decryptValues(encryptedValue: string): string {
    // TODO: Implementar descriptografia real
    try {
      return Buffer.from(encryptedValue, 'base64').toString('utf-8')
    } catch {
      return encryptedValue
    }
  }

  private generateCredentialId(): string {
    return `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const credentialManager = new CredentialManager()
