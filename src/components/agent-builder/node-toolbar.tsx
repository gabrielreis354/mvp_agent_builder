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
  Sparkles,
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

// Helper function to improve prompts
function improvePrompt(prompt: string): string {
  if (!prompt || prompt.length < 10) {
    return 'Analise o documento e extraia as informações principais de forma estruturada.';
  }
  
  const improvements = [];
  
  // Adicionar contexto se não tiver
  if (!prompt.toLowerCase().includes('analise') && !prompt.toLowerCase().includes('extraia')) {
    improvements.push('Analise cuidadosamente e');
  }
  
  // Adicionar estrutura se não tiver
  if (!prompt.includes(':') && !prompt.includes('-')) {
    improvements.push('extraia de forma estruturada:');
  }
  
  // Adicionar formato de saída
  if (!prompt.toLowerCase().includes('formato') && !prompt.toLowerCase().includes('json')) {
    improvements.push('Forneça o resultado em formato claro e organizado.');
  }
  
  return improvements.length > 0 
    ? `${improvements.join(' ')} ${prompt}` 
    : prompt;
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
                      Instruções para IA
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const improved = improvePrompt(localData.prompt || '');
                          handleInputChange('prompt', improved);
                        }}
                        className="h-7 px-2 text-xs bg-purple-600 hover:bg-purple-700 border-purple-500 text-white"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Melhorar
                      </Button>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-white border-gray-600">
                          <p>Instruções específicas geram melhores resultados.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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

            {/* API Node Configuration - SIMPLIFICADO PARA EMAIL */}
            {((node.data as any)?.nodeType === 'api' || node.type === 'api') && (
              <>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="text-sm text-green-200">
                      <p className="font-medium mb-1">Envio de Email Automático</p>
                      <p className="text-green-300/80">
                        Configure para enviar emails automaticamente com os resultados da análise.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Para quem enviar?
                  </label>
                  <input
                    type="email"
                    value={localData.emailTo || ""}
                    onChange={(e) => {
                      handleInputChange("emailTo", e.target.value);
                      // Configurar automaticamente o endpoint de email
                      handleInputChange("apiEndpoint", "/api/send-email");
                      handleInputChange("apiMethod", "POST");
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                    placeholder="exemplo@empresa.com.br"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Digite o email do destinatário
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assunto do Email
                  </label>
                  <input
                    type="text"
                    value={localData.emailSubject || ""}
                    onChange={(e) =>
                      handleInputChange("emailSubject", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Relatório de Análise de Contrato"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    O que incluir no email?
                  </label>
                  <select
                    value={localData.emailContent || "full_report"}
                    onChange={(e) =>
                      handleInputChange("emailContent", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="full_report">Relatório completo</option>
                    <option value="summary">Apenas resumo</option>
                    <option value="highlights">Apenas pontos importantes</option>
                    <option value="pdf_attachment">Anexar PDF</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Escolha o formato do conteúdo do email
                  </p>
                </div>
              </>
            )}

            {/* Logic Node Configuration - ULTRA SIMPLIFICADO */}
            {((node.data as any)?.nodeType === 'logic' || node.type === 'logic') && (
              <>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-medium mb-2">Como escrever uma condição?</p>
                      <div className="space-y-2 text-xs text-blue-300/90">
                        <p><strong>Exemplos práticos:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Salário maior que 5000</li>
                          <li>Idade menor que 30</li>
                          <li>Nome contém "Silva"</li>
                          <li>Cargo igual a "Gerente"</li>
                          <li>Tem benefícios</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Escreva sua condição
                  </label>
                  <textarea
                    value={localData.conditionDescription || ""}
                    onChange={(e) => {
                      const description = e.target.value;
                      handleInputChange("conditionDescription", description);
                      
                      // Converter descrição em português para código automaticamente
                      let condition = "true";
                      const lower = description.toLowerCase();
                      
                      // Detectar padrões comuns e gerar código
                      if (lower.includes("maior que") || lower.includes(">")) {
                        const match = description.match(/(\d+)/);
                        if (match) {
                          condition = `data.value > ${match[1]}`;
                        }
                      } else if (lower.includes("menor que") || lower.includes("<")) {
                        const match = description.match(/(\d+)/);
                        if (match) {
                          condition = `data.value < ${match[1]}`;
                        }
                      } else if (lower.includes("igual a") || lower.includes("==")) {
                        const match = description.match(/"([^"]+)"/);
                        if (match) {
                          condition = `data.value === "${match[1]}"`;
                        }
                      } else if (lower.includes("contém") || lower.includes("contem")) {
                        const match = description.match(/"([^"]+)"/);
                        if (match) {
                          condition = `data.text && data.text.includes("${match[1]}")`;
                        }
                      } else if (lower.includes("tem ") || lower.includes("possui")) {
                        condition = `data.value !== null && data.value !== undefined && data.value !== ''`;
                      }
                      
                      handleInputChange("condition", condition);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Ex: Salário maior que 5000"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Escreva em português simples. O sistema entenderá automaticamente.
                  </p>
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
