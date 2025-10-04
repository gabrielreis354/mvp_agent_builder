import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-config";
import { hybridRuntimeEngine } from "@/lib/runtime/hybrid-engine";
import { prisma } from "@/lib/database/prisma";

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("📥 [API Execute] Received new agent execution request...");

    // 1. Ler dados como FormData para suportar upload de arquivo de qualquer origem
    const formData = await request.formData();
    const agentString = formData.get("agent") as string;
    const file = formData.get("file") as File | null;

    if (!agentString) {
      console.error(
        "❌ [API Execute] Agent configuration (agent) not found in the request."
      );
      return NextResponse.json(
        {
          error: "Configuração do agente (agent) não encontrada na requisição.",
        },
        { status: 400 }
      );
    }

    let agent = JSON.parse(agentString);

    
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
        const fallbackResponse = await fetch("/api/upload-and-process", {
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
      await prisma.agentExecution.create({
        data: {
          executionId: result.executionId,
          agentId: agent.id,
          userId: authenticatedUserId,
          organizationId: session.user.organizationId,
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
    } catch (dbError) {
      console.error('❌ [API Execute] Failed to save execution to database:', dbError);
      // Não falhar a requisição se o salvamento falhar
    }

    // 7. Retornar o resultado JSON
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

// Exporta a função POST
export async function POST(request: NextRequest) {
  return handlePOST(request);
}

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
