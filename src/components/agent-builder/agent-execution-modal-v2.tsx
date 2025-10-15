"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  AgentExecutionForm,
  AgentExecutionFormData,
} from "./agent-execution-form";
import type { Agent, ExecutionResult } from "@/types/agent";
import { Loader, CheckCircle, XCircle, Download as DownloadIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { SmartResultDisplay } from "../ui/smart-result-display";

interface AgentExecutionModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onExecutionComplete: (result: ExecutionResult) => void;
}

export function AgentExecutionModalV2({
  isOpen,
  onClose,
  agent,
  onExecutionComplete,
}: AgentExecutionModalV2Props) {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<
    { status: string; percentage: number; currentStep?: number; estimatedTime?: string } | undefined
  >();
  const { toast } = useToast();

  const handleClose = () => {
    setExecutionResult(null);
    setIsExecuting(false);
    setExecutionProgress(undefined);
    onClose();
  };

  const handleDirectDownload = async (
    result: ExecutionResult,
    agentName: string,
    outputFormat: string
  ) => {
    if (!result.output) {
      toast({
        title: "Erro de Geração",
        description: "O resultado da execução estava vazio.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse do output para extrair metadados
      const parsedOutput = typeof result.output === 'string' ? JSON.parse(result.output) : result.output;
      
      // Extrair o título correto dos metadados, se disponível
      const documentTitle = parsedOutput?.metadata?.titulo_relatorio || agentName;
      const cleanTitle = documentTitle.replace(/\s+/g, "_");

      console.log('📄 [Download] Parsed output:', parsedOutput);
      console.log('📄 [Download] Document title:', documentTitle);

      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: parsedOutput,
          format: outputFormat,
          fileName: cleanTitle, // Usar o título dos metadados
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${cleanTitle}.${outputFormat}`; // Adicionar a extensão apenas para o download no navegador
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorText = await response.text();
        console.error("Falha ao gerar documento:", errorText);
        toast({
          title: "Erro na Geração do Documento",
          description: "Não foi possível gerar o arquivo para download.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no download:", error);
      toast({
        title: "Erro no Download",
        description: "Ocorreu um erro ao tentar baixar o arquivo.",
        variant: "destructive",
      });
    }
  };

  // Armazenar formData para uso posterior no download
  const [formData, setFormData] = useState<AgentExecutionFormData>({});

  const handleExecute = async (submittedFormData: AgentExecutionFormData) => {
    setFormData(submittedFormData); // Armazenar para uso posterior
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionProgress({ status: "Iniciando execução...", percentage: 5, currentStep: 1 });

    try {
      console.log('🚀 [ExecutionModal] Starting execution with formData:', formData);
      
      const executionData = new FormData();
      executionData.append("agent", JSON.stringify(agent));

      let hasFile = false;
      for (const key in submittedFormData) {
        if (Object.prototype.hasOwnProperty.call(submittedFormData, key)) {
          const value = submittedFormData[key];
          
          // Verificar se é um File único
          if (value instanceof File) {
            console.log(`📎 [ExecutionModal] Appending file: ${key} = ${value.name} (${value.size} bytes)`);
            executionData.append("file", value);
            hasFile = true;
          } 
          // Verificar se é um array de Files
          else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
            console.log(`📎 [ExecutionModal] Appending ${value.length} files from array: ${key}`);
            value.forEach((file: File, index: number) => {
              console.log(`  📎 File ${index + 1}: ${file.name} (${file.size} bytes)`);
              executionData.append("file", file);
            });
            hasFile = true;
          } 
          // Outros valores
          else if (value !== null && value !== undefined && !Array.isArray(value)) {
            console.log(`📝 [ExecutionModal] Appending field: ${key} = ${value}`);
            executionData.append(key, String(value));
          }
        }
      }
      
      if (!hasFile) {
        console.warn('⚠️ [ExecutionModal] No file found in formData!');
        console.log('📋 [ExecutionModal] FormData keys:', Object.keys(submittedFormData));
        console.log('📋 [ExecutionModal] FormData values:', submittedFormData);
      }

      setExecutionProgress({
        status: "Analisando documento... Isso pode levar alguns minutos.",
        percentage: 20,
        currentStep: 2,
        estimatedTime: "2-3 minutos"
      });
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        body: executionData,
        signal: AbortSignal.timeout(300000), // 5 minutos de timeout
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `Erro no servidor: ${response.status}` }));
        throw new Error(errorData.error || "Falha na execução do agente");
      }

      setExecutionProgress({
        status: "Processando resultado...",
        percentage: 80,
        currentStep: 3,
        estimatedTime: "30 segundos"
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ||
            "A execução falhou, mas retornou uma resposta de sucesso."
        );
      }

      // Toast diferenciado por método de entrega
      if (submittedFormData.deliveryMethod === "email") {
        toast({
          title: "✅ Relatório Enviado por Email",
          description: `Email enviado para ${submittedFormData.email}. Verifique sua caixa de SPAM se não receber em 2 minutos.`,
          duration: 8000, // 8 segundos para dar tempo de ler
        });
      } else {
        toast({
          title: "Execução Concluída",
          description: "O agente foi executado com sucesso.",
        });
      }
      
      setExecutionResult(result);
      onExecutionComplete(result);

      if (result.success && submittedFormData.deliveryMethod === "download") {
        setExecutionProgress({ status: "Gerando download...", percentage: 95, currentStep: 4 });
        await handleDirectDownload(result, agent.name, submittedFormData.outputFormat);
      }

      setExecutionProgress({ status: "Concluído!", percentage: 100, currentStep: 4 });
      setIsExecuting(false); // ✅ CRÍTICO: Parar estado de execução para mostrar resultado
      // ✅ CORREÇÃO: Não fechar automaticamente - deixar usuário ver resultado
      // setTimeout(handleClose, 2000); // ← Removido fechamento automático
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";
      setExecutionResult({
        success: false,
        error: { message: errorMessage },
        output: null,
        executionId: "",
        executionTime: 0,
        cost: 0,
        tokensUsed: 0,
        logs: [],
      });
      toast({
        title: "Erro na Execução",
        description: errorMessage,
        variant: "destructive",
      });
      setIsExecuting(false);
      setExecutionProgress(undefined); // Limpar progresso em caso de erro
    }
  };

  const renderContent = () => {
    // ✅ ESTADO: Resultado disponível - mostrar resultado com ações
    if (executionResult && !isExecuting) {
      return (
        <div className="space-y-4">
          {executionResult.success ? (
            <>
              {/* Mensagem de Sucesso */}
              <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-400">Execução Concluída com Sucesso!</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    O agente processou sua solicitação. Você pode baixar o resultado ou fechar esta janela.
                  </p>
                </div>
              </div>

              {/* Preview do Resultado com SmartResultDisplay */}
              <div className="max-h-[400px] overflow-y-auto">
                <SmartResultDisplay result={executionResult.output} />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleDirectDownload(executionResult, agent.name, formData.outputFormat || 'pdf')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Baixar Resultado
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fechar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Mensagem de Erro */}
              <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-400">Erro na Execução</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {executionResult.error?.message || 'Ocorreu um erro desconhecido.'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </>
          )}
        </div>
      );
    }

    // ✅ ESTADO: Executando - mostrar progresso melhorado
    if (isExecuting) {
      const currentStep = executionProgress?.currentStep || 1;
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white">
            Executando Agente...
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {executionProgress?.status || "Aguarde um momento."}
          </p>

          {/* Etapas do Processo */}
          <div className="w-full max-w-md mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className={currentStep >= 1 ? 'text-blue-400 font-medium' : ''}>
                {currentStep > 1 ? '✓' : currentStep === 1 ? '⏳' : '○'} Upload
              </span>
              <span className={currentStep >= 2 ? 'text-blue-400 font-medium' : ''}>
                {currentStep > 2 ? '✓' : currentStep === 2 ? '⏳' : '○'} Análise IA
              </span>
              <span className={currentStep >= 3 ? 'text-blue-400 font-medium' : ''}>
                {currentStep > 3 ? '✓' : currentStep === 3 ? '⏳' : '○'} Geração
              </span>
              <span className={currentStep >= 4 ? 'text-blue-400 font-medium' : ''}>
                {currentStep === 4 ? '⏳' : '○'} Finalização
              </span>
            </div>
          </div>

          {/* Barra de Progresso */}
          {executionProgress && (
            <div className="w-full max-w-md">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${executionProgress.percentage}%` }}
                ></div>
              </div>
              {executionProgress.estimatedTime && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Tempo estimado: {executionProgress.estimatedTime}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // ✅ ESTADO: Inicial - mostrar formulário
    return (
      <AgentExecutionForm
        agent={agent}
        onSubmit={handleExecute}
        isExecuting={isExecuting}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-2xl dark:bg-gray-900 dark:text-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl font-bold">Executar Agente</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {agent.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
