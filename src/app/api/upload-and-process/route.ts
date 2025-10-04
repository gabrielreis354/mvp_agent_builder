import { NextRequest, NextResponse } from 'next/server'
import { UnifiedProcessor } from '@/lib/processors/unified-processor';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { withSecurity } from '@/lib/security/security-middleware'

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 Upload and process API called')
    
    const session = await getServerSession({ req: request as any, ...authOptions });
    // Embora a rota possa ser pública, se houver sessão, usaremos os dados dela.
    const userId = session?.user?.id;
    const organizationId = session?.user?.organizationId;

    const formData = await request.formData();
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File
    
    // Suportar tanto upload único quanto múltiplo
    const filesToProcess = files.length > 0 ? files : (singleFile ? [singleFile] : [])
    
    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }
    
    console.log(`📁 Processing ${filesToProcess.length} file(s)`)
    
    const processor = new UnifiedProcessor({
      enableOCR: false, // Desabilitar OCR por enquanto
      fallbackToMock: false, // Não usar mock, queremos dados reais
      timeout: 30000,
      pythonServiceUrl: process.env.PDF_SERVICE_URL || (process.env.NODE_ENV === 'production' ? '/api/pdf-service' : 'http://localhost:8001'),
      healthCheckInterval: 30000 // 30 segundos
    })
    const results: any[] = []
    
    for (const file of filesToProcess) {
      console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`)
      
      try {
        const result = await processor.processFile(file)
        results.push(result)
        
        if (result.success && result.data) {
          console.log(`✅ File processed successfully: ${file.name} (method: ${result.method}, extracted: ${result.data?.extractedText?.length || 0} chars)`);

          // Salvar metadados no banco se houver uma organização
          if (organizationId) {
            await prisma.fileUpload.create({
              data: {
                filename: result.data.originalName, // Corrigido de fileName para originalName
                originalName: result.data.originalName,
                mimeType: result.data.mimeType,
                size: result.data.size,
                path: 'uploads', // Diretório padrão
                status: 'PROCESSED',
                processedAt: new Date(),
                metadata: result.data.metadata as any,
                userId: userId,
                organizationId: organizationId,
              },
            });
            console.log(`💾 File metadata saved for organization: ${organizationId}`);
          }
        } else {
          console.log(`⚠️ File processing failed: ${file.name} - ${result.error}`)
        }
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error)
        
        // Adicionar resultado de erro
        results.push({
          success: false,
          data: null,
          method: 'real',
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Calcular estatísticas
    const successCount = results.filter(r => r.success).length
    const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0)
    
    console.log(`📊 Processing complete: ${successCount}/${results.length} successful`)
    
    // Se houve algum erro, incluir na resposta
    const errors = results.filter(r => !r.success).map(r => r.error).filter(Boolean)
    const firstError = errors.length > 0 ? errors[0] : null
    
    return NextResponse.json({
      success: successCount > 0,
      processedFiles: results.map(result => result.data).filter(Boolean),
      results: results,
      error: firstError, // Incluir o primeiro erro se houver
      statistics: {
        totalFiles: filesToProcess.length,
        successfulFiles: successCount,
        failedFiles: results.length - successCount,
        totalProcessingTime: totalProcessingTime,
        averageProcessingTime: totalProcessingTime / results.length
      }
    })
    
  } catch (error) {
    console.error('Upload and process error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withSecurity(request, handlePOST, {
    requireAuth: false, // Permitir upload sem auth para demo
    rateLimitType: 'upload',
    validateInput: false, // FormData validation is different
    allowedMethods: ['POST'],
  })
}

// Endpoint para verificar status de processamento (futuro)
async function handleGET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID is required' },
      { status: 400 }
    )
  }
  
  // TODO: Implementar busca de status de processamento
  return NextResponse.json({
    fileId,
    status: 'completed',
    message: 'File processing status endpoint - to be implemented'
  })
}

export async function GET(request: NextRequest) {
  return withSecurity(request, handleGET, {
    requireAuth: false,
    rateLimitType: 'api',
    validateInput: false,
    allowedMethods: ['GET'],
  })
}
