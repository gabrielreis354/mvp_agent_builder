import { BaseConnector, ConnectorConfig, ConnectorResult } from './base'

export interface AIProviderConfig extends ConnectorConfig {
  provider: 'openai' | 'anthropic' | 'google'
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
  baseURL?: string
}

export interface AIInput {
  prompt: string
  systemPrompt?: string
  context?: any
  format?: 'text' | 'json'
}

export class AIProviderConnector extends BaseConnector {
  name = 'ai-provider'
  description = 'Execute AI model requests via various providers'
  
  configSchema = {
    type: 'object',
    properties: {
      provider: { type: 'string', enum: ['openai', 'anthropic', 'google'] },
      apiKey: { type: 'string' },
      model: { type: 'string' },
      temperature: { type: 'number', minimum: 0, maximum: 2 },
      maxTokens: { type: 'number', minimum: 1, maximum: 100000 },
      baseURL: { type: 'string' }
    },
    required: ['provider', 'apiKey', 'model']
  }

  async execute(config: AIProviderConfig, input: AIInput): Promise<ConnectorResult> {
    try {
      console.log(`AI Request: ${config.provider}/${config.model}`)
      console.log(`Prompt length: ${input.prompt.length} chars`)
      
      // Simular chamada para provedor de IA
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = this.generateMockResponse(config, input)
      
      return this.createResult(true, {
        response: response.content,
        usage: response.usage,
        model: config.model,
        provider: config.provider
      })
      
    } catch (error) {
      return this.createResult(false, null, error instanceof Error ? error.message : 'AI request failed')
    }
  }

  validate(config: AIProviderConfig): boolean {
    return !!(config.provider && config.apiKey && config.model)
  }

  async test(config: AIProviderConfig): Promise<boolean> {
    try {
      const testResult = await this.execute(config, {
        prompt: 'Hello, this is a test. Please respond with "Test successful".'
      })
      
      return testResult.success
    } catch {
      return false
    }
  }

  private generateMockResponse(config: AIProviderConfig, input: AIInput) {
    // Gerar resposta mock baseada no prompt
    let content = ''
    
    if (input.prompt.toLowerCase().includes('contrato')) {
      content = JSON.stringify({
        tipo_documento: 'Contrato de Trabalho',
        partes: {
          empregador: 'Empresa XYZ Ltda',
          empregado: 'João Silva'
        },
        cargo: 'Analista de Sistemas',
        salario: 'R$ 5.000,00',
        data_inicio: '2024-01-15',
        periodo_experiencia: '90 dias',
        jornada: '44 horas semanais',
        conformidade_clt: true,
        observacoes: 'Contrato em conformidade com a legislação trabalhista'
      }, null, 2)
    } else if (input.prompt.toLowerCase().includes('email') || input.prompt.toLowerCase().includes('suporte')) {
      content = JSON.stringify({
        categoria: 'suporte-tecnico',
        urgencia: 'media',
        sentimento: 'neutro',
        resposta_sugerida: 'Obrigado pelo contato. Vamos analisar sua solicitação e retornar em até 24 horas.',
        escalacao: false
      }, null, 2)
    } else {
      content = `Análise processada com sucesso pelo modelo ${config.model}. 
      
Dados extraídos: Informações relevantes identificadas no conteúdo fornecido.
Insights: Padrões e tendências detectados na análise.
Recomendações: Ações sugeridas baseadas nos resultados.
Confiança: 0.92`
    }

    return {
      content,
      usage: {
        prompt_tokens: Math.floor(input.prompt.length / 4),
        completion_tokens: Math.floor(content.length / 4),
        total_tokens: Math.floor((input.prompt.length + content.length) / 4)
      }
    }
  }
}
