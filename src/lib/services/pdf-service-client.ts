export interface PdfExtractionResult {
  text: string
  content?: string // For compatibility with service response
  pages: number
  tables: number
  confidence: number
  method: string
  filename: string
  file_size: number
  processing_time: number
  character_count: number
  word_count: number
  extracted_at: string
  success: boolean
  error?: string
}

export interface PdfServiceHealth {
  status: string
  timestamp: string
  methods_available: number
}

export class PdfServiceClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl?: string, timeout = 30000) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_PDF_SERVICE_URL || (process.env.NODE_ENV === 'production' ? '/api/pdf-service' : 'http://localhost:8001')
    this.timeout = timeout
  }

  /**
   * Check if PDF service is healthy
   */
  async healthCheck(): Promise<PdfServiceHealth> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout for health

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`PDF service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract text from a single PDF file
   */
  async extractPdfText(file: File): Promise<PdfExtractionResult> {
    try {
      console.log(`🔧 PDF Service: Extracting text from ${file.name} (${file.size} bytes)`)
      
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Setup request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const startTime = Date.now()
            const response = await fetch(`${this.baseUrl}/extract?include_technical_info=true`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const requestTime = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(`PDF service error (${response.status}): ${errorData.detail || response.statusText}`)
      }

      const result: PdfExtractionResult = await response.json()
      
      console.log(`✅ PDF Service: Extracted ${result.character_count} chars using ${result.method} (${requestTime}ms)`)
      
      return result

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`PDF extraction timeout after ${this.timeout}ms`)
      }
      
      console.error(`❌ PDF Service: Failed to extract text:`, error)
      throw error
    }
  }

  /**
   * Extract text from multiple PDF files
   */
  async extractPdfTextBatch(files: File[]): Promise<{
    processed_files: number
    successful: number
    failed: number
    results: PdfExtractionResult[]
  }> {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${this.baseUrl}/extract-pdf-batch`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Batch extraction failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Batch PDF extraction failed:', error)
      throw error
    }
  }

  /**
   * Test connection to PDF service
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch {
      return false
    }
  }

  async generateReport(
    content: any,
    title: string,
    analysisType: string,
    outputFormat: string
  ): Promise<Response> {
    // 🔍 DEBUG: Verificar serialização antes do envio
    const serializedContent = JSON.stringify(content)
    console.log('🔍 [PdfServiceClient] Serialization debug:', {
      originalType: typeof content,
      originalKeys: content && typeof content === 'object' ? Object.keys(content) : 'not object',
      serializedLength: serializedContent.length,
      serializedPreview: serializedContent.substring(0, 300) + '...'
    })
    
    const formData = new FormData()
    formData.append('content', serializedContent)
    formData.append('title', title)
    formData.append('analysis_type', analysisType)
    formData.append('output_format', outputFormat)

    const response = await fetch(`${this.baseUrl}/generate-report`, {
      method: 'POST',
      body: formData,
    })

    return response
  }
}

// Singleton instance for the application
export const pdfServiceClient = new PdfServiceClient()

// Helper function to validate PDF file
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: `Invalid file type: ${file.type}. Expected application/pdf` }
  }

  if (file.size === 0) {
    return { valid: false, error: 'Empty file' }
  }

  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    return { valid: false, error: 'File too large (max 50MB)' }
  }

  return { valid: true }
}
