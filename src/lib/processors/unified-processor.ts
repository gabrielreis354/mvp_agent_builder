/**
 * Unified File Processor - Processador unificado e limpo
 */

import { pdfServiceClient, PdfExtractionResult } from '@/lib/services/pdf-service-client'
import { PDFExtractor } from './pdf-extractor'

export interface ProcessedFile {
  id: string
  originalName: string
  mimeType: string
  size: number
  extractedText: string
  extractedData: any
  metadata: {
    processedAt: string
    processingTime: number
    ocrConfidence: number
    method: string
  }
}

export interface ProcessingResult {
  success: boolean
  data: ProcessedFile | null
  error?: string
  method: 'real' | 'fallback' | 'mock'
  processingTime: number
}

export interface ProcessorConfig {
  enableOCR?: boolean
  fallbackToMock?: boolean
  timeout?: number
  pythonServiceUrl?: string
  healthCheckInterval?: number
}

export class UnifiedProcessor {
  private config: ProcessorConfig
  private pythonServiceHealthy: boolean = true
  private lastHealthCheck: number = 0

  constructor(config: ProcessorConfig = {}) {
    this.config = {
      fallbackToMock: false,
      timeout: 30000,
      pythonServiceUrl: process.env.PYTHON_SERVICE_URL || (process.env.NODE_ENV === 'production' ? '/api/pdf-service' : 'http://localhost:8001'),
      healthCheckInterval: 30000, // 30 seconds
      ...config,
    }
  }

  async processFile(file: File): Promise<ProcessingResult> {
    const startTime = Date.now()
    console.log(`🚀 Processing file with microservice: ${file.name} (${file.type})`)

    try {
      // Always delegate to the microservice
      const processedFile = await this.processWithMicroservice(file)

      const processingTime = Date.now() - startTime
      console.log(`✅ File processed in ${processingTime}ms via ${processedFile.metadata.method}`)

      return {
        success: true,
        data: processedFile,
        method: 'real',
        processingTime,
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ Microservice processing failed after ${processingTime}ms:`, error)

      // Tentar fallback com PDFExtractor nativo
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.warn('⚠️ Tentando fallback com PDFExtractor nativo...')
        try {
          const pdfExtractor = new PDFExtractor()
          const extractResult = await pdfExtractor.extract(file)
          
          if (extractResult.success && extractResult.text.length > 50) {
            console.log(`✅ Fallback PDFExtractor funcionou: ${extractResult.text.length} caracteres`)
            
            const analysis = this.analyzeContent(extractResult.text)
            const processedFile: ProcessedFile = {
              id: this.generateId(),
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              extractedText: extractResult.text,
              extractedData: {
                ...analysis,
                pageCount: extractResult.pageCount,
                extractionMethod: extractResult.method,
                confidence: extractResult.confidence,
                source: 'native-fallback',
              },
              metadata: {
                processedAt: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                ocrConfidence: extractResult.confidence,
                method: 'native-fallback'
              }
            }
            
            return {
              success: true,
              data: processedFile,
              method: 'fallback',
              processingTime: Date.now() - startTime,
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback PDFExtractor também falhou:', fallbackError)
        }
      }

      if (this.config.fallbackToMock) {
        console.warn('⚠️ Falling back to mock data.')
        return {
          success: true,
          data: this.getMockData(file),
          method: 'fallback',
          processingTime,
        }
      }

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'real',
        processingTime,
      }
    }
  }

  private async processWithMicroservice(file: File): Promise<ProcessedFile> {
    console.log(`📄 Calling Python microservice for ${file.name}...`)

    await this.checkPythonServiceHealth()

    if (!this.pythonServiceHealthy) {
      throw new Error('Python microservice is unhealthy. Cannot process file.')
    }

    const result = await pdfServiceClient.extractPdfText(file)

    if (!result.success || !result.text) {
      throw new Error(result.error || 'Microservice failed to extract file content')
    }

    console.log(`✅ Microservice success: Extracted ${result.text.length} chars using ${result.method}`)

    const analysis = this.analyzeContent(result.text)

    return {
      id: this.generateId(),
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      extractedText: result.text,
      extractedData: {
        ...analysis,
        pageCount: result.pages,
        extractionMethod: result.method,
        confidence: result.confidence,
        processingTime: result.processing_time,
        source: 'python-microservice',
      },
      metadata: {
        processedAt: new Date().toISOString(),
        processingTime: result.processing_time,
        ocrConfidence: result.confidence,
        method: `python-${result.method}`,
      },
    }
  }
  
  private analyzeContent(text: string): any {
    const analysis: any = {
      textLength: text.length,
      wordCount: text.split(/\s+/).length,
      lineCount: text.split('\n').length,
      hasNumbers: /\d/.test(text),
      hasCurrency: /R\$|USD|\$|€/.test(text),
      hasEmail: /\S+@\S+\.\S+/.test(text),
      hasPhone: /\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{4}/.test(text),
      hasCPF: /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(text),
      hasCNPJ: /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(text),
      hasDate: /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text)
    }
    
    // Detectar tipo de documento
    const textLower = text.toLowerCase()
    if (textLower.includes('contrato') && (textLower.includes('trabalho') || textLower.includes('emprego'))) {
      analysis.documentType = 'contrato-trabalho'
    } else if (textLower.includes('currículo') || textLower.includes('curriculum') || textLower.includes('experiência profissional')) {
      analysis.documentType = 'curriculo'
    } else if (textLower.includes('despesa') || textLower.includes('reembolso') || textLower.includes('nota fiscal')) {
      analysis.documentType = 'despesa'
    } else if (textLower.includes('relatório')) {
      analysis.documentType = 'relatorio'
    } else {
      analysis.documentType = 'documento-geral'
    }
    
    // Extrair entidades importantes
    analysis.entities = this.extractEntities(text)
    
    return analysis
  }
  
  private extractEntities(text: string): any {
    const entities: any = {}
    
    // Extrair nomes (palavras capitalizadas consecutivas)
    const nameMatches = text.match(/[A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+/g)
    if (nameMatches) {
      entities.possibleNames = [...new Set(nameMatches)].slice(0, 5)
    }
    
    // Extrair valores monetários
    const moneyMatches = text.match(/R\$\s*[\d.,]+/g)
    if (moneyMatches) {
      entities.monetaryValues = moneyMatches.slice(0, 5)
    }
    
    // Extrair datas
    const dateMatches = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g)
    if (dateMatches) {
      entities.dates = dateMatches.slice(0, 5)
    }
    
    // Extrair emails
    const emailMatches = text.match(/\S+@\S+\.\S+/g)
    if (emailMatches) {
      entities.emails = emailMatches.slice(0, 3)
    }
    
    return entities
  }
  
  private getMockData(file: File): ProcessedFile {
    console.warn('⚠️ Using mock data as fallback')
    
    const mockText = `DOCUMENTO DE DEMONSTRAÇÃO
    
Este é um texto de demonstração usado quando a extração real falha.
Nome: Exemplo de Teste
Data: ${new Date().toLocaleDateString('pt-BR')}
Status: Processamento com fallback

O sistema não conseguiu extrair o texto real do arquivo ${file.name}.
Por favor, verifique se o arquivo está corrompido ou tente novamente.`
    
    return {
      id: this.generateId(),
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      extractedText: mockText,
      extractedData: {
        isMock: true,
        reason: 'Extraction failed, using fallback'
      },
      metadata: {
        processedAt: new Date().toISOString(),
        processingTime: 100,
        ocrConfidence: 0,
        method: 'mock-fallback'
      }
    }
  }
  
  /**
   * Health check do microserviço Python
   */
  private async checkPythonServiceHealth(): Promise<void> {
    const now = Date.now()
    
    // Só verifica se passou do intervalo configurado
    if (now - this.lastHealthCheck < this.config.healthCheckInterval!) {
      return
    }
    
    this.lastHealthCheck = now
    
    try {
      console.log('🔍 Checking Python service health...')
      const isHealthy = await pdfServiceClient.testConnection()
      
      if (isHealthy !== this.pythonServiceHealthy) {
        this.pythonServiceHealthy = isHealthy
        console.log(`🔄 Python service status changed: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
      }
    } catch (error) {
      if (this.pythonServiceHealthy) {
        this.pythonServiceHealthy = false
        console.log('⚠️ Python service marked as unhealthy:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }
  
  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
