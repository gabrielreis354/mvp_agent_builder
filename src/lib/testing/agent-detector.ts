import { Agent, AgentNode } from '@/types/agent'

export interface AgentTestStrategy {
  category: string
  nodeTypes: string[]
  providers: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  requiredInputs: Record<string, any>
  expectedOutputs: Record<string, any>
  testTimeout: number
  retries: number
  validations: string[]
}

export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

export interface AgentValidation {
  isValid: boolean
  errors: Array<{ type: string; message: string }>
  warnings: string[]
  strategy: AgentTestStrategy
}

export class AgentTypeDetector {
  
  /**
   * Detecta o tipo de agente e gera estratégia de teste
   */
  detectAgentType(agent: Agent): AgentTestStrategy {
    const nodeTypes = this.extractNodeTypes(agent)
    const providers = this.extractProviders(agent)
    const complexity = this.determineComplexity(agent)
    const category = agent.category || this.inferCategory(agent)
    
    return {
      category,
      nodeTypes,
      providers,
      complexity,
      requiredInputs: this.extractInputSchema(agent),
      expectedOutputs: this.extractOutputSchema(agent),
      testTimeout: this.getTimeoutByComplexity(complexity),
      retries: this.getRetriesByComplexity(complexity),
      validations: this.getValidationsByComplexity(complexity)
    }
  }

  /**
   * Extrai tipos de nós do agente
   */
  private extractNodeTypes(agent: Agent): string[] {
    return [...new Set(agent.nodes?.map(node => node.data?.nodeType || 'unknown') || [])]
  }

  /**
   * Extrai provedores de IA utilizados
   */
  private extractProviders(agent: Agent): string[] {
    return [...new Set(
      (agent.nodes || [])
        .filter(node => node.data?.nodeType === 'ai')
        .map(node => node.data?.provider)
        .filter(Boolean) as string[]
    )]
  }

  /**
   * Determina complexidade baseada na estrutura do agente
   */
  private determineComplexity(agent: Agent): 'beginner' | 'intermediate' | 'advanced' {
    const nodeCount = agent.nodes?.length || 0
    const edgeCount = agent.edges?.length || 0
    const aiNodes = (agent.nodes || []).filter(n => n.data?.nodeType === 'ai').length
    const apiNodes = (agent.nodes || []).filter(n => n.data?.nodeType === 'api').length
    
    // Lógica de complexidade
    if (nodeCount <= 3 && aiNodes <= 1 && apiNodes === 0) {
      return 'beginner'
    }
    
    if (nodeCount <= 6 && aiNodes <= 2 && apiNodes <= 2) {
      return 'intermediate'
    }
    
    return 'advanced'
  }

  /**
   * Infere categoria baseada nos nós e configurações
   */
  private inferCategory(agent: Agent): string {
    const nodeTypes = this.extractNodeTypes(agent)
    const hasFileProcessing = agent.nodes.some(n => 
      n.data?.inputSchema?.properties?.file || 
      n.data?.inputSchema?.properties?.documentos
    )
    
    const hasEmailIntegration = agent.nodes.some(n =>
      n.data?.inputSchema?.properties?.email ||
      n.data?.label?.toLowerCase().includes('email')
    )
    
    const hasContractAnalysis = agent.nodes.some(n =>
      n.data?.prompt?.toLowerCase().includes('contrato') ||
      n.data?.label?.toLowerCase().includes('contrato')
    )
    
    if (hasContractAnalysis || hasFileProcessing || hasEmailIntegration) {
      return 'RH & Jurídico'
    }
    
    return 'custom'
  }

  /**
   * Extrai schema de entrada do primeiro nó input
   */
  private extractInputSchema(agent: Agent): Record<string, any> {
    const inputNode = agent.nodes.find(n => n.data?.nodeType === 'input')
    return inputNode?.data?.inputSchema?.properties || {}
  }

  /**
   * Extrai schema de saída do último nó output
   */
  private extractOutputSchema(agent: Agent): Record<string, any> {
    const outputNode = agent.nodes.find(n => n.data?.nodeType === 'output')
    return outputNode?.data?.outputSchema?.properties || {}
  }

  /**
   * Define timeout baseado na complexidade
   */
  private getTimeoutByComplexity(complexity: string): number {
    const timeouts = {
      beginner: 30000,    // 30s
      intermediate: 60000, // 60s
      advanced: 120000    // 120s
    }
    return timeouts[complexity as keyof typeof timeouts] || 60000
  }

  /**
   * Define número de tentativas baseado na complexidade
   */
  private getRetriesByComplexity(complexity: string): number {
    const retries = {
      beginner: 3,
      intermediate: 2,
      advanced: 1
    }
    return retries[complexity as keyof typeof retries] || 2
  }

  /**
   * Define validações baseadas na complexidade
   */
  private getValidationsByComplexity(complexity: string): string[] {
    const validations = {
      beginner: ['basic_flow', 'output_format'],
      intermediate: ['full_flow', 'data_quality', 'error_handling'],
      advanced: ['complete_validation', 'performance', 'security']
    }
    return validations[complexity as keyof typeof validations] || ['basic_flow']
  }

  /**
   * Valida estrutura completa do agente
   */
  validateAgent(agent: Agent): AgentValidation {
    const strategy = this.detectAgentType(agent)
    const validations = {
      structure: this.validateAgentStructure(agent),
      connections: this.validateNodeConnections(agent),
      dataFlow: this.validateDataFlow(agent),
      schemas: this.validateSchemaCompatibility(agent),
      providers: this.validateProviderCredentials(agent)
    }

    const errors = Object.entries(validations)
      .filter(([_, v]) => !v.valid)
      .map(([key, v]) => ({ type: key, message: v.error || 'Erro desconhecido' }))

    const warnings = Object.values(validations)
      .flatMap(v => v.warnings || [])

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strategy
    }
  }

  /**
   * Valida estrutura básica do agente
   */
  private validateAgentStructure(agent: Agent): ValidationResult {
    if (!agent.nodes || agent.nodes.length === 0) {
      return { valid: false, error: 'Agente deve ter pelo menos um nó' }
    }

    if (!agent.edges || agent.edges.length === 0) {
      return { valid: false, error: 'Agente deve ter pelo menos uma conexão' }
    }

    const hasInput = agent.nodes.some(n => n.data?.nodeType === 'input')
    const hasOutput = agent.nodes.some(n => n.data?.nodeType === 'output')

    if (!hasInput) {
      return { valid: false, error: 'Agente deve ter pelo menos um nó de entrada' }
    }

    if (!hasOutput) {
      return { valid: false, error: 'Agente deve ter pelo menos um nó de saída' }
    }

    return { valid: true }
  }

  /**
   * Valida conexões entre nós
   */
  private validateNodeConnections(agent: Agent): ValidationResult {
    const nodeIds = new Set(agent.nodes.map(n => n.id))
    
    for (const edge of agent.edges) {
      if (!nodeIds.has(edge.source)) {
        return { valid: false, error: `Nó fonte '${edge.source}' não encontrado` }
      }
      if (!nodeIds.has(edge.target)) {
        return { valid: false, error: `Nó destino '${edge.target}' não encontrado` }
      }
    }

    // Verificar nós órfãos
    const connectedNodes = new Set([
      ...agent.edges.map(e => e.source),
      ...agent.edges.map(e => e.target)
    ])

    const orphanNodes = agent.nodes.filter(n => !connectedNodes.has(n.id))
    const warnings = orphanNodes.length > 0 
      ? [`${orphanNodes.length} nó(s) não conectado(s): ${orphanNodes.map(n => n.id).join(', ')}`]
      : []

    return { valid: true, warnings }
  }

  /**
   * Valida fluxo de dados
   */
  private validateDataFlow(agent: Agent): ValidationResult {
    // Implementação básica - pode ser expandida
    const inputNodes = agent.nodes.filter(n => n.data?.nodeType === 'input')
    const outputNodes = agent.nodes.filter(n => n.data?.nodeType === 'output')

    if (inputNodes.length === 0) {
      return { valid: false, error: 'Fluxo deve começar com nó de entrada' }
    }

    if (outputNodes.length === 0) {
      return { valid: false, error: 'Fluxo deve terminar com nó de saída' }
    }

    return { valid: true }
  }

  /**
   * Valida compatibilidade de schemas
   */
  private validateSchemaCompatibility(agent: Agent): ValidationResult {
    // Implementação básica - verificar se schemas existem onde necessário
    const warnings: string[] = []

    const aiNodes = agent.nodes.filter(n => n.data?.nodeType === 'ai')
    for (const node of aiNodes) {
      if (!node.data?.prompt) {
        warnings.push(`Nó AI '${node.id}' sem prompt definido`)
      }
      if (!node.data?.provider) {
        warnings.push(`Nó AI '${node.id}' sem provedor definido`)
      }
    }

    return { valid: true, warnings }
  }

  /**
   * Valida credenciais dos provedores
   */
  private validateProviderCredentials(agent: Agent): ValidationResult {
    const providers = this.extractProviders(agent)
    const warnings: string[] = []

    // Verificação básica - em produção, verificar credenciais reais
    for (const provider of providers) {
      if (!provider) {
        warnings.push('Provedor de IA não especificado')
      }
    }

    return { valid: true, warnings }
  }
}

export const agentDetector = new AgentTypeDetector()
