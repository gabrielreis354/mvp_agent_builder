"use client";

import React, { useState } from "react";
import {
  Settings,
  Trash2,
  Brain,
  Sliders,
  Code,
  Globe,
  Save,
  X,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Node } from "reactflow";
import { AIProvider } from "@/types/agent";
import { Button } from "@/components/ui/button";

// Helper function for safe JSON parsing
function safeJsonParse<T = any>(str: string | null | undefined, fallback: T): T {
  if (!str || typeof str !== 'string') return fallback
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

interface NodeToolbarProps {
  node: Node;
  onUpdate: (data: Partial<Node["data"]>) => void;
  onDelete: () => void;
}

const aiProviders: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini (Recomendado)",
        maxTokens: 128000,
        costPer1kTokens: 0.00015,
        capabilities: ["text", "code", "reasoning", "analysis"],
      },
      {
        id: "gpt-4o",
        name: "GPT-4o",
        maxTokens: 128000,
        costPer1kTokens: 0.005,
        capabilities: ["text", "code", "reasoning", "vision"],
      },
      {
        id: "gpt-4",
        name: "GPT-4 (Premium)",
        maxTokens: 128000,
        costPer1kTokens: 0.03,
        capabilities: ["text", "code", "reasoning"],
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        maxTokens: 16385,
        costPer1kTokens: 0.002,
        capabilities: ["text", "code"],
      },
    ],
    isAvailable: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        maxTokens: 200000,
        costPer1kTokens: 0.015,
        capabilities: ["text", "analysis", "reasoning"],
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku (Recomendado)",
        maxTokens: 200000,
        costPer1kTokens: 0.0001,
        capabilities: ["text", "analysis"],
      },
      {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        maxTokens: 200000,
        costPer1kTokens: 0.00025,
        capabilities: ["text", "speed"],
      },
    ],
    isAvailable: true,
  },
  {
    id: "google",
    name: "Google",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        maxTokens: 32768,
        costPer1kTokens: 0.0005,
        capabilities: ["text", "data", "multimodal"],
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        maxTokens: 16384,
        costPer1kTokens: 0.002,
        capabilities: ["text", "vision", "multimodal"],
      },
    ],
    isAvailable: true,
  },
];

export function NodeToolbar({ node, onUpdate, onDelete }: NodeToolbarProps) {
  const [activeTab, setActiveTab] = useState<"config" | "advanced">("config");
  const [localData, setLocalData] = useState(node.data);

  // Atualizar localData quando node.data mudar
  React.useEffect(() => {
    setLocalData(node.data);
  }, [node.data]);

  // Atualizar localData quando node.data mudar
  React.useEffect(() => {
    setLocalData(node.data);
  }, [node.data]);

  const handleSave = () => {
    onUpdate(localData);
  };

  const handleInputChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Efeito para resetar o modelo quando o provedor muda
  React.useEffect(() => {
    const newProvider = aiProviders.find((p) => p.id === localData.provider);
    if (newProvider && newProvider.models.length > 0) {
      const currentModelIsValid = newProvider.models.some(m => m.id === localData.model);
      if (!currentModelIsValid) {
        handleInputChange('model', newProvider.models[0].id);
      }
    }
  }, [localData.provider]);

  const selectedProvider = aiProviders.find((p) => p.id === localData.provider);
  const selectedModel = selectedProvider?.models.find(
    (m) => m.id === localData.model
  );

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Configurar Nó</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-400 capitalize">
          {node.type} • {node.id}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "config"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Configuração
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "advanced"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Sliders className="h-4 w-4 inline mr-2" />
          Avançado
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto flex-grow pb-20">
        {activeTab === "config" && (
          <>
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Nó
              </label>
              <input
                type="text"
                value={localData.label}
                onChange={(e) => handleInputChange("label", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* AI Node Configuration */}
            {((node.data as any)?.nodeType === 'ai' || node.type === 'ai') && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Prompt
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white border-gray-600">
                        <p>Prompts específicos geram melhores resultados.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <textarea
                    value={localData.prompt || ""}
                    onChange={(e) =>
                      handleInputChange("prompt", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Ex: Analise contratos de trabalho e extraia salário, benefícios, cláusulas importantes e riscos jurídicos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Provedor de IA
                  </label>
                  <select
                    value={localData.provider || "openai"}
                    onChange={(e) =>
                      handleInputChange("provider", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                  >
                    {aiProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProvider && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modelo
                    </label>
                    <select
                      value={localData.model || selectedProvider.models[0].id}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                    >
                      {selectedProvider.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>

                    {selectedModel && (
                      <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max Tokens:</span>
                            <span className="text-white">{selectedModel.maxTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Custo por 1k tokens:</span>
                            <span className={`font-medium ${
                              selectedModel.costPer1kTokens <= 0.001 ? 'text-green-400' : 
                              selectedModel.costPer1kTokens <= 0.01 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              ${selectedModel.costPer1kTokens}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Capacidades:</span>
                            <span className="text-blue-400">{selectedModel.capabilities.join(", ")}</span>
                          </div>
                          {selectedModel.name.includes('Recomendado') && (
                            <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-xs">
                              ⭐ Melhor custo-benefício para tarefas RH
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* API Node Configuration */}
            {((node.data as any)?.nodeType === 'api' || node.type === 'api') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={localData.apiEndpoint || ""}
                    onChange={(e) =>
                      handleInputChange("apiEndpoint", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://api.exemplo.com/endpoint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Método HTTP
                  </label>
                  <select
                    value={localData.apiMethod || "POST"}
                    onChange={(e) =>
                      handleInputChange("apiMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </>
            )}

            {/* Logic Node Configuration */}
            {((node.data as any)?.nodeType === 'logic' || node.type === 'logic') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Lógica
                  </label>
                  <select
                    value={localData.logicType || "condition"}
                    onChange={(e) =>
                      handleInputChange("logicType", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="condition">Condição</option>
                    <option value="transform">Transformação</option>
                    <option value="validate">Validação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expressão
                  </label>
                  <textarea
                    value={
                      localData.condition ||
                      localData.transformation ||
                      localData.validation ||
                      ""
                    }
                    onChange={(e) => {
                      const field =
                        localData.logicType === "condition"
                          ? "condition"
                          : localData.logicType === "transform"
                          ? "transformation"
                          : "validation";
                      handleInputChange(field, e.target.value);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                    placeholder="data.confidence > 0.8"
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "advanced" && (
          <>
            {((node.data as any)?.nodeType === 'ai' || node.type === 'ai') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperatura ({localData.temperature || 0.7})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={localData.temperature || 0.7}
                    onChange={(e) =>
                      handleInputChange(
                        "temperature",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Determinístico</span>
                    <span>Criativo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={localData.maxTokens || 1000}
                    onChange={(e) =>
                      handleInputChange("maxTokens", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                    min="1"
                    max={selectedModel?.maxTokens || 4096}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schema de Entrada (JSON)
              </label>
              <textarea
                value={JSON.stringify(localData.inputSchema || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const schema = safeJsonParse(e.target.value, {} as any);
                    handleInputChange("inputSchema", schema);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schema de Saída (JSON)
              </label>
              <textarea
                value={JSON.stringify(localData.outputSchema || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const schema = safeJsonParse(e.target.value, {} as any);
                    handleInputChange("outputSchema", schema);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-xs"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
