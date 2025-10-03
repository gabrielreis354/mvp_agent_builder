/**
 * PDF Extractor - Extração real de texto de PDFs
 * Versão limpa e funcional sem dependências problemáticas
 */

export interface ExtractedResult {
  success: boolean
  text: string
  method: string
  pageCount: number
  confidence: number
  error?: string
}

export class PDFExtractor {
  /**
   * Extrai texto de um PDF usando métodos nativos do JavaScript
   * Não depende de bibliotecas externas problemáticas
   */
  async extract(file: File): Promise<ExtractedResult> {
    console.log(`🔍 Starting PDF extraction for: ${file.name}`)
    
    try {
      // Converter arquivo para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Verificar se é realmente um PDF
      const header = new TextDecoder('utf-8').decode(uint8Array.slice(0, 5))
      if (header !== '%PDF-') {
        throw new Error('Not a valid PDF file')
      }
      
      console.log(`📄 Valid PDF detected, size: ${file.size} bytes`)
      
      // Método 1: Extração direta de texto do PDF
      const extractedText = this.extractTextDirect(uint8Array)
      
      if (extractedText.length > 50) {
        console.log(`✅ Successfully extracted ${extractedText.length} characters`)
        return {
          success: true,
          text: extractedText,
          method: 'direct-extraction',
          pageCount: this.countPages(uint8Array),
          confidence: 0.95
        }
      }
      
      // Método 2: Extração alternativa para PDFs com encoding diferente
      const alternativeText = this.extractTextAlternative(uint8Array)
      
      if (alternativeText.length > 50) {
        console.log(`✅ Alternative extraction: ${alternativeText.length} characters`)
        return {
          success: true,
          text: alternativeText,
          method: 'alternative-extraction',
          pageCount: this.countPages(uint8Array),
          confidence: 0.85
        }
      }
      
      // Se não conseguiu extrair texto suficiente
      throw new Error('Could not extract sufficient text from PDF')
      
    } catch (error) {
      console.error('❌ PDF extraction failed:', error)
      return {
        success: false,
        text: '',
        method: 'failed',
        pageCount: 0,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Método direto de extração de texto
   */
  private extractTextDirect(uint8Array: Uint8Array): string {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const pdfString = decoder.decode(uint8Array)
    
    let extractedText = ''
    
    // Procurar por blocos de texto entre BT e ET
    const textBlocks = pdfString.match(/BT\s*([\s\S]*?)\s*ET/g) || []
    
    for (const block of textBlocks) {
      // Limpar marcadores
      const cleanBlock = block
        .replace(/BT\s*/, '')
        .replace(/\s*ET/, '')
      
      // Extrair texto entre parênteses com Tj
      const tjMatches = cleanBlock.match(/\((.*?)\)\s*Tj/g) || []
      for (const match of tjMatches) {
        const text = match
          .replace(/\)\s*Tj/, '')
          .replace(/^\(/, '')
          .replace(/\\(\d{3})/g, (m, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\/g, '')
        
        if (text.length > 0 && this.isReadableText(text)) {
          extractedText += text + ' '
        }
      }
      
      // Também procurar por arrays TJ (texto em arrays)
      const tjArrayMatches = cleanBlock.match(/\[(.*?)\]\s*TJ/g) || []
      for (const match of tjArrayMatches) {
        const arrayContent = match
          .replace(/\]\s*TJ/, '')
          .replace(/^\[/, '')
        
        // Extrair strings do array
        const stringMatches = arrayContent.match(/\((.*?)\)/g) || []
        for (const str of stringMatches) {
          const text = str.slice(1, -1)
          if (text.length > 0 && this.isReadableText(text)) {
            extractedText += text + ' '
          }
        }
      }
    }
    
    return this.cleanText(extractedText)
  }
  
  /**
   * Método alternativo de extração
   */
  private extractTextAlternative(uint8Array: Uint8Array): string {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const pdfString = decoder.decode(uint8Array)
    
    let extractedText = ''
    
    // Procurar por qualquer texto entre parênteses
    const matches = pdfString.match(/\(([^)]+)\)/g) || []
    
    for (const match of matches) {
      const text = match.slice(1, -1)
      
      // Filtrar apenas texto legível
      if (this.isReadableText(text) && text.length > 2) {
        // Decodificar caracteres especiais
        const decoded = text
          .replace(/\\(\d{3})/g, (m, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\/g, '')
        
        extractedText += decoded + ' '
      }
    }
    
    return this.cleanText(extractedText)
  }
  
  /**
   * Verifica se o texto é legível
   */
  private isReadableText(text: string): boolean {
    // Deve conter pelo menos algumas letras ou números
    const hasAlphanumeric = /[A-Za-zÀ-ÿ0-9]/.test(text)
    
    // Não deve ser principalmente caracteres de controle
    const controlChars = (text.match(/[\x00-\x1F\x7F]/g) || []).length
    const ratio = controlChars / text.length
    
    return hasAlphanumeric && ratio < 0.3
  }
  
  /**
   * Limpa e formata o texto extraído
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')                    // Normalizar espaços
      .replace(/\s+([.,;:!?])/g, '$1')        // Remover espaços antes de pontuação
      .replace(/([.,;:!?])\s*([.,;:!?])/g, '$1$2')  // Remover espaços entre pontuações
      .replace(/[^\w\sÀ-ÿ.,;:!?()@#$%&*+=\-\/'"]/g, ' ')  // Remover caracteres estranhos
      .trim()
  }
  
  /**
   * Conta o número de páginas no PDF
   */
  private countPages(uint8Array: Uint8Array): number {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const pdfString = decoder.decode(uint8Array)
    
    // Procurar por objetos de página
    const pageMatches = pdfString.match(/\/Type\s*\/Page(?!\w)/g) || []
    
    // Se não encontrar, tentar contar por outro método
    if (pageMatches.length === 0) {
      const countMatch = pdfString.match(/\/Count\s+(\d+)/g)
      if (countMatch && countMatch.length > 0) {
        const numbers = countMatch.map(m => parseInt(m.replace(/\/Count\s+/, '')))
        return Math.max(...numbers)
      }
    }
    
    return Math.max(pageMatches.length, 1)
  }
}
