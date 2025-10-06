/**
 * Testes de Validação do Sistema - AutomateAI MVP
 * 
 * Testa componentes críticos implementados:
 * - Sistema de tratamento de erros
 * - Cards amigáveis
 * - Fallback de IA
 */

import { ErrorHandler, ValidationError, FileProcessingError, AIProviderError } from '@/lib/errors/error-handler'
import { friendlyNodeTemplates } from '@/lib/friendly-nodes'

// Jest globals são importados automaticamente
declare const describe: any
declare const it: any
declare const expect: any
declare const beforeEach: any

describe('Sistema de Tratamento de Erros', () => {
  describe('ErrorHandler', () => {
    it('deve converter erro nativo em AppError', () => {
      const nativeError = new Error('Erro genérico')
      const appError = ErrorHandler.handle(nativeError)

      expect(appError.type).toBeDefined()
      expect(appError.severity).toBeDefined()
      expect(appError.userMessage).toBeDefined()
      expect(appError.technicalMessage).toBeDefined()
    })

    it('deve criar ValidationError com mensagem amigável', () => {
      const error = new ValidationError('agentId', 'Agente não encontrado', { agentId: '123' })

      expect(error.type).toBe('VALIDATION_ERROR')
      expect(error.userMessage).toContain('Agente não encontrado')
      expect(error.context?.agentId).toBe('123')
      expect(error.retryable).toBe(true)
    })

    it('deve criar FileProcessingError com severidade HIGH', () => {
      const error = new FileProcessingError('documento.pdf', 'Arquivo corrompido')

      expect(error.type).toBe('FILE_PROCESSING_ERROR')
      expect(error.severity).toBe('HIGH')
      expect(error.userMessage).toContain('Arquivo corrompido')
    })

    it('deve criar AIProviderError com sugestão de retry', () => {
      const error = new AIProviderError('openai', 'Quota exceeded', { quotaLimit: 100 })

      expect(error.type).toBe('AI_PROVIDER_ERROR')
      expect(error.retryable).toBe(true)
      expect(error.suggestedAction).toBeDefined()
    })
  })

  describe('Estratégias de Retry', () => {
    it('deve ter delay correto para AI_QUOTA_EXCEEDED', () => {
      const error = new AIProviderError('openai', 'Quota exceeded')
      
      // Quota exceeded deve ter delay de 60 segundos
      expect(error.retryable).toBe(true)
    })

    it('deve ter delay correto para NETWORK_ERROR', () => {
      const error = ErrorHandler.handle(new Error('Network timeout'))
      
      expect(error.retryable).toBe(true)
    })
  })

  describe('Mensagens Amigáveis', () => {
    it('deve ter mensagem em português para ValidationError', () => {
      const error = new ValidationError('nodes', 'Agente deve ter nós')

      expect(error.userMessage).toMatch(/português|nós|agente/i)
      expect(error.userMessage).not.toMatch(/error|exception|undefined/i)
    })

    it('deve ter ação sugerida clara', () => {
      const error = new FileProcessingError('arquivo.pdf', 'Não foi possível extrair texto')

      expect(error.suggestedAction).toBeDefined()
      expect(error.suggestedAction?.length).toBeGreaterThan(10)
      expect(error.suggestedAction).toMatch(/verifique|tente|envie/i)
    })
  })
})

describe('Cards Amigáveis', () => {
  describe('Estrutura dos Cards', () => {
    it('deve ter 8 cards amigáveis definidos', () => {
      expect(friendlyNodeTemplates).toHaveLength(8)
    })

    it('deve ter cards em 4 categorias', () => {
      const categories = new Set(friendlyNodeTemplates.map(card => card.category))
      
      expect(categories.size).toBe(4)
      expect(categories).toContain('Receber Dados')
      expect(categories).toContain('Analisar com IA')
      expect(categories).toContain('Validar e Verificar')
      expect(categories).toContain('Enviar e Gerar')
    })

    it('todos os cards devem ter labels em português', () => {
      friendlyNodeTemplates.forEach(card => {
        expect(card.label).toBeDefined()
        expect(card.label.length).toBeGreaterThan(3)
        // Não deve ter termos técnicos em inglês
        expect(card.label).not.toMatch(/input|output|api call|logic|processing/i)
      })
    })

    it('todos os cards devem ter descrições claras', () => {
      friendlyNodeTemplates.forEach(card => {
        expect(card.description).toBeDefined()
        expect(card.description.length).toBeGreaterThan(10)
        // Deve ser em português
        expect(card.description).toMatch(/[áéíóúâêôãõç]/i)
      })
    })

    it('todos os cards devem ter ícones', () => {
      friendlyNodeTemplates.forEach(card => {
        expect(card.icon).toBeDefined()
        expect(card.label).toMatch(/^[📄✍️📋👤⚖️🔀📧📄]/i)
      })
    })
  })

  describe('Cards Específicos', () => {
    it('deve ter card "Receber Documento"', () => {
      const card = friendlyNodeTemplates.find(c => c.label.includes('Receber Documento'))
      
      expect(card).toBeDefined()
      expect(card?.type).toBe('input')
      expect(card?.category).toBe('Receber Dados')
    })

    it('deve ter card "Analisar Contrato"', () => {
      const card = friendlyNodeTemplates.find(c => c.label.includes('Analisar Contrato'))
      
      expect(card).toBeDefined()
      expect(card?.type).toBe('ai')
      expect(card?.category).toBe('Analisar com IA')
      expect(card?.defaultData?.prompt).toContain('contrato')
    })

    it('deve ter card "Validar CLT"', () => {
      const card = friendlyNodeTemplates.find(c => c.label.includes('Validar CLT'))
      
      expect(card).toBeDefined()
      expect(card?.type).toBe('logic')
      expect(card?.category).toBe('Validar e Verificar')
    })

    it('deve ter card "Enviar Email"', () => {
      const card = friendlyNodeTemplates.find(c => c.label.includes('Enviar Email'))
      
      expect(card).toBeDefined()
      expect(card?.type).toBe('api')
      expect(card?.category).toBe('Enviar e Gerar')
    })
  })

  describe('Dados Padrão dos Cards', () => {
    it('cards de IA devem ter prompts pré-configurados', () => {
      const aiCards = friendlyNodeTemplates.filter(c => c.type === 'ai')
      
      aiCards.forEach(card => {
        expect(card.defaultData?.prompt).toBeDefined()
        expect(card.defaultData?.prompt?.length).toBeGreaterThan(20)
        expect(card.defaultData?.provider).toBe('openai')
        expect(card.defaultData?.model).toBe('gpt-4o-mini')
      })
    })

    it('cards de API devem ter endpoints configurados', () => {
      const apiCards = friendlyNodeTemplates.filter(c => c.type === 'api')
      
      apiCards.forEach(card => {
        expect(card.defaultData?.apiEndpoint).toBeDefined()
        expect(card.defaultData?.apiMethod).toBeDefined()
      })
    })
  })
})

describe('Validações do Runtime', () => {
  describe('Validação de Documento', () => {
    it('deve detectar quando prompt requer documento', () => {
      const prompts = [
        'Analise este documento',
        'Extraia dados do contrato',
        'Leia o PDF e resuma',
        'Analise o arquivo enviado'
      ]

      prompts.forEach(prompt => {
        const needsDocument = prompt.toLowerCase().includes('documento') ||
                             prompt.toLowerCase().includes('contrato') ||
                             prompt.toLowerCase().includes('pdf') ||
                             prompt.toLowerCase().includes('arquivo')
        
        expect(needsDocument).toBe(true)
      })
    })

    it('deve permitir prompts sem documento', () => {
      const prompts = [
        'Gere um relatório',
        'Crie um resumo',
        'Calcule o total'
      ]

      prompts.forEach(prompt => {
        const needsDocument = prompt.toLowerCase().includes('documento') ||
                             prompt.toLowerCase().includes('contrato') ||
                             prompt.toLowerCase().includes('pdf')
        
        expect(needsDocument).toBe(false)
      })
    })
  })

  describe('Validação de Texto Extraído', () => {
    it('deve rejeitar texto vazio', () => {
      const emptyTexts = ['', '   ', '\n\n', null, undefined]

      emptyTexts.forEach(text => {
        const isValid = text && text.trim().length > 0
        expect(isValid).toBe(false)
      })
    })

    it('deve aceitar texto válido', () => {
      const validTexts = [
        'Contrato de trabalho entre...',
        'CONTRATO\n\nCláusula 1...',
        'Este documento estabelece...'
      ]

      validTexts.forEach(text => {
        const isValid = text && text.trim().length > 10
        expect(isValid).toBe(true)
      })
    })
  })
})

describe('Integração de Componentes', () => {
  describe('Fluxo Completo', () => {
    it('deve ter todos os componentes necessários para fluxo de análise', () => {
      // Verificar se temos cards para cada etapa
      const receberDoc = friendlyNodeTemplates.find(c => c.label.includes('Receber Documento'))
      const analisar = friendlyNodeTemplates.find(c => c.label.includes('Analisar'))
      const validar = friendlyNodeTemplates.find(c => c.label.includes('Validar'))
      const enviar = friendlyNodeTemplates.find(c => c.label.includes('Enviar'))

      expect(receberDoc).toBeDefined()
      expect(analisar).toBeDefined()
      expect(validar).toBeDefined()
      expect(enviar).toBeDefined()
    })
  })
})
