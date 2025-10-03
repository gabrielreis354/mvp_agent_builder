import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';

// Helper to get MIME type and extension from format
function getDocumentDetails(format: 'pdf' | 'docx' | 'excel' | 'html') {
  switch (format) {
    case 'pdf':
      return {
        contentType: 'application/pdf',
        extension: 'pdf',
      };
    case 'docx':
      return {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: 'docx',
      };
    case 'excel':
      return {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
      };
    default:
      return {
        contentType: 'text/html',
        extension: 'html',
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, format = 'pdf', email, fileName, download = true } = await request.json();

    // 1. Validação básica
    if (!content) {
      return NextResponse.json({ success: false, error: 'O conteúdo para gerar o documento não foi fornecido.' }, { status: 400 });
    }

    const microserviceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:8001/generate-report';
    console.log(`🚀 [API Generate] Forwarding request to microservice: ${microserviceUrl}`);

    // O microsserviço espera FormData com 'content' como string JSON
    const formData = new FormData();
    
    // Parse do content se for string
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Extrair metadados fixos
    const metadata = parsedContent?.metadata || {};
    const reportTitle = metadata.titulo_relatorio || fileName || 'relatorio';
    const analysisType = metadata.tipo_analise || 'Análise Geral';
    
    // O conteúdo da análise é dinâmico - a IA pode gerar qualquer estrutura
    const analysisPayload = parsedContent?.analise_payload || parsedContent;
    
    // Tentar extrair campos comuns, mas aceitar qualquer estrutura
    const transformedContent = {
      // Tentar encontrar um resumo em campos comuns
      summary: analysisPayload?.resumo_executivo || 
               analysisPayload?.resumo || 
               analysisPayload?.summary || 
               JSON.stringify(analysisPayload, null, 2), // Fallback: JSON formatado
      
      // Tentar encontrar pontos principais em campos comuns
      key_points: analysisPayload?.pontos_principais || 
                  analysisPayload?.key_points || 
                  [],
      
      // Tentar encontrar recomendações em campos comuns
      recommendations: analysisPayload?.recomendacoes || 
                       analysisPayload?.recommendations || 
                       [],
      
      // Incluir toda a análise para referência
      full_analysis: analysisPayload
    };
    
    formData.append('content', JSON.stringify(transformedContent));
    formData.append('output_format', format);
    formData.append('title', reportTitle);
    formData.append('analysis_type', analysisType);
    
    console.log(`📦 [API Generate] Metadata:`, metadata);
    console.log(`📦 [API Generate] Analysis payload keys:`, Object.keys(analysisPayload));
    console.log(`📦 [API Generate] Report title: ${reportTitle}`);
    console.log(`📦 [API Generate] Analysis type: ${analysisType}`);

    // 2. Chamar o microserviço Python com FormData
    const microserviceResponse = await fetch(microserviceUrl, {
      method: 'POST',
      body: formData, // Enviar como FormData, não JSON
    });

    if (!microserviceResponse.ok) {
      const errorBody = await microserviceResponse.text();
      console.error(`❌ [API Generate] Microservice error: ${microserviceResponse.status}`, errorBody);
      return NextResponse.json(
        { success: false, error: 'O microserviço de geração de documentos falhou.', details: errorBody },
        { status: microserviceResponse.status }
      );
    }

    // 3. Obter o buffer do arquivo e o nome do arquivo do cabeçalho
    const fileBuffer = await microserviceResponse.arrayBuffer();
    const disposition = microserviceResponse.headers.get('content-disposition');
    let safeFileName = 'relatorio.bin'; // Fallback filename
    if (disposition && disposition.includes('attachment')) {
      const filenameMatch = disposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        safeFileName = filenameMatch[1];
      }
    }
    const contentType = microserviceResponse.headers.get('content-type') || 'application/octet-stream';

    console.log(`✅ [API Generate] Received file from microservice. Name: ${safeFileName}, Size: ${fileBuffer.byteLength} bytes.`);

    // 4. Lidar com a entrega (download ou email)
    if (download) {
      console.log(`📥 [API Generate] Sending file for download: ${safeFileName}`);
      const asciiFileName = safeFileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const utf8FileName = encodeURIComponent(safeFileName);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${utf8FileName}`,
        },
      });
    }

    if (email) {
      console.log(`📧 [API Generate] Sending file via email to: ${email}`);
      const emailService = getEmailService();
      const result = await emailService.sendEmail({
        to: email,
        subject: `Seu Relatório: ${safeFileName}`,
        text: 'Segue em anexo o relatório gerado pelo AutomateAI.',
        html: `<p>Segue em anexo o relatório <strong>${safeFileName}</strong> gerado pelo AutomateAI.</p>`,
        attachments: [{
          filename: safeFileName,
          content: Buffer.from(fileBuffer),
          contentType: contentType,
        }],
      });

      return NextResponse.json({ 
        success: result.success, 
        message: result.success ? 'Email enviado com sucesso!' : `Erro no envio: ${result.error}`,
      });
    }

    // Fallback se nenhuma ação for especificada
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFileName}"`,
      },
    });

  } catch (error) {
    console.error('❌ [API Generate] General error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
