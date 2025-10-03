import { AgentNode } from '@/types/agent'
import { ValidationResult } from './agent-detector'

export interface NodeValidationContext {
  nodeId: string
  nodeType: string
  inputData?: any
  previousResults?: Record<string, any>
  executionContext?: any
}

/**
 * Validador base para nós
 */
export abstract class BaseNodeValidator {
  abstract validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult
  abstract generateTestData(node: AgentNode): any
}

/**
 * Validador para nós de entrada (Input)
 */
export class InputNodeValidator extends BaseNodeValidator {
  
  validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult {
    const warnings: string[] = []
    
    // Verificar se tem schema definido
    if (!node.data?.inputSchema) {
      warnings.push('Nó de entrada sem schema definido')
    } else {
      const schema = node.data.inputSchema
      
      // Verificar propriedades obrigatórias
      if (schema.required && schema.required.length === 0) {
        warnings.push('Nenhum campo obrigatório definido no schema de entrada')
      }
      
      // Verificar se propriedades têm descrições
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          const property = prop as any
          if (!property.description) {
            warnings.push(`Campo '${key}' sem descrição`)
          }
        }
      }
    }
    
    return { valid: true, warnings }
  }

  generateTestData(node: AgentNode): any {
    const schema = node.data?.inputSchema?.properties || {}
    const testData: Record<string, any> = {}
    
    for (const [key, prop] of Object.entries(schema)) {
      const property = prop as any
      
      switch (property.type) {
        case 'string':
          if (property.format === 'email') {
            testData[key] = 'teste@exemplo.com'
          } else if (property.format === 'date') {
            testData[key] = '2024-01-15'
          } else if (property.format === 'binary') {
            testData[key] = 'arquivo-teste.pdf'
          } else if (property.enum) {
            testData[key] = property.enum[0]
          } else {
            testData[key] = `Teste ${key}`
          }
          break
          
        case 'number':
          testData[key] = 100
          break
          
        case 'boolean':
          testData[key] = true
          break
          
        case 'array':
          if (property.items?.type === 'string') {
            testData[key] = ['item1', 'item2']
          } else {
            testData[key] = [{ teste: 'valor' }]
          }
          break
          
        case 'object':
          testData[key] = { campo: 'valor' }
          break
          
        default:
          testData[key] = 'Valor padrão'
      }
    }
    
    return testData
  }
}

/**
 * Validador para nós de IA
 */
export class AINodeValidator extends BaseNodeValidator {
  
  private readonly supportedProviders = ['openai', 'anthropic', 'google']
  private readonly modelsByProvider = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'],
    google: ['gemini-pro', 'gemini-pro-vision']
  }

  validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult {
    const warnings: string[] = []
    const data = node.data
    
    // Verificar provedor
    if (!data?.provider) {
      return { valid: false, error: 'Nó de IA deve ter provedor definido' }
    }
    
    if (!this.supportedProviders.includes(data.provider)) {
      return { valid: false, error: `Provedor '${data.provider}' não suportado` }
    }
    
    // Verificar modelo
    if (!data.model) {
      return { valid: false, error: 'Nó de IA deve ter modelo definido' }
    }
    const modelsByProvider = {
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'],
      google: ['gemini-pro', 'gemini-pro-vision']
    }
    const validModels = modelsByProvider[data.provider as keyof typeof modelsByProvider] || []
    if (!validModels.includes(data.model)) {
      return { valid: false, error: `Modelo '${data.model}' não suportado para provedor '${data.provider}'` }
    }
    
    // Verificar prompt
    if (!data.prompt) {
      return { valid: false, error: 'Nó de IA deve ter prompt definido' }
    }
    
    // Validar qualidade do prompt
    const promptQuality = this.validatePromptQuality(data.prompt)
    if (!promptQuality.valid) {
      warnings.push(promptQuality.error || 'Prompt pode ser melhorado')
    }
    
    return { valid: true, warnings }
  }

  private validatePromptQuality(prompt: string): ValidationResult {
    const warnings: string[] = []
    
    if (prompt.length < 20) {
      warnings.push('Prompt muito curto - considere adicionar mais contexto')
    }
    
    if (!prompt.includes('analise') && !prompt.includes('gere') && !prompt.includes('extraia')) {
      warnings.push('Prompt deveria conter instruções claras (analise, gere, extraia, etc.)')
    }
    
    if (prompt.toLowerCase().includes('json') && !prompt.includes('estruturado')) {
      warnings.push('Para saída JSON, especifique "formato estruturado" no prompt')
    }
    
    return { valid: true, warnings }
  }

  generateTestData(node: AgentNode): any {
    return {
      input_text: 'Texto de exemplo para processamento pela IA',
      context: 'Contexto adicional para análise',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Validador para nós de lógica
 */
export class LogicNodeValidator extends BaseNodeValidator {
  
  validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult {
    const warnings: string[] = []
    
    // Verificar se tem lógica definida
    if (!node.data?.condition && !node.data?.transformation) {
      warnings.push('Nó de lógica sem condições ou transformações definidas')
    }
    
    // Verificar se tem múltiplas saídas (comum em nós de lógica)
    const outgoingEdges = context.executionContext?.edges?.filter((e: any) => e.source === node.id) || []
    if (outgoingEdges.length <= 1) {
      warnings.push('Nó de lógica geralmente deveria ter múltiplas saídas para diferentes condições')
    }
    
    return { valid: true, warnings }
  }

  generateTestData(node: AgentNode): any {
    return {
      condition_value: true,
      numeric_value: 50,
      text_value: 'teste'
    }
  }
}

/**
 * Validador para nós de API
 */
export class APINodeValidator extends BaseNodeValidator {
  
  validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult {
    const warnings: string[] = []
    
    // Verificar se tem configuração de API
    if (!node.data?.apiEndpoint) {
      return { valid: false, error: 'Nó de API deve ter endpoint definido' }
    }
    
    // Verificar se tem método HTTP definido
    if (node.data?.apiEndpoint && !node.data?.apiMethod) {
      warnings.push('Endpoint de API sem método HTTP definido')
    }
    
    // Verificar autenticação
    if (node.data?.apiEndpoint && !node.data?.apiHeaders) {
      warnings.push('API externa pode precisar de configuração de autenticação')
    }
    
    return { valid: true, warnings }
  }

  generateTestData(node: AgentNode): any {
    return {
      api_input: 'Dados para envio à API',
      parameters: { param1: 'valor1' },
      headers: { 'Content-Type': 'application/json' }
    }
  }
}

/**
 * Validador para nós de saída
 */
export class OutputNodeValidator extends BaseNodeValidator {
  
  validateNode(node: AgentNode, context: NodeValidationContext): ValidationResult {
    const warnings: string[] = []
    
    // Verificar se tem schema de saída
    if (!node.data?.outputSchema) {
      warnings.push('Nó de saída sem schema definido')
    } else {
      const schema = node.data.outputSchema
      
      // Verificar se define propriedades
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        warnings.push('Schema de saída sem propriedades definidas')
      }
      
      // Verificar se propriedades têm descrições
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          const property = prop as any
          if (!property.description) {
            warnings.push(`Propriedade de saída '${key}' sem descrição`)
          }
        }
      }
    }
    
    return { valid: true, warnings }
  }

  generateTestData(node: AgentNode): any {
    const schema = node.data?.outputSchema?.properties || {}
    const expectedOutput: Record<string, any> = {}
    
    for (const [key, prop] of Object.entries(schema)) {
      const property = prop as any
      
      switch (property.type) {
        case 'string':
          if (property.format === 'binary') {
            expectedOutput[key] = 'arquivo-resultado.pdf'
          } else {
            expectedOutput[key] = `Resultado ${key}`
          }
          break
          
        case 'number':
          expectedOutput[key] = 95.5
          break
          
        case 'boolean':
          expectedOutput[key] = true
          break
          
        case 'array':
          expectedOutput[key] = ['resultado1', 'resultado2']
          break
          
        case 'object':
          expectedOutput[key] = { status: 'sucesso' }
          break
          
        default:
          expectedOutput[key] = 'Resultado padrão'
      }
    }
    
    return expectedOutput
  }
}

/**
 * Factory para obter validador de nó apropriado
 */
export class NodeValidatorFactory {
  private static validators = {
    input: new InputNodeValidator(),
    ai: new AINodeValidator(),
    logic: new LogicNodeValidator(),
    api: new APINodeValidator(),
    output: new OutputNodeValidator()
  }

  static getValidator(nodeType: string): BaseNodeValidator {
    return this.validators[nodeType as keyof typeof this.validators] || this.validators.input
  }

  static validateAllNodes(nodes: AgentNode[], edges: any[]): ValidationResult[] {
    return nodes.map(node => {
      const validator = this.getValidator(node.data?.nodeType || 'input')
      const context: NodeValidationContext = {
        nodeId: node.id,
        nodeType: node.data?.nodeType || 'unknown',
        executionContext: { edges }
      }
      
      return {
        ...validator.validateNode(node, context),
        nodeId: node.id,
        nodeType: node.data?.nodeType
      } as ValidationResult & { nodeId: string; nodeType: string }
    })
  }
}

export const nodeValidatorFactory = new NodeValidatorFactory()
