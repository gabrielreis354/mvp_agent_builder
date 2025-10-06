import { NodeTemplate } from '@/types/agent'

// Cards Amigáveis para Usuários RH
export const friendlyNodeTemplates: NodeTemplate[] = [
  // CATEGORIA: RECEBER DADOS
  {
    type: 'input',
    label: '📄 Receber Documento',
    description: 'Recebe arquivos PDF, Word ou Excel para análise',
    icon: 'FileText',
    defaultData: {
      label: 'Receber Documento',
      inputSchema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' }
        }
      }
    },
    requiredFields: ['inputSchema'],
    category: 'Receber Dados'
  },
  {
    type: 'input',
    label: '✍️ Receber Texto',
    description: 'Recebe texto digitado pelo usuário',
    icon: 'MessageSquare',
    defaultData: {
      label: 'Receber Texto',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' }
        }
      }
    },
    requiredFields: ['inputSchema'],
    category: 'Receber Dados'
  },

  // CATEGORIA: ANALISAR COM IA
  {
    type: 'ai',
    label: '📋 Analisar Contrato',
    description: 'Analisa contratos trabalhistas e valida CLT',
    icon: 'FileCheck',
    defaultData: {
      label: 'Analisar Contrato',
      prompt: 'Analise este contrato trabalhista e extraia: nome, cargo, salário, data de admissão, e verifique conformidade com CLT.',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3
    },
    requiredFields: ['prompt', 'provider'],
    category: 'Analisar com IA'
  },
  {
    type: 'ai',
    label: '👤 Analisar Currículo',
    description: 'Avalia currículos e pontua candidatos',
    icon: 'UserCheck',
    defaultData: {
      label: 'Analisar Currículo',
      prompt: 'Analise este currículo e pontue de 0-100 baseado em: experiência, formação, habilidades técnicas.',
      provider: 'openai',
      model: 'gpt-4o-mini'
    },
    requiredFields: ['prompt', 'provider'],
    category: 'Analisar com IA'
  },

  // CATEGORIA: VALIDAR E VERIFICAR
  {
    type: 'logic',
    label: '⚖️ Validar CLT',
    description: 'Verifica conformidade com legislação trabalhista',
    icon: 'Scale',
    defaultData: {
      label: 'Validar CLT',
      logicType: 'validate',
      validation: 'validateCLTCompliance(data)'
    },
    requiredFields: ['logicType'],
    category: 'Validar e Verificar'
  },
  {
    type: 'logic',
    label: '🔀 Decidir Caminho',
    description: 'Escolhe próximo passo baseado em condições',
    icon: 'GitBranch',
    defaultData: {
      label: 'Decidir Caminho',
      logicType: 'condition',
      condition: 'data.score > 70'
    },
    requiredFields: ['logicType'],
    category: 'Validar e Verificar'
  },

  // CATEGORIA: ENVIAR E GERAR
  {
    type: 'api',
    label: '📧 Enviar Email',
    description: 'Envia email com relatório ou notificação',
    icon: 'Send',
    defaultData: {
      label: 'Enviar Email',
      apiEndpoint: '/api/send-email',
      apiMethod: 'POST',
      apiHeaders: { 'Content-Type': 'application/json' }
    },
    requiredFields: ['apiEndpoint'],
    category: 'Enviar e Gerar'
  },
  {
    type: 'output',
    label: '📄 Gerar PDF',
    description: 'Cria relatório em PDF profissional',
    icon: 'FileOutput',
    defaultData: {
      label: 'Gerar PDF',
      outputSchema: {
        type: 'object',
        properties: {
          pdf: { type: 'string', format: 'binary' }
        }
      }
    },
    requiredFields: ['outputSchema'],
    category: 'Enviar e Gerar'
  }
]

// Cards Avançados (Modo Desenvolvedor)
export const advancedNodeTemplates: NodeTemplate[] = [
  {
    type: 'api',
    label: '🌐 API Call',
    description: 'Integração customizada com qualquer API externa',
    icon: 'Globe',
    defaultData: {
      label: 'API Call',
      apiEndpoint: 'https://api.exemplo.com/data',
      apiMethod: 'POST'
    },
    requiredFields: ['apiEndpoint'],
    category: 'Avançado'
  }
]
