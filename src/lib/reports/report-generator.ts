import { generateUniversalPDF } from '@/lib/pdf/universal-formatter'

interface ReportGenerationResult {
  fileBuffer: Buffer
  fileName: string
  mimeType: string
}

class ReportGenerator {
  async generateReport(
    content: any,
    title: string,
    analysisType: string,
    outputFormat: string
  ): Promise<ReportGenerationResult> {
    // 🎯 CORREÇÃO: Validar formato antes de enviar para microserviço
    const supportedFormats = ['pdf', 'docx', 'excel', 'json']
    
    if (!supportedFormats.includes(outputFormat)) {
      console.warn(`⚠️ Unsupported format requested: ${outputFormat}. Falling back to PDF.`)
      outputFormat = 'pdf' // Fallback para PDF se formato não suportado
    }
    
    // 🔍 DEBUG: Verificar o que está sendo enviado para o microserviço
    console.log('🔍 [ReportGenerator] Content being sent to microservice:', {
      type: typeof content,
      keys: content && typeof content === 'object' ? Object.keys(content) : 'not object',
      summaryLength: content?.summary?.length || 0,
      outputFormat: outputFormat,
      contentPreview: JSON.stringify(content).substring(0, 200) + '...'
    })
    
    // 🔧 CORREÇÃO CRÍTICA: Usar função direta em vez de HTTP request interno
    console.log('🔄 [ReportGenerator] Using direct function call instead of HTTP request')
    
    try {
      // SANITIZAÇÃO ULTRA-AGRESSIVA antes de gerar HTML
      const sanitizeForPDF = (obj: any): any => {
        if (typeof obj === 'string') {
          return obj
            // Remover todos os caracteres Unicode problemáticos
            .replace(/[\u{10000}-\u{10FFFF}]/gu, ' ') // Remove emojis e símbolos altos
            .replace(/[\u{2000}-\u{206F}]/gu, ' ')    // Remove espaços especiais
            .replace(/[\u{2700}-\u{27BF}]/gu, ' ')    // Remove símbolos decorativos
            .replace(/[\u{FE00}-\u{FE0F}]/gu, '')     // Remove variação seletores
            .replace(/[\u{E000}-\u{F8FF}]/gu, ' ')    // Remove área uso privado
            // Normalizar e remover acentos
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/gu, '')
            // Manter apenas ASCII básico + alguns especiais seguros
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            // Limpar espaços múltiplos
            .replace(/\s+/g, ' ')
            .trim();
        } else if (Array.isArray(obj)) {
          return obj.map(sanitizeForPDF);
        } else if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeForPDF(value);
          }
          return sanitized;
        }
        return obj;
      };

      console.log('🧹 [ReportGenerator] Ultra-sanitizing content for PDF...')
      const ultraCleanContent = sanitizeForPDF(content);
      
      // Gerar HTML usando o sistema universal
      const universalHTML = generateUniversalPDF(ultraCleanContent)
      console.log('✅ [ReportGenerator] Universal HTML generated, length:', universalHTML.length)
      
      if (outputFormat === 'pdf') {
        // Importar puppeteer dinamicamente para gerar PDF
        const puppeteer = await import('puppeteer')
        
        const browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        
        try {
          const page = await browser.newPage()
          
          // Sanitizar HTML também para garantir
          const sanitizedHTML = universalHTML
            .replace(/[\u{10000}-\u{10FFFF}]/gu, ' ')
            .replace(/[\u{2000}-\u{206F}]/gu, ' ')
            .replace(/[\u{2700}-\u{27BF}]/gu, ' ')
            .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
            .replace(/[\u{E000}-\u{F8FF}]/gu, ' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/gu, '')
            .replace(/[^\x20-\x7E\n\r\t<>="'\/\-]/g, ' ')
            .replace(/\s+/g, ' ');

          // Adicionar meta tag para garantir a codificação correta
          const finalHtml = `<!DOCTYPE html><html><head><meta charset="ISO-8859-1"><title>Report</title></head><body>${sanitizedHTML}</body></html>`;
          console.log('🧹 [ReportGenerator] Final HTML sanitized, length:', finalHtml.length)
          await page.setContent(finalHtml, { waitUntil: 'networkidle0' })
          
          // Gerar PDF com configurações profissionais
          const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
              top: '15mm',
              right: '10mm',
              bottom: '15mm',
              left: '10mm'
            }
          })
          
          console.log('✅ [ReportGenerator] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
          
          return {
            fileBuffer: Buffer.from(pdfBuffer),
            fileName: `${title.replace(/\s+/g, '_')}.pdf`,
            mimeType: 'application/pdf'
          }
          
        } finally {
          await browser.close()
        }
      } else {
        // Para outros formatos, retornar HTML
        return {
          fileBuffer: Buffer.from(universalHTML, 'utf-8'),
          fileName: `${title.replace(/\s+/g, '_')}.html`,
          mimeType: 'text/html'
        }
      }
      
    } catch (error) {
      console.error('❌ [ReportGenerator] Direct generation failed:', error)
      throw new Error(`Failed to generate report: ${(error as Error).message}`)
    }
  }
}

export const reportGenerator = new ReportGenerator()
