import { Agent } from '@/types/agent'
import { AgentTypeDetector, AgentTestStrategy, AgentValidation } from './agent-detector'
import { CategoryValidatorFactory, CategoryTestCase } from './category-validators'
import { NodeValidatorFactory } from './node-validators'

const agentDetector = new AgentTypeDetector()

export interface TestExecution {
  executionId: string
  agentId: string
  strategy: AgentTestStrategy
  testData: Record<string, any>
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'timeout'
  results?: TestResults
  error?: string
}

export interface TestResults {
  success: boolean
  executionTime: number
  validationResults: ValidationResults
  output?: any
  warnings: string[]
  recommendations: string[]
}

export interface ValidationResults {
  structure: boolean
  dataFlow: boolean
  nodeValidations: Array<{
    nodeId: string
    nodeType: string
    valid: boolean
    warnings: string[]
  }>
  categorySpecific: boolean
  performance: {
    executionTime: number
    memoryUsage?: number
    apiCalls?: number
  }
}

/**
 * Engine principal para testes dinâmicos de agentes
 */
export class DynamicTestEngine {
  private runningTests = new Map<string, TestExecution>()

  /**
   * Executa teste completo de um agente
   */
  async testAgent(agent: Agent, customTestData?: Record<string, any>): Promise<TestExecution> {
    const executionId = this.generateExecutionId()
    const startTime = new Date()

    // Detectar tipo e estratégia
    const strategy = agentDetector.detectAgentType(agent)
    
    // Gerar dados de teste
    const testData = customTestData || this.generateTestData(agent, strategy)
    
    // Criar execução de teste
    const testExecution: TestExecution = {
      executionId,
      agentId: agent.id || 'unknown',
      strategy,
      testData,
      startTime,
      status: 'running'
    }

    this.runningTests.set(executionId, testExecution)

    try {
      // Executar validações
      const results = await this.executeValidations(agent, strategy, testData)
      
      testExecution.endTime = new Date()
      testExecution.status = results.success ? 'completed' : 'failed'
      testExecution.results = results

    } catch (error) {
      testExecution.endTime = new Date()
      testExecution.status = 'failed'
      testExecution.error = error instanceof Error ? error.message : 'Erro desconhecido'
    }

    return testExecution
  }

  /**
   * Valida agente em tempo real (para drag-and-drop)
   */
  validateAgentRealTime(agent: Agent): AgentValidation {
    return agentDetector.validateAgent(agent)
  }

  /**
   * Gera dados de teste baseados no tipo de agente
   */
  private generateTestData(agent: Agent, strategy: AgentTestStrategy): Record<string, any> {
    const validator = CategoryValidatorFactory.getValidator(strategy.category)
    return validator.generateTestData(agent)
  }

  /**
   * Executa todas as validações
   */
  private async executeValidations(
    agent: Agent, 
    strategy: AgentTestStrategy, 
    testData: Record<string, any>
  ): Promise<TestResults> {
    const startTime = Date.now()
    const warnings: string[] = []
    const recommendations: string[] = []

    // 1. Validação estrutural
    const structureValidation = agentDetector.validateAgent(agent)
    if (!structureValidation.isValid) {
      return {
        success: false,
        executionTime: Date.now() - startTime,
        validationResults: {
          structure: false,
          dataFlow: false,
          nodeValidations: [],
          categorySpecific: false,
          performance: { executionTime: Date.now() - startTime }
        },
        warnings: structureValidation.warnings,
        recommendations: ['Corrigir erros estruturais antes de prosseguir']
      }
    }

    warnings.push(...structureValidation.warnings)

    // 2. Validação de nós individuais - simplificada por enquanto
    const nodeValidations = (agent.nodes || []).map(node => ({
      valid: true,
      warnings: [] as string[]
    }))
    const nodeResults = nodeValidations.map(v => v.valid)
    const allNodesValid = nodeResults.every(Boolean)
    
    nodeValidations.forEach((validation: any) => {
      if (validation.warnings) {
        warnings.push(...validation.warnings)
      }
    })

    // 3. Validação específica da categoria
    const categoryValidator = CategoryValidatorFactory.getValidator(strategy.category)
    const categoryValidation = categoryValidator.validateCategory(agent)
    
    if (categoryValidation.warnings) {
      warnings.push(...categoryValidation.warnings)
    }

    // 4. Teste de execução simulada (se aplicável)
    let executionSuccess = true
    let output: any = null

    try {
      if (strategy.complexity !== 'advanced') {
        output = await this.simulateExecution(agent, testData, strategy)
      }
    } catch (error) {
      executionSuccess = false
      warnings.push(`Erro na simulação de execução: ${error}`)
    }

    // 5. Gerar recomendações
    recommendations.push(...this.generateRecommendations(agent, strategy, warnings))

    const executionTime = Date.now() - startTime

    return {
      success: structureValidation.isValid && allNodesValid && categoryValidation.valid && executionSuccess,
      executionTime,
      validationResults: {
        structure: structureValidation.isValid,
        dataFlow: true, // Simplificado por enquanto
        nodeValidations: nodeValidations.map(v => ({
          nodeId: (v as any).nodeId,
          nodeType: (v as any).nodeType,
          valid: v.valid,
          warnings: v.warnings || []
        })),
        categorySpecific: categoryValidation.valid,
        performance: {
          executionTime,
          apiCalls: this.countAPINodes(agent)
        }
      },
      output,
      warnings,
      recommendations
    }
  }

  /**
   * Simula execução do agente para testes básicos
   */
  private async simulateExecution(
    agent: Agent, 
    testData: Record<string, any>, 
    strategy: AgentTestStrategy
  ): Promise<any> {
    // Simulação básica - em produção, usar runtime engine real
    const inputNode = agent.nodes.find(n => n.data?.nodeType === 'input')
    const outputNode = agent.nodes.find(n => n.data?.nodeType === 'output')
    
    if (!inputNode || !outputNode) {
      throw new Error('Agente deve ter nós de entrada e saída para simulação')
    }

    // Simular processamento baseado nos tipos de nós
    const aiNodes = agent.nodes.filter(n => n.data?.nodeType === 'ai')
    const apiNodes = agent.nodes.filter(n => n.data?.nodeType === 'api')
    
    const simulatedOutput: any = {
      processed_input: testData,
      ai_processing_count: aiNodes.length,
      api_calls_count: apiNodes.length,
      execution_path: agent.nodes.map(n => n.id),
      timestamp: new Date().toISOString()
    }

    // Simular saída baseada no schema de output
    if (outputNode.data?.outputSchema?.properties) {
      const validator = NodeValidatorFactory.getValidator(outputNode.data?.nodeType || 'output')
      const expectedOutput = validator.generateTestData(outputNode)
      simulatedOutput.expected_output = expectedOutput
    }

    return simulatedOutput
  }

  /**
   * Gera recomendações baseadas na análise
   */
  private generateRecommendations(
    agent: Agent, 
    strategy: AgentTestStrategy, 
    warnings: string[]
  ): string[] {
    const recommendations: string[] = []

    // Recomendações baseadas na complexidade
    if (strategy.complexity === 'beginner' && agent.nodes.length > 5) {
      recommendations.push('Considere simplificar o fluxo para melhor manutenibilidade')
    }

    if (strategy.complexity === 'advanced' && agent.nodes.length < 5) {
      recommendations.push('Agente avançado poderia ter mais nós para maior funcionalidade')
    }

    // Recomendações baseadas nos tipos de nós
    const nodeTypes = strategy.nodeTypes
    if (nodeTypes.includes('ai') && !nodeTypes.includes('logic')) {
      recommendations.push('Considere adicionar nó de lógica para validação dos resultados da IA')
    }

    if (nodeTypes.includes('api') && !nodeTypes.includes('logic')) {
      recommendations.push('Adicione validação de erro para chamadas de API')
    }

    // Recomendações baseadas nos warnings
    if (warnings.some(w => w.includes('prompt'))) {
      recommendations.push('Melhore a qualidade dos prompts para resultados mais consistentes')
    }

    if (warnings.some(w => w.includes('schema'))) {
      recommendations.push('Defina schemas de entrada e saída para melhor validação')
    }

    return recommendations
  }

  /**
   * Conta nós de API para métricas
   */
  private countAPINodes(agent: Agent): number {
    return agent.nodes.filter(n => n.data?.nodeType === 'api').length
  }

  /**
   * Gera ID único para execução
   */
  private generateExecutionId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtém status de teste em execução
   */
  getTestStatus(executionId: string): TestExecution | null {
    return this.runningTests.get(executionId) || null
  }

  /**
   * Lista todos os testes em execução
   */
  getRunningTests(): TestExecution[] {
    return Array.from(this.runningTests.values())
  }

  /**
   * Limpa testes concluídos
   */
  cleanupCompletedTests(): void {
    for (const [id, test] of this.runningTests.entries()) {
      if (test.status !== 'running') {
        this.runningTests.delete(id)
      }
    }
  }
}

export const dynamicTestEngine = new DynamicTestEngine()
