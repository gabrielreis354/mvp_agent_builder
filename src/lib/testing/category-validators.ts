import { Agent } from '@/types/agent'
import { ValidationResult } from './agent-detector'

export interface CategoryTestCase {
  testData: Record<string, any>
  validations: string[]
  expectedOutputs?: string[]
}

export interface CategoryValidator {
  validateCategory(agent: Agent): ValidationResult
  getTestCases(agentId: string): CategoryTestCase[]
  generateTestData(agent: Agent): Record<string, any>
}

/**
 * Validador para categoria RH & Jurídico
 */
export class RHJuridicoValidator implements CategoryValidator {
  
  private readonly rhTestCases: Record<string, CategoryTestCase> = {
    'contract-analyzer': {
      testData: {
        file: 'contrato-exemplo.pdf',
        email_gestor: 'gestor@test.com',
        departamento: 'RH'
      },
      validations: [
        'partes_envolvidas_extraidas',
        'valor_contrato_identificado',
        'prazo_contrato_validado',
        'clausulas_importantes_listadas',
        'pdf_gerado',
        'email_enviado'
      ],
      expectedOutputs: [
        'relatorio_pdf',
        'dados_extraidos',
        'status_conformidade'
      ]
    },
    
    'customer-support': {
      testData: {
        funcionario: 'João Silva',
        departamento: 'TI',
        duvida: 'Como solicitar férias pelo sistema?',
        canal: 'email'
      },
      validations: [
        'classificacao_categoria',
        'nivel_urgencia_definido',
        'resposta_automatica_gerada',
        'roteamento_especialista'
      ]
    },
    
    'expense-analyzer': {
      testData: {
        planilha_despesas: 'despesas-rh.xlsx',
        tipo_despesa: 'vale-transporte',
        periodo: '2024-01',
        departamento: 'RH'
      },
      validations: [
        'conformidade_politicas',
        'valores_dentro_limites',
        'documentacao_adequada',
        'padroes_anomalos_identificados'
      ]
    },
    
    'document-processor': {
      testData: {
        documentos: ['rg.pdf', 'cpf.pdf', 'carteira-trabalho.pdf'],
        funcionario_id: 'func-123',
        tipo_documento: 'rg'
      },
      validations: [
        'ocr_executado',
        'dados_extraidos',
        'validacao_autenticidade',
        'alertas_vencimento'
      ]
    },
    
    'recruitment-screening': {
      testData: {
        curriculos: ['curriculo1.pdf', 'curriculo2.pdf'],
        descricao_vaga: 'Desenvolvedor Full Stack - React/Node.js',
        criterios_peso: {
          experiencia: 0.4,
          formacao: 0.2,
          habilidades: 0.3,
          idiomas: 0.1
        }
      },
      validations: [
        'curriculos_analisados',
        'pontuacao_calculada',
        'ranking_gerado',
        'recomendacoes_entrevista'
      ]
    },
    
    'onboarding-automation': {
      testData: {
        nome: 'Maria Santos',
        cargo: 'Analista de RH',
        departamento: 'RH',
        data_inicio: '2024-02-01',
        email: 'maria.santos@empresa.com',
        gestor_direto: 'Carlos Silva'
      },
      validations: [
        'checklist_personalizado',
        'treinamentos_agendados',
        'kit_boas_vindas_enviado',
        'sistemas_configurados'
      ]
    },
    
    'performance-evaluation': {
      testData: {
        funcionario: 'Pedro Costa',
        autoavaliacao: { lideranca: 8, comunicacao: 9, tecnico: 7 },
        feedback_gestor: { lideranca: 7, comunicacao: 8, tecnico: 8 },
        feedback_pares: [
          { lideranca: 8, comunicacao: 9, tecnico: 7 },
          { lideranca: 7, comunicacao: 8, tecnico: 8 }
        ],
        metas_periodo: ['Implementar novo sistema', 'Treinar equipe'],
        resultados_alcancados: ['Sistema implementado', 'Equipe treinada']
      },
      validations: [
        'analise_360_completa',
        'score_performance_calculado',
        'plano_desenvolvimento_gerado',
        'recomendacoes_rh'
      ]
    }
  }

  validateCategory(agent: Agent): ValidationResult {
    const warnings: string[] = []
    
    // Verificar se tem nós específicos de RH
    const hasFileUpload = agent.nodes.some(n => 
      n.data?.inputSchema?.properties?.file ||
      n.data?.inputSchema?.properties?.documentos ||
      n.data?.inputSchema?.properties?.curriculos
    )
    
    const hasEmailIntegration = agent.nodes.some(n =>
      n.data?.inputSchema?.properties?.email ||
      n.data?.label?.toLowerCase().includes('email')
    )
    
    const hasRHPrompts = agent.nodes.some(n =>
      n.data?.prompt?.toLowerCase().includes('rh') ||
      n.data?.prompt?.toLowerCase().includes('contrato') ||
      n.data?.prompt?.toLowerCase().includes('funcionário')
    )
    
    if (!hasFileUpload && !hasEmailIntegration && !hasRHPrompts) {
      warnings.push('Agente de RH deveria ter processamento de arquivos, integração de email ou prompts específicos de RH')
    }
    
    // Verificar se tem nós de AI para análise
    const aiNodes = agent.nodes.filter(n => n.data?.nodeType === 'ai')
    if (aiNodes.length === 0) {
      return { valid: false, error: 'Agentes de RH precisam de pelo menos um nó de IA para análise' }
    }
    
    // Verificar se tem saída estruturada
    const outputNode = agent.nodes.find(n => n.data?.nodeType === 'output')
    if (!outputNode?.data?.outputSchema) {
      warnings.push('Recomendado definir schema de saída estruturado para relatórios de RH')
    }
    
    return { valid: true, warnings }
  }

  getTestCases(agentId: string): CategoryTestCase[] {
    const testCase = this.rhTestCases[agentId]
    return testCase ? [testCase] : []
  }

  generateTestData(agent: Agent): Record<string, any> {
    // Gerar dados de teste baseados no schema de entrada
    const inputNode = agent.nodes.find(n => n.data?.nodeType === 'input')
    const schema = inputNode?.data?.inputSchema?.properties || {}
    
    const testData: Record<string, any> = {}
    
    for (const [key, prop] of Object.entries(schema)) {
      const property = prop as any
      
      switch (property.type) {
        case 'string':
          if (property.format === 'email') {
            testData[key] = 'teste@empresa.com'
          } else if (property.format === 'date') {
            testData[key] = '2024-01-15'
          } else if (property.format === 'binary') {
            testData[key] = 'documento-teste.pdf'
          } else {
            testData[key] = property.description || 'Valor de teste'
          }
          break
          
        case 'number':
          testData[key] = 100
          break
          
        case 'boolean':
          testData[key] = true
          break
          
        case 'array':
          testData[key] = ['item1', 'item2']
          break
          
        case 'object':
          testData[key] = { campo: 'valor' }
          break
          
        default:
          testData[key] = 'Teste'
      }
    }
    
    return testData
  }
}

/**
 * Validador para agentes customizados (drag-and-drop)
 */
export class CustomAgentValidator implements CategoryValidator {
  
  validateCategory(agent: Agent): ValidationResult {
    const warnings: string[] = []
    
    // Validações básicas para agentes customizados
    const nodeTypes = agent.nodes.map(n => n.data?.nodeType)
    const hasLogicFlow = nodeTypes.includes('input') && 
                        nodeTypes.includes('output')
    
    if (!hasLogicFlow) {
      return { valid: false, error: 'Agente customizado deve ter fluxo de entrada e saída' }
    }
    
    // Verificar se nós AI têm prompts
    const aiNodes = agent.nodes.filter(n => n.data?.nodeType === 'ai')
    for (const node of aiNodes) {
      if (!node.data?.prompt) {
        warnings.push(`Nó AI '${node.id}' sem prompt definido`)
      }
    }
    
    // Verificar se nós API têm configuração
    const apiNodes = agent.nodes.filter(n => n.data?.nodeType === 'api')
    for (const node of apiNodes) {
      if (node.data.apiEndpoint) {
        warnings.push(`API node ${node.id} has endpoint configuration but may need authentication setup`)
      }
    }
    
    return { valid: true, warnings }
  }

  getTestCases(agentId: string): CategoryTestCase[] {
    // Para agentes customizados, gerar caso de teste genérico
    return [{
      testData: {
        text: 'Teste de execução do agente customizado',
        timestamp: new Date().toISOString()
      },
      validations: [
        'fluxo_executado',
        'saida_gerada'
      ]
    }]
  }

  generateTestData(agent: Agent): Record<string, any> {
    const inputNode = agent.nodes.find(n => n.data?.nodeType === 'input')
    const schema = inputNode?.data?.inputSchema?.properties || {}
    
    if (Object.keys(schema).length === 0) {
      // Schema vazio, usar dados genéricos
      return {
        input: 'Dados de teste para agente customizado',
        timestamp: new Date().toISOString()
      }
    }
    
    // Usar mesmo método do RH para gerar dados baseados no schema
    const rhValidator = new RHJuridicoValidator()
    return rhValidator.generateTestData(agent)
  }
}

/**
 * Factory para obter validador apropriado
 */
export class CategoryValidatorFactory {
  static getValidator(category: string): CategoryValidator {
    switch (category) {
      case 'RH & Jurídico':
        return new RHJuridicoValidator()
      case 'custom':
      default:
        return new CustomAgentValidator()
    }
  }
}

export const categoryValidatorFactory = new CategoryValidatorFactory()
