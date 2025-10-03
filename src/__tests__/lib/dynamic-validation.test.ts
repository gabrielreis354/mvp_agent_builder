// Teste do sistema de validação dinâmica implementado
// Mock dos módulos que podem causar problemas
jest.mock('@/lib/ai-providers', () => ({
  AIProviderManager: jest.fn().mockImplementation(() => ({
    generateCompletion: jest.fn().mockResolvedValue({ content: 'mocked response' })
  }))
}))

jest.mock('@/lib/services/pdf-service-client', () => ({
  pdfServiceClient: {
    extractPdfText: jest.fn().mockResolvedValue({ success: true, text: 'mock text' }),
    testConnection: jest.fn().mockResolvedValue(true)
  }
}))

import { AgentRuntimeEngine } from '@/lib/runtime/engine'

describe('Dynamic Validation System', () => {
  let engine: AgentRuntimeEngine

  beforeEach(() => {
    engine = new AgentRuntimeEngine()
  })

  it('should validate required fields', () => {
    const mockNode = {
      id: 'validation-1',
      type: 'logic',
      position: { x: 0, y: 0 },
      data: {
        label: 'Validation Node',
        nodeType: 'logic' as const,
        logicType: 'validation',
        validation: `
          if (!isRequired(input.name)) {
            throw new Error('Name is required');
          }
          if (!isEmail(input.email)) {
            throw new Error('Invalid email format');
          }
        `
      }
    }

    const context = {
      executionId: 'test-exec',
      agentId: 'test-agent',
      userId: 'test-user',
      input: {},
      variables: {},
      startTime: new Date()
    }

    // Test valid input
    const validInput = { name: 'John Doe', email: 'john@example.com' }
    const validResult = (engine as any).executeValidation(mockNode.data.validation, validInput, context)
    
    expect(validResult.validated).toBe(true)
    expect(validResult.name).toBe('John Doe')
    expect(validResult.email).toBe('john@example.com')
  })

  it('should handle validation errors gracefully', () => {
    const mockNode = {
      id: 'validation-2',
      type: 'logic',
      position: { x: 0, y: 0 },
      data: {
        label: 'Validation Node',
        nodeType: 'logic' as const,
        logicType: 'validation',
        validation: `
          if (!isRequired(input.name)) {
            throw new Error('Name is required');
          }
        `
      }
    }

    const context = {
      executionId: 'test-exec',
      agentId: 'test-agent',
      userId: 'test-user',
      input: {},
      variables: {},
      startTime: new Date()
    }

    // Test invalid input
    const invalidInput = { name: '', email: 'invalid-email' }
    const invalidResult = (engine as any).executeValidation(mockNode.data.validation, invalidInput, context)
    
    expect(invalidResult.validated).toBe(false)
    expect(invalidResult.validationError).toContain('Name is required')
  })

  it('should provide validation utility functions', () => {
    const mockNode = {
      id: 'validation-3',
      type: 'logic',
      position: { x: 0, y: 0 },
      data: {
        label: 'Validation Node',
        nodeType: 'logic' as const,
        logicType: 'validation',
        validation: `
          if (!isString(input.name) || !minLength(input.name, 2)) {
            throw new Error('Name must be at least 2 characters');
          }
          if (!isNumber(input.age) || !inRange(input.age, 18, 100)) {
            throw new Error('Age must be between 18 and 100');
          }
        `
      }
    }

    const context = {
      executionId: 'test-exec',
      agentId: 'test-agent',
      userId: 'test-user',
      input: {},
      variables: {},
      startTime: new Date()
    }

    // Test with valid data
    const validInput = { name: 'John', age: 25 }
    const validResult = (engine as any).executeValidation(mockNode.data.validation, validInput, context)
    
    expect(validResult.validated).toBe(true)

    // Test with invalid data
    const invalidInput = { name: 'J', age: 150 }
    const invalidResult = (engine as any).executeValidation(mockNode.data.validation, invalidInput, context)
    
    expect(invalidResult.validated).toBe(false)
  })
})
