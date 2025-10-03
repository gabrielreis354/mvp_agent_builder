/**
 * Tests for UnifiedProcessor
 */

import { UnifiedProcessor } from '../unified-processor'

// Mock do pdf-service-client
jest.mock('@/lib/services/pdf-service-client', () => ({
  pdfServiceClient: {
    extractPdfText: jest.fn()
  }
}))

// Mock do pdf-extractor  
jest.mock('../pdf-extractor', () => ({
  PDFExtractor: jest.fn().mockImplementation(() => ({
    extract: jest.fn()
  }))
}))

describe('UnifiedProcessor', () => {
  let processor: UnifiedProcessor
  let mockPdfExtractor: any
  let mockPdfServiceClient: any

  beforeEach(() => {
    processor = new UnifiedProcessor()
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Get mock instances
    const { PDFExtractor } = require('../pdf-extractor')
    const { pdfServiceClient } = require('@/lib/services/pdf-service-client')
    
    mockPdfExtractor = new PDFExtractor()
    mockPdfServiceClient = pdfServiceClient
  })

  describe('processPDF', () => {
    const createMockFile = (name: string, size: number = 1000): File => {
      const blob = new Blob(['fake pdf content'], { type: 'application/pdf' })
      return new File([blob], name, { type: 'application/pdf', lastModified: Date.now() })
    }

    it('should use Python service when available', async () => {
      const mockFile = createMockFile('test.pdf')
      
      // Mock Python service success
      mockPdfServiceClient.extractPdfText.mockResolvedValue({
        success: true,
        text: 'Extracted text from Python service',
        character_count: 35,
        pages: 1,
        confidence: 0.95,
        method: 'pdf2text',
        processing_time: 100
      })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.extractedText).toBe('Extracted text from Python service')
      expect(result.data?.extractedData.source).toBe('python-microservice')
      expect(result.method).toBe('real')
      expect(mockPdfServiceClient.extractPdfText).toHaveBeenCalledWith(mockFile)
    })

    it('should fallback to JavaScript extractor when Python fails', async () => {
      const mockFile = createMockFile('test.pdf')
      
      // Mock Python service failure
      mockPdfServiceClient.extractPdfText.mockRejectedValue(new Error('Service unavailable'))
      
      // Mock JavaScript extractor success
      mockPdfExtractor.extract.mockResolvedValue({
        success: true,
        text: 'Extracted text from JavaScript',
        method: 'direct-extraction',
        pageCount: 1,
        confidence: 0.85
      })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.extractedText).toBe('Extracted text from JavaScript')
      expect(result.data?.extractedData.source).toBe('javascript-fallback')
      expect(mockPdfServiceClient.extractPdfText).toHaveBeenCalled()
      expect(mockPdfExtractor.extract).toHaveBeenCalled()
    })

    it('should fail when both methods fail', async () => {
      const mockFile = createMockFile('test.pdf')
      
      // Mock Python service failure
      mockPdfServiceClient.extractPdfText.mockRejectedValue(new Error('Service unavailable'))
      
      // Mock JavaScript extractor failure  
      mockPdfExtractor.extract.mockResolvedValue({
        success: false,
        text: '',
        method: 'failed',
        pageCount: 0,
        confidence: 0,
        error: 'Could not extract text'
      })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to extract PDF text')
    })
  })

  describe('processFile - different file types', () => {
    it('should handle text files', async () => {
      const blob = new Blob(['Sample text content'], { type: 'text/plain' })
      const mockFile = new File([blob], 'test.txt', { type: 'text/plain' })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.extractedText).toBe('Sample text content')
      expect(result.data?.mimeType).toBe('text/plain')
    })

    it('should reject unsupported file types', async () => {
      const blob = new Blob(['fake image'], { type: 'image/jpeg' })
      const mockFile = new File([blob], 'test.jpg', { type: 'image/jpeg' })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported file type')
    })
  })

  describe('content analysis', () => {
    it('should detect contract documents', async () => {
      const contractText = 'CONTRATO DE TRABALHO\nEMPREGADOR: TechCorp\nEMPREGADO: João Silva\nSALÁRIO: R$ 5.000,00'
      const blob = new Blob([contractText], { type: 'text/plain' })
      const mockFile = new File([blob], 'contrato.txt', { type: 'text/plain' })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.extractedData.documentType).toBe('contrato-trabalho')
      expect(result.data?.extractedData.hasCurrency).toBe(true)
      expect(result.data?.extractedData.entities.monetaryValues).toContain('R$ 5.000,00')
    })

    it('should detect resume documents', async () => {
      const resumeText = 'CURRÍCULO PROFISSIONAL\nExperiência profissional em desenvolvimento\nFormação acadêmica: Engenharia'
      const blob = new Blob([resumeText], { type: 'text/plain' })
      const mockFile = new File([blob], 'curriculo.txt', { type: 'text/plain' })

      const result = await processor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.extractedData.documentType).toBe('curriculo')
    })
  })

  describe('configuration options', () => {
    it('should respect timeout configuration', async () => {
      const shortTimeoutProcessor = new UnifiedProcessor({ timeout: 1 })
      const mockFile = new File([new Blob(['test'])], 'test.pdf', { type: 'application/pdf' })

      // Mock slow Python service
      mockPdfServiceClient.extractPdfText.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )

      const start = Date.now()
      const result = await shortTimeoutProcessor.processFile(mockFile)
      const elapsed = Date.now() - start

      // Should not wait for slow service, should fallback quickly
      expect(elapsed).toBeLessThan(50)
    })

    it('should use fallback when configured', async () => {
      const fallbackProcessor = new UnifiedProcessor({ fallbackToMock: true })
      const mockFile = new File([new Blob(['test'])], 'test.pdf', { type: 'application/pdf' })

      // Mock all extraction methods to fail
      mockPdfServiceClient.extractPdfText.mockRejectedValue(new Error('Failed'))
      mockPdfExtractor.extract.mockResolvedValue({ success: false, error: 'Failed' })

      const result = await fallbackProcessor.processFile(mockFile)

      expect(result.success).toBe(true)
      expect(result.method).toBe('fallback')
      expect(result.data?.extractedData.isMock).toBe(true)
    })
  })
})
