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
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";

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
    { status: string; percentage: number } | undefined
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

  const handleExecute = async (formData: AgentExecutionFormData) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionProgress({ status: "Iniciando execução...", percentage: 5 });

    try {
      console.log('🚀 [ExecutionModal] Starting execution with formData:', formData);
      
      const executionData = new FormData();
      executionData.append("agent", JSON.stringify(agent));

      let hasFile = false;
      for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
          const value = formData[key];
          if (value instanceof File) {
            console.log(`📎 [ExecutionModal] Appending file: ${key} = ${value.name} (${value.size} bytes)`);
            executionData.append("file", value); // ⚠️ IMPORTANTE: A API espera 'file', não o nome do campo
            hasFile = true;
          } else if (value !== null && value !== undefined) {
            console.log(`📝 [ExecutionModal] Appending field: ${key} = ${value}`);
            executionData.append(key, String(value));
          }
        }
      }
      
      if (!hasFile) {
        console.warn('⚠️ [ExecutionModal] No file found in formData!');
      }

      setExecutionProgress({
        status: "Analisando documento... Isso pode levar alguns minutos.",
        percentage: 20,
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
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ||
            "A execução falhou, mas retornou uma resposta de sucesso."
        );
      }

      toast({
        title: "Execução Concluída",
        description: "O agente foi executado com sucesso.",
      });
      setExecutionResult(result);
      onExecutionComplete(result);

      if (result.success && formData.deliveryMethod === "download") {
        setExecutionProgress({ status: "Gerando download...", percentage: 95 });
        await handleDirectDownload(result, agent.name, formData.outputFormat);
      }

      setExecutionProgress({ status: "Concluído!", percentage: 100 });
      setTimeout(handleClose, 2000);
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
    if (isExecuting) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white">
            Executando Agente...
          </h3>
          <p className="text-sm text-gray-400">
            {executionProgress?.status || "Aguarde um momento."}
          </p>
          {executionProgress && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${executionProgress.percentage}%` }}
              ></div>
            </div>
          )}
        </div>
      );
    }

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
