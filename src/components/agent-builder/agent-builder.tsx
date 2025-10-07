"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Palette,
  ArrowLeft,
  Save,
  Play,
  Settings,
} from "lucide-react";
import {
  VisualCanvas,
  VisualCanvasWrapper,
} from "@/components/agent-builder/visual-canvas";
import { NodeToolbar } from "@/components/agent-builder/node-toolbar";
import { AgentExecutionModalV2 } from "@/components/agent-builder/agent-execution-modal-v2";
import { NaturalLanguageBuilder } from "@/components/agent-builder/natural-language-builder";
import { TemplateGallery } from "@/components/agent-builder/template-gallery";
import { Button } from "@/components/ui/button";
import type { Agent, AgentNode, AgentEdge } from "@/types/agent";
import { AgentRuntimeEngine } from "@/lib/runtime/engine";

type BuilderMode = "templates" | "visual" | "natural";

interface AgentBuilderProps {
  initialAgent?: Agent;
  onSave?: (agent: Agent) => void;
  onExecute?: (result: any) => void;
}

export function AgentBuilder({
  initialAgent,
  onSave,
  onExecute,
}: AgentBuilderProps) {
  const [mode, setMode] = useState<BuilderMode>("templates");
  const [agent, setAgent] = useState<Partial<Agent>>(
    initialAgent || {
      id: `agent-${Date.now()}`,
      name: "Novo Agente",
      description: "",
      category: "geral",
      nodes: [],
      edges: [],
      tags: [],
      status: "draft",
    }
  );
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    if (initialAgent) {
      setAgent(initialAgent);
    }
  }, [initialAgent]);

  const handleSaveAgent = async (nodes?: AgentNode[], edges?: AgentEdge[]) => {
    const updatedAgent: Agent = {
      id: agent.id || `agent-${Date.now()}`,
      name: agent.name || "Novo Agente",
      description: agent.description || "",
      category: agent.category || "geral",
      nodes: nodes || agent.nodes || [],
      edges: edges || agent.edges || [],
      tags: agent.tags || [],
      author: "Usuário",
      version: "1.0.0",
      status: "published",
    };

    setAgent(updatedAgent);

    if (onSave) {
      onSave(updatedAgent);
    }
  };

  const handleAgentChange = useCallback(
    (nodes: AgentNode[], edges: AgentEdge[]) => {
      setAgent((prev) => ({
        ...prev,
        nodes,
        edges,
      }));
    },
    []
  );

  const getTemplateDisplayName = (templateId: string): string => {
    const names: Record<string, string> = {
      "resume-analysis": "Analisador de Currículos",
      "contract-analysis": "Analisador de Contratos",
      "payroll-analysis": "Analisador de Folha de Pagamento",
      "auto-support": "Suporte Automático",
      "financial-analysis": "Análise Financeira",
    };
    return names[templateId] || "Agente Personalizado";
  };

  const getTemplateCategory = (templateId: string): string => {
    const categories: Record<string, string> = {
      "resume-analysis": "rh",
      "contract-analysis": "juridico",
      "payroll-analysis": "financeiro",
      "auto-support": "suporte",
      "financial-analysis": "financeiro",
    };
    return categories[templateId] || "geral";
  };

  const handleSelectTemplate = (templateId: string) => {
    setMode("visual");
    setAgent((prev) => ({
      ...prev,
      name: getTemplateDisplayName(templateId),
      category: getTemplateCategory(templateId),
      tags: [templateId],
    }));
    setTimeout(() => {
      const event = new CustomEvent("addTemplate", { detail: templateId });
      window.dispatchEvent(event);
    }, 100);
  };

  const handleCreateFromScratch = () => {
    setMode("visual");
  };

  const handleValidateAgent = async () => {
    try {
      const { AgentRuntimeEngine } = await import("@/lib/runtime/engine");
      const engine = new AgentRuntimeEngine();
      const validation = engine.validateAgent(agent as Agent);
      setValidationErrors(validation.errors || []);
      if (validation.isValid) {
        alert("Agente válido!");
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      setValidationErrors(["Erro interno na validação"]);
    }
  };

  const handleExecuteAgent = async (input: any) => {
    if (!agent.nodes || agent.nodes.length === 0) {
      alert("Adicione pelo menos um nó para executar o agente");
      return;
    }
    setIsExecuting(true);
    try {
      const { AgentRuntimeEngine } = await import("@/lib/runtime/engine");
      const engine = new AgentRuntimeEngine();
      const result = await engine.executeAgent(
        agent as Agent,
        input,
        "user-id"
      );
      setExecutionResult(result);
      if (onExecute) {
        onExecute(result);
      }
    } catch (error) {
      console.error("Erro na execução:", error);
      setExecutionResult({
        success: false,
        error: "Erro na execução do agente",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTestAgent = () => {
    console.log("[AgentBuilder] Opening modal with agent:", agent);
    if (!agent.nodes || agent.nodes.length === 0) {
      alert("Adicione pelo menos um nó para testar o agente");
      return;
    }
    setShowExecutionPanel(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold">Agent Builder</h1>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) =>
                    setAgent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="Nome do Agente"
                />
                <input
                  type="text"
                  value={agent.description}
                  onChange={(e) =>
                    setAgent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-gray-400 placeholder-gray-500 block mt-1"
                  placeholder="Descrição do agente"
                />
                <div className="text-sm text-gray-400 mt-1">
                  {agent.nodes?.length || 0} nós • {agent.edges?.length || 0}{" "}
                  conexão{(agent.edges?.length || 0) !== 1 ? "ões" : ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setMode("templates")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "templates"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Templates
                </button>
                <button
                  onClick={() => setMode("visual")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "visual"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Visual
                </button>
                <button
                  onClick={() => setMode("natural")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "natural"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Natural
                </button>
              </div>
              <div className="h-6 w-px bg-gray-600" />
              <Button
                onClick={handleValidateAgent}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
              >
                Validate Agent
              </Button>
              <Button
                onClick={handleTestAgent}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
              <Button
                onClick={() => handleSaveAgent()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-900/50 border-l-4 border-red-500 p-4 m-4">
          <div className="text-red-200">
            <h4 className="font-medium">Validation Errors:</h4>
            <ul className="mt-2 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {executionResult && (
        <div
          className={`border-l-4 p-4 m-4 ${
            executionResult.success
              ? "bg-green-900/50 border-green-500"
              : "bg-red-900/50 border-red-500"
          }`}
        >
          <div
            className={
              executionResult.success ? "text-green-200" : "text-red-200"
            }
          >
            <h4 className="font-medium">
              {executionResult.success
                ? "Execution completed successfully"
                : "Execution failed"}
            </h4>
            {executionResult.output && (
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(executionResult.output, null, 2)}
              </pre>
            )}
            {executionResult.error && (
              <p className="mt-2 text-sm">{executionResult.error}</p>
            )}
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-4rem)]">
        {mode === "templates" ? (
          <TemplateGallery
            onSelectTemplate={handleSelectTemplate}
            onCreateFromScratch={handleCreateFromScratch}
          />
        ) : mode === "visual" ? (
          <VisualCanvasWrapper
            onSave={handleSaveAgent}
            onAgentChange={handleAgentChange}
            initialNodes={agent.nodes}
            initialEdges={agent.edges}
          />
        ) : (
          <NaturalLanguageBuilder
            onAgentGenerated={(generatedAgent) => {
              setAgent(generatedAgent);
              setMode("visual");
            }}
          />
        )}
      </div>

      <AgentExecutionModalV2
        isOpen={showExecutionPanel}
        onClose={() => setShowExecutionPanel(false)}
        agent={agent as Agent}
        onExecutionComplete={(result) => {
          setExecutionResult(result);
          // ✅ CORREÇÃO: NÃO fechar modal - deixar usuário ver resultado e clicar em "Fechar"
          // setShowExecutionPanel(false); // ← Removido
          if (onExecute) onExecute(result);
        }}
      />
    </div>
  );
}
