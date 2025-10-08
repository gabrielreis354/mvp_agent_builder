import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-config";
import { hybridRuntimeEngine } from "@/lib/runtime/hybrid-engine";
import { prisma } from "@/lib/database/prisma";
import { withStandardMiddleware } from "@/lib/errors/api-error-middleware";
import { ValidationError, FileProcessingError } from "@/lib/errors/error-handler";

// Aumentar timeout para 5 minutos (análises longas)
export const maxDuration = 300;

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("📥 [API Execute] Received new agent execution request...");

    // 1. Ler dados como FormData para suportar upload de arquivo de qualquer origem
    const formData = await request.formData();
    const agentString = formData.get("agent") as string;
    const file = formData.get("file") as File | null;

    if (!agentString) {
      throw new ValidationError(
        'agent',
        'Configuração do agente não encontrada na requisição',
        { hasFormData: true }
      )
    }

    let agent;
    try {
      agent = JSON.parse(agentString);
    } catch (parseError) {
      throw new ValidationError(
        'agent',
        'Configuração do agente está em formato inválido (JSON inválido)',
        { agentString: agentString.substring(0, 100) }
      )
    }

    // Validar estrutura básica do agente
    if (!agent.nodes || agent.nodes.length === 0) {
      throw new ValidationError(
        'agent.nodes',
        'Agente deve ter pelo menos um nó configurado',
        { agentId: agent.id, agentName: agent.name }
      )
    }

    
    // 2. Montar o objeto 'input' a partir dos dados do formulário
    const input: any = {
      outputFormat: formData.get("outputFormat") as string,
      deliveryMethod: formData.get("deliveryMethod") as string,
      email: formData.get("email") as string | null,
      department: formData.get("department") as string | null,
      customInstructions: formData.get("customInstructions") as string | null,
      hasFile: !!file,
      fileName: file?.name || null,
      extractedText: null, // Será preenchido se houver arquivo
    };

    console.log(`✅ [API Execute] Executing agent: ${agent.name}`);
    console.log(`📄 [API Execute] File received: ${file ? file.name : "No"}`);
    console.log(`⚙️ [API Execute] Output format: ${input.outputFormat}`);

    // 3. Processar o arquivo, se existir (usando microserviço com fallback)
    if (file) {
      console.log(`🔄 [API Execute] Processing uploaded file: ${file.name} (${file.size} bytes)`);
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      const pdfServiceUrl =
        process.env.NEXT_PUBLIC_PDF_SERVICE_URL || "http://localhost:8001";
      let pdfResult: any = null;

      try {
        console.log(`📡 [API Execute] Calling microservice: ${pdfServiceUrl}/extract`);
        const pdfResponse = await fetch(`${pdfServiceUrl}/extract`, {
          method: "POST",
          body: fileFormData,
          signal: AbortSignal.timeout(15000),
        });
        
        console.log(`📡 [API Execute] Microservice response status: ${pdfResponse.status}`);
        
        if (pdfResponse.ok) {
          pdfResult = await pdfResponse.json();
          console.log(`📄 [API Execute] Extraction result keys:`, Object.keys(pdfResult));
          console.log(`📄 [API Execute] Success:`, pdfResult.success);
          
          // O microsserviço retorna 'content' quando include_technical_info=false (padrão)
          // ou 'text' quando include_technical_info=true
          input.extractedText = pdfResult.content || pdfResult.text || '';
          
          if (!input.extractedText) {
            console.error(`❌ [API Execute] No text found in extraction result:`, pdfResult);
            throw new Error('Extraction returned empty text');
          }
          
          console.log(
            `✅ [API Execute] Text extracted via Python microservice: ${input.extractedText.length} characters`
          );
        } else {
          const errorText = await pdfResponse.text();
          console.error(`❌ [API Execute] Microservice error response:`, errorText);
          throw new Error(
            `Microservice failed with status: ${pdfResponse.status}`
          );
        }
      } catch (error) {
        console.warn(
          "⚠️ [API Execute] Python microservice failed, using internal fallback:",
          error
        );
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
        const fallbackResponse = await fetch(`${baseUrl}/api/upload-and-process`, {
          method: "POST",
          body: fileFormData,
        });
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          console.log(`📄 [API Execute] Fallback result:`, fallbackResult);
          if (
            fallbackResult.success &&
            fallbackResult.processedFiles?.length > 0
          ) {
            input.extractedText =
              fallbackResult.processedFiles[0].extractedText;
            console.log(
              `✅ [API Execute] Text extracted via internal fallback: ${input.extractedText?.length || 0} characters`
            );
          } else {
            throw new Error(
              "File processing failed in both microservice and fallback."
            );
          }
        } else {
          throw new Error("Internal fallback for file processing failed.");
        }
      }
    }

    // 4. 🎯 VALIDAÇÃO CRÍTICA: Se arquivo foi enviado, texto DEVE ter sido extraído
    if (input.hasFile && input.fileName) {
      if (!input.extractedText) {
        console.error("❌ [API Execute] CRITICAL: File was uploaded but no text was extracted!");
        console.error("❌ File details:", { fileName: input.fileName, hasFile: input.hasFile });
        return NextResponse.json({
          success: false,
          error: "Falha na extração do texto do arquivo",
          details: `O arquivo '${input.fileName}' foi enviado, mas não foi possível extrair o texto. Verifique se é um PDF válido ou tente novamente.`,
        }, { status: 422 });
      }
      
      console.log("✅ [API Execute] File text extraction validated successfully");
      console.log(`📄 Text extracted: ${input.extractedText.length} characters from '${input.fileName}'`);
    }

    // 5. Executar o agente com o Hybrid Engine
    const session = await getServerSession({ req: request as any, ...authOptions });
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 });
    }

    const authenticatedUserId = session.user.id;
    // 🎯 CORREÇÃO: Passar o texto extraído e o nome do arquivo nas opções do Hybrid Engine.
    const executionOptions = {
      extractedText: input.extractedText,
      fileName: input.fileName,
      organizationId: session.user.organizationId, // Multi-tenancy
    };

    const result = await hybridRuntimeEngine.executeAgentHybrid(
      agent,
      input,
      authenticatedUserId,
      executionOptions
    );

    if (!result.success) {
      throw new Error(result.error || "Hybrid engine execution failed.");
    }

    // 6. 💾 SALVAR EXECUÇÃO NO BANCO DE DADOS
    try {
      // Validar se agente existe no banco antes de salvar execução
      let validAgentId: string | null = null;
      
      if (agent.id) {
        const existingAgent = await prisma.agent.findUnique({
          where: { id: agent.id }
        });
        
        if (existingAgent) {
          validAgentId = agent.id;
        } else {
          console.warn(`⚠️ [API Execute] Agent ID ${agent.id} not found in database, skipping database save`);
        }
      }

      // Só salvar no banco se o agente existir
      if (validAgentId) {
        await prisma.agentExecution.create({
          data: {
            executionId: result.executionId,
            agent: {
              connect: { id: validAgentId }
            },
            user: {
              connect: { id: authenticatedUserId }
            },
            organization: {
              connect: { id: session.user.organizationId }
            },
            status: result.success ? 'COMPLETED' : 'FAILED',
            inputData: input as any,
            outputData: result.output as any,
            errorMessage: result.error || null,
            executionTime: result.executionTime,
            tokensUsed: 0, // TODO: Calcular tokens reais
            cost: 0.0, // TODO: Calcular custo real
            completedAt: new Date(),
            metadata: {
              nodeResults: result.nodeResults,
            } as any,
            logs: [],
          },
        });
        
        console.log(`💾 [API Execute] Execution saved to database: ${result.executionId}`);
      } else {
        console.log(`⚠️ [API Execute] Skipping database save - agent not found in database`);
      }
    } catch (dbError) {
      console.error('❌ [API Execute] Failed to save execution to database:', dbError);
      // Não falhar a requisição se o salvamento falhar
    }

    // 7. ✅ ENVIAR EMAIL SE SOLICITADO (COM ANEXO)
    if (input.deliveryMethod === 'email' && input.email) {
      console.log(`📧 [API Execute] Sending result via email to: ${input.email}`);
      
      try {
        // Gerar documento para anexar
        const docFormat = input.outputFormat || 'docx';
        console.log(`📄 [API Execute] Generating ${docFormat} document for email attachment`);
        
        const generateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/generate-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: result.output,
            format: docFormat,
            fileName: agent.name.replace(/\s+/g, '_')
          })
        });

        let attachment = null;
        if (generateResponse.ok) {
          const docBlob = await generateResponse.arrayBuffer();
          attachment = {
            filename: `${agent.name.replace(/\s+/g, '_')}.${docFormat}`,
            content: Buffer.from(docBlob),
            contentType: docFormat === 'pdf' ? 'application/pdf' : 
                        docFormat === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
          console.log(`✅ [API Execute] Document generated for attachment: ${attachment.filename}`);
        } else {
          console.warn(`⚠️ [API Execute] Failed to generate document for attachment`);
        }

        // Enviar email com anexo
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/send-report-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: input.email,
            subject: `Resultado: ${agent.name}`,
            agentName: agent.name,
            report: result.output,
            format: 'html',
            attachment: attachment
          })
        });

        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log(`✅ [API Execute] Email sent successfully to ${input.email} with attachment`);
        } else {
          console.error(`❌ [API Execute] Failed to send email:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`❌ [API Execute] Error sending email:`, emailError);
        // Não falhar a execução se o email falhar
      }
    }

    // 8. Retornar o resultado JSON
    console.log(
      "✅ [API Execute] Execution successful. Returning JSON result."
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [API Execute] Critical error in handlePOST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Exporta a função POST com middleware de erro
export const POST = withStandardMiddleware(handlePOST);

async function handleGET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const executionId = searchParams.get('executionId')
  if (!executionId) {
    return NextResponse.json(
      { error: 'Execution ID is required' },
      { status: 400 }
    )
  }

  // Get user ID from headers (set by security middleware)
  const session = await getServerSession({ req: request as any, ...authOptions });
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: 'Não autorizado ou organização não encontrada' }, { status: 401 });
  }

  const userId = session.user.id;
  
  try {
    // TODO: Implementar busca de execução por ID
    const execution = await prisma.agentExecution.findFirst({
      where: {
        executionId,
        organizationId: session.user.organizationId,
      },
    });
    
    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this execution
    // @ts-ignore
    if (userId && execution.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      executionId: execution.executionId,
      status: execution.status,
      agentId: execution.agentId,
      inputData: execution.inputData,
      outputData: execution.outputData,
      errorMessage: execution.errorMessage,
      executionTime: execution.executionTime,
      createdAt: execution.createdAt,
      completedAt: execution.completedAt,
    });
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGET(request);
}
