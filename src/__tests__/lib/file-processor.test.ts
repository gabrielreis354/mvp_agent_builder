// Teste simples para validar que o sistema de logging está funcionando
import { logger } from '@/lib/utils/logger'

describe('File Processor & Logging System', () => {
  it('should have logger system working', () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('should log messages without errors', () => {
    expect(() => {
      logger.info('Test message', 'TEST')
      logger.debug('Debug message', 'TEST')
      logger.error('Error message', 'TEST')
    }).not.toThrow()
  })

  it('should have execution logging methods', () => {
    expect(typeof logger.startExecution).toBe('function')
    expect(typeof logger.logNodeExecution).toBe('function')
    expect(typeof logger.completeExecution).toBe('function')
  })

  it('should handle execution logging without errors', () => {
    expect(() => {
      logger.startExecution('test-exec-1', 'agent-1', 'Test Agent', 'user-1', 3)
      logger.logNodeExecution('test-exec-1', 'node-1', 'Test Node', true, 100, { result: 'success' })
      logger.completeExecution('test-exec-1', true)
    }).not.toThrow()
  })

  it('should handle specialized logging methods', () => {
    expect(() => {
      logger.api('/test', 'API call test')
      logger.pdf('test.pdf', 'PDF processing test')
      logger.ai('openai', 'AI call test')
      logger.security('Security test')
    }).not.toThrow()
  })
})
