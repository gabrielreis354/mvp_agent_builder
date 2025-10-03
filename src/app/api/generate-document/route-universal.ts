import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { generateUniversalPDF } from '@/lib/pdf/universal-formatter'
import { getEmailService } from '@/lib/email/email-service'

// Função para converter HTML profissional em PDF usando Puppeteer
async function convertHTMLToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Configurar página para A4
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Gerar PDF com configurações profissionais
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [UniversalAPI] Starting document generation...')
    const { content, format = 'pdf', email, fileName, download = true } = await request.json()

    console.log('📊 [UniversalAPI] Request details:', {
      contentType: typeof content,
      format,
      hasEmail: !!email,
      hasFileName: !!fileName,
      download
    })

    // USAR SISTEMA UNIVERSAL DE FORMATAÇÃO PARA QUALQUER CONTEÚDO
    console.log('🎨 [UniversalAPI] Generating universal HTML...')
    const universalHTML = generateUniversalPDF(content)
    console.log('✅ [UniversalAPI] Universal HTML generated, length:', universalHTML.length)

    if (format === 'pdf') {
      try {
        console.log('📄 [UniversalAPI] Converting to PDF with Puppeteer...')
        const pdfBuffer = await convertHTMLToPDF(universalHTML)
        console.log('✅ [UniversalAPI] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
        
        if (download) {
          const safeFileName = fileName || 'relatorio-universal.pdf'
          console.log('📥 [UniversalAPI] Sending PDF for download:', safeFileName)
          
          // Convert Node.js Buffer to a standard ArrayBuffer for Blob compatibility
          const arrayBuffer = new Uint8Array(pdfBuffer).buffer;
          return new NextResponse(new Blob([arrayBuffer]), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${safeFileName}"`,
            },
          })
        }
        
        if (email) {
          console.log('📧 [UniversalAPI] Sending PDF via email to:', email)
          const safeFileName = fileName || 'relatorio-universal.pdf'
          const emailService = getEmailService()
          
          const result = await emailService.sendEmail({
            to: email,
            subject: 'Relatório Universal - Gerado Automaticamente',
            text: 'Segue em anexo o relatório gerado automaticamente pelo sistema universal de formatação.',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">📄 Relatório Universal</h2>
                <p>Olá!</p>
                <p>Segue em anexo o <strong>relatório gerado automaticamente</strong> pelo sistema universal de formatação do AutomateAI.</p>
                <p>Este relatório foi processado de forma inteligente e formatado profissionalmente, independente do tipo de conteúdo original.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 0.9em; color: #6b7280;">
                  Sistema Universal AutomateAI<br>
                  Processamento inteligente para qualquer tipo de agente personalizado
                </p>
              </div>
            `,
            attachments: [{
              filename: safeFileName,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }]
          })
          
          console.log('📧 [UniversalAPI] Email result:', result.success ? 'SUCCESS' : 'FAILED')
          
          return NextResponse.json({ 
            success: result.success, 
            message: result.success ? 'Email enviado com sucesso!' : `Erro no envio: ${result.error}`,
            messageId: result.messageId
          })
        }
        
        // Se não é download nem email, retornar info do PDF
        return NextResponse.json({
          success: true,
          message: 'PDF gerado com sucesso pelo sistema universal',
          size: pdfBuffer.length,
          type: 'pdf'
        })
        
      } catch (error) {
        console.error('❌ [UniversalAPI] PDF generation failed:', error)
        
        return NextResponse.json({
          success: false,
          error: 'Erro na geração do PDF: ' + (error as Error).message,
          fallback: 'HTML disponível'
        }, { status: 500 })
      }
    }

    // Para formato HTML ou outros
    if (format === 'html' || !format) {
      console.log('🌐 [UniversalAPI] Returning HTML format')
      
      if (download) {
        const safeFileName = fileName || 'relatorio-universal.html'
        return new NextResponse(universalHTML, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
          },
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        html: universalHTML,
        message: 'HTML gerado com sistema universal de formatação',
        type: 'html'
      })
    }

    // Formato não suportado
    console.log('⚠️ [UniversalAPI] Unsupported format:', format)
    return NextResponse.json({ 
      success: false, 
      error: `Formato '${format}' não suportado. Use 'pdf' ou 'html'.`,
      supportedFormats: ['pdf', 'html']
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ [UniversalAPI] General error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor: ' + (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
