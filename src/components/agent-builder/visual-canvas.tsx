"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

// Using React Flow node/edge types in the builder canvas
import { NodeToolbar } from "./node-toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NodePalette } from "./node-palette";
import { FriendlyNodePalette } from "./friendly-node-palette";
import { CustomNode } from "./custom-node";
import { AgentNode, AgentEdge } from "@/types/agent";
import { friendlyNodeTemplates, advancedNodeTemplates } from "@/lib/friendly-nodes";

const nodeTypes = {
  customNode: CustomNode,
};

/**
 * ✅ SOLUÇÃO: Busca dados padrão do template baseado no tipo de nó
 * Isso garante que nós arrastados do sidebar venham com prompts e configurações prontas
 */
function getDefaultNodeData(nodeType: string): any {
  // Combinar todos os templates disponíveis
  const allTemplates = [...friendlyNodeTemplates, ...advancedNodeTemplates];
  
  // Buscar template que corresponde ao tipo
  const template = allTemplates.find(t => t.type === nodeType);
  
  // Se encontrou template com defaultData, usar
  if (template?.defaultData) {
    return {
      ...template.defaultData,
      // Garantir que nodeType está sempre presente
      nodeType: nodeType as 'input' | 'ai' | 'output' | 'logic' | 'api',
    };
  }
  
  // Fallback: dados básicos por tipo (caso não encontre template)
  const fallbackData: Record<string, any> = {
    input: {
      label: '📥 Entrada',
      nodeType: 'input',
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'string', title: 'Dados', description: 'Insira os dados aqui' }
        }
      }
    },
    ai: {
      label: '🤖 Analisar com IA',
      nodeType: 'ai',
      prompt: 'Analise os dados fornecidos e extraia as informações principais de forma estruturada.',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      temperature: 0.3,
      maxTokens: 2000
    },
    logic: {
      label: '🔀 Decisão',
      nodeType: 'logic',
      logicType: 'condition',
      condition: 'data.value > 0',
      conditionDescription: 'Valor maior que zero'
    },
    api: {
      label: '📧 Enviar',
      nodeType: 'api',
      apiEndpoint: '/api/send-email',
      apiMethod: 'POST'
    },
    output: {
      label: '📄 Resultado',
      nodeType: 'output',
      outputSchema: {
        type: 'object',
        properties: {
          result: { type: 'string', title: 'Resultado' }
        }
      }
    }
  };
  
  return fallbackData[nodeType] || {
    label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
    nodeType: nodeType as 'input' | 'ai' | 'output' | 'logic' | 'api',
  };
}

interface VisualCanvasProps {
  onSave: (nodes: AgentNode[], edges: AgentEdge[]) => void
  onAgentChange?: (nodes: AgentNode[], edges: AgentEdge[]) => void
  initialNodes?: AgentNode[]
  initialEdges?: AgentEdge[]
  useFriendlyMode?: boolean
}

export function VisualCanvas({ onSave, onAgentChange, initialNodes = [], initialEdges = [], useFriendlyMode = true }: VisualCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null)
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });

  // Update nodes and edges when initialNodes/initialEdges change
  useEffect(() => {
    if (initialNodes.length > 0 || initialEdges.length > 0) {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // Notify parent component when nodes or edges change
  useEffect(() => {
    if (onAgentChange && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(() => {
        onAgentChange(nodes as AgentNode[], edges as AgentEdge[])
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [nodes.length, edges.length, onAgentChange])

  // Template handlers
  const addTemplate = useCallback(
    (templateType: string) => {
      const templates = {
        "resume-analysis": {
          nodes: [
            {
              id: "input-1",
              type: "customNode",
              position: { x: 100, y: 100 },
              data: { 
                label: "Upload Currículo", 
                nodeType: "input",
                inputSchema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary", description: "Arquivo PDF do currículo" }
                  },
                  required: ["file"]
                }
              },
            },
            {
              id: "ai-1",
              type: "customNode",
              position: { x: 400, y: 100 },
              data: { 
                label: "Análise de Currículo", 
                nodeType: "ai",
                prompt: `Analise cuidadosamente o currículo fornecido e forneça uma avaliação completa e detalhada para processo de triagem de candidatos.

IDENTIFIQUE E AVALIE:
- Dados pessoais e informações de contato
- Experiência profissional e relevância para a vaga
- Formação acadêmica e certificações
- Competências técnicas e comportamentais
- Pontos fortes e áreas de atenção
- Adequação ao perfil da vaga

ESTRUTURE SUA ANÁLISE COM:
- Resumo executivo do candidato
- Dados principais extraídos
- Avaliação da experiência profissional
- Análise da formação acadêmica
- Pontos fortes identificados
- Pontos de atenção ou desenvolvimento
- Recomendações para entrevista
- Pontuação geral e adequação à vaga

Seja objetivo, imparcial e baseie-se apenas nas informações presentes no documento.`,
                provider: "openai",
                model: "gpt-4o-mini",
                temperature: 0.3,
                maxTokens: 2000
              },
            },
            {
              id: "output-1",
              type: "customNode",
              position: { x: 700, y: 100 },
              data: { 
                label: "Relatório de Triagem", 
                nodeType: "output",
                outputFormat: "structured",
                reportTemplate: "resume-analysis"
              },
            }
          ],
          edges: [
            { id: "e1-2", source: "input-1", target: "ai-1" },
            { id: "e2-3", source: "ai-1", target: "output-1" }
          ],
        },
        "contract-analysis": {
          nodes: [
            {
              id: "input-1",
              type: "customNode",
              position: { x: 100, y: 100 },
              data: { 
                label: "Upload Contrato", 
                nodeType: "input",
                inputSchema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary", description: "Arquivo PDF do contrato" }
                  },
                  required: ["file"]
                }
              },
            },
            {
              id: "ai-1",
              type: "customNode",
              position: { x: 400, y: 100 },
              data: {
                label: "Análise de Contrato",
                nodeType: "ai",
                provider: "openai",
                model: "gpt-4o-mini",
                temperature: 0.2,
                maxTokens: 2500,
                prompt: `Analise cuidadosamente o contrato de trabalho fornecido e forneça uma análise jurídica completa e detalhada em formato de relatório profissional.

FOQUE EM:
- Identificação das partes (empregador e empregado)
- Dados contratuais principais (salário, cargo, jornada)
- Conformidade com a CLT e legislação trabalhista
- Cláusulas importantes e potenciais riscos
- Recomendações jurídicas

ESTRUTURE SUA ANÁLISE COM:
- Resumo executivo da análise
- Dados principais extraídos
- Pontos importantes identificados
- Riscos ou problemas detectados
- Recomendações jurídicas
- Avaliação de conformidade
- Conclusão final

Seja preciso, detalhado e baseie-se apenas nas informações reais do documento.`,
              },
            },
            {
              id: "output-1",
              type: "customNode",
              position: { x: 700, y: 100 },
              data: { 
                label: "Relatório Jurídico", 
                nodeType: "output",
                outputFormat: "structured",
                reportTemplate: "contract-analysis"
              },
            },
          ],
          edges: [
            { id: "e1-2", source: "input-1", target: "ai-1" },
            { id: "e2-3", source: "ai-1", target: "output-1" },
          ],
        },
        "payroll-analysis": {
          nodes: [
            {
              id: "input-1",
              type: "customNode",
              position: { x: 100, y: 100 },
              data: { 
                label: "Upload Folha", 
                nodeType: "input",
                inputSchema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary", description: "Planilha Excel ou CSV da folha de pagamento" }
                  },
                  required: ["file"]
                }
              },
            },
            {
              id: "ai-1",
              type: "customNode",
              position: { x: 400, y: 100 },
              data: {
                label: "Análise Financeira",
                nodeType: "ai",
                provider: "openai",
                model: "gpt-4o-mini",
                temperature: 0.1,
                maxTokens: 3000,
                prompt: `Analise a folha de pagamento fornecida e gere um relatório estruturado em formato DOCX-friendly:

# RELATÓRIO DE ANÁLISE DE FOLHA DE PAGAMENTO

**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Período de Análise:** [PERIODO_ANALISE]  
**Tipo:** Auditoria Financeira Automatizada

---

## MÉTRICAS PRINCIPAIS

| **Indicador** | **Valor** |
|---------------|-----------|
| **Custo Total da Folha** | **[CUSTO_TOTAL]** |
| **Custo Médio por Funcionário** | [CUSTO_MEDIO] |
| **Percentual de Encargos Sociais** | [PERCENTUAL_ENCARGOS]% |
| **Total de Funcionários** | [TOTAL_FUNCIONARIOS] |
| **Maior Salário Individual** | [MAIOR_SALARIO] |
| **Menor Salário Individual** | [MENOR_SALARIO] |

---

## GASTOS SUSPEITOS IDENTIFICADOS

### ALERTAS CRÍTICOS (Ação Imediata Necessária)
[LISTE GASTOS QUE REQUEREM INVESTIGAÇÃO IMEDIATA]

### ALERTAS MODERADOS (Monitoramento Necessário)
[LISTE GASTOS QUE MERECEM ATENÇÃO MAS NÃO SÃO CRÍTICOS]

### PONTOS DE ATENÇÃO (Para Acompanhamento)
[LISTE PONTOS QUE DEVEM SER MONITORADOS]

---

## CATEGORIZAÇÃO DETALHADA DE DESPESAS

### DESPESAS FIXAS
- **Salários Base:** [SALARIOS_BASE]
- **FGTS (8%):** [FGTS_VALOR]
- **INSS Patronal:** [INSS_PATRONAL]
- **Planos de Saúde:** [PLANOS_SAUDE]
- **Planos Odontológicos:** [PLANOS_ODONTO]
- **Seguro de Vida:** [SEGURO_VIDA]
- **Outros Benefícios Fixos:** [OUTROS_BENEFICIOS_FIXOS]

**SUBTOTAL DESPESAS FIXAS:** **[SUBTOTAL_FIXAS]**

### DESPESAS VARIÁVEIS
- **Horas Extras (50%):** [HORAS_EXTRAS_50]
- **Horas Extras (100%):** [HORAS_EXTRAS_100]
- **Adicional Noturno:** [ADICIONAL_NOTURNO]
- **Comissões:** [COMISSOES]
- **Bônus e Gratificações:** [BONUS]
- **Vale Transporte:** [VALE_TRANSPORTE]
- **Vale Refeição/Alimentação:** [VALE_REFEICAO]
- **Outros Variáveis:** [OUTROS_VARIAVEIS]

**SUBTOTAL DESPESAS VARIÁVEIS:** **[SUBTOTAL_VARIAVEIS]**

---

## PADRÕES ANÔMALOS DETECTADOS

### ANÁLISE POR DEPARTAMENTO
[LISTE DEPARTAMENTOS COM GASTOS DESPROPORCIONAIS]

### ANÁLISE POR CARGO
[LISTE CARGOS COM DISPARIDADES SALARIAIS]

### ANÁLISE TEMPORAL
[IDENTIFIQUE VARIAÇÕES ATÍPICAS NO PERÍODO]

### FUNCIONÁRIOS COM MÚLTIPLOS PAGAMENTOS
[LISTE CASOS DE PAGAMENTOS DUPLICADOS OU SUSPEITOS]

---

## OPORTUNIDADES DE ECONOMIA

**ECONOMIA POTENCIAL ESTIMADA:** **[ECONOMIA_ESTIMADA]**

### OPORTUNIDADES IMEDIATAS
[LISTE AÇÕES QUE PODEM GERAR ECONOMIA IMEDIATA]

### OPORTUNIDADES DE MÉDIO PRAZO
[LISTE MELHORIAS QUE PODEM SER IMPLEMENTADAS]

### OTIMIZAÇÃO DE BENEFÍCIOS
[SUGIRA MELHORIAS NA ESTRUTURA DE BENEFÍCIOS]

---

## RECOMENDAÇÕES PRIORITÁRIAS

### AÇÕES IMEDIATAS (0-30 dias)
1. [PRIMEIRA AÇÃO PRIORITÁRIA]
2. [SEGUNDA AÇÃO PRIORITÁRIA]
3. [TERCEIRA AÇÃO PRIORITÁRIA]

### AÇÕES DE MÉDIO PRAZO (30-90 dias)
1. [PRIMEIRA AÇÃO MÉDIO PRAZO]
2. [SEGUNDA AÇÃO MÉDIO PRAZO]

### AÇÕES DE LONGO PRAZO (90+ dias)
1. [PRIMEIRA AÇÃO LONGO PRAZO]
2. [SEGUNDA AÇÃO LONGO PRAZO]

---

## INDICADORES DE CONTROLE SUGERIDOS

- **Taxa de Rotatividade Financeira:** [CALCULAR IMPACTO FINANCEIRO DO TURNOVER]
- **Custo por Hora Trabalhada:** [CUSTO_HORA]
- **Percentual de Horas Extras:** [PERCENTUAL_HE]
- **Eficiência de Benefícios:** [RELAÇÃO BENEFÍCIOS/SALÁRIO]

---

## ALERTAS DE COMPLIANCE

[LISTE POSSÍVEIS PROBLEMAS DE CONFORMIDADE TRABALHISTA]

---

*Relatório gerado automaticamente pelo AutomateAI - Sistema de Análise Financeira*  
*Recomenda-se validação com contador ou consultor trabalhista*

Substitua todos os placeholders [...] com os dados reais extraídos da folha de pagamento. Use formatação clara e profissional adequada para documento Word.`,
              },
            },
            {
              id: "output-1",
              type: "customNode",
              position: { x: 700, y: 100 },
              data: { 
                label: "Relatório Financeiro", 
                nodeType: "output",
                outputFormat: "structured",
                reportTemplate: "payroll-analysis"
              },
            }
          ],
          edges: [
            { id: "e1-2", source: "input-1", target: "ai-1" },
            { id: "e2-3", source: "ai-1", target: "output-1" }
          ],
        },
        "auto-support": {
          nodes: [
            {
              id: "input-1",
              type: "customNode",
              position: { x: 100, y: 100 },
              data: { label: "Ticket Email", nodeType: "input" },
            },
            {
              id: "ai-1",
              type: "customNode",
              position: { x: 300, y: 100 },
              data: {
                label: "Classificação IA",
                nodeType: "ai",
                provider: "openai",
                model: "gpt-4",
                prompt:
                  "Classifique este ticket por: urgência (baixa/média/alta), categoria (técnico/comercial/financeiro), sentimento (positivo/neutro/negativo)",
              },
            },
            {
              id: "logic-1",
              type: "customNode",
              position: { x: 500, y: 100 },
              data: { label: "Roteamento", nodeType: "logic" },
            },
            {
              id: "api-1",
              type: "customNode",
              position: { x: 700, y: 100 },
              data: { label: "Sistema CRM", nodeType: "api" },
            },
          ],
          edges: [
            { id: "e1-2", source: "input-1", target: "ai-1" },
            { id: "e2-3", source: "ai-1", target: "logic-1" },
            { id: "e3-4", source: "logic-1", target: "api-1" },
          ],
        },
        "financial-analysis": {
          nodes: [
            {
              id: "input-1",
              type: "customNode",
              position: { x: 100, y: 100 },
              data: { label: "Planilha Despesas", nodeType: "input" },
            },
            {
              id: "ai-1",
              type: "customNode",
              position: { x: 300, y: 100 },
              data: {
                label: "Análise Gemini",
                nodeType: "ai",
                provider: "google",
                model: "gemini-pro",
                prompt:
                  "Analise estas despesas e identifique: gastos suspeitos, padrões anômalos, categorização automática, sugestões de economia",
              },
            },
            {
              id: "logic-1",
              type: "customNode",
              position: { x: 500, y: 100 },
              data: { label: "Regras Aprovação", nodeType: "logic" },
            },
            {
              id: "output-1",
              type: "customNode",
              position: { x: 700, y: 100 },
              data: { label: "Relatório Financeiro", nodeType: "output" },
            },
          ],
          edges: [
            { id: "e1-2", source: "input-1", target: "ai-1" },
            { id: "e2-3", source: "ai-1", target: "logic-1" },
            { id: "e3-4", source: "logic-1", target: "output-1" },
          ],
        },
      };

      const template = templates[templateType as keyof typeof templates];
      if (template) {
        setNodes(template.nodes as Node[]);
        setEdges(template.edges as Edge[]);
        
        // Notificar o componente pai sobre a mudança
        if (onAgentChange) {
          onAgentChange(template.nodes as AgentNode[], template.edges as AgentEdge[]);
        }
      }
    },
    [setNodes, setEdges, onAgentChange]
  );

  // Listen for template events
  React.useEffect(() => {
    const handleAddTemplate = (event: CustomEvent) => {
      addTemplate(event.detail);
    };

    window.addEventListener("addTemplate", handleAddTemplate as EventListener);
    return () =>
      window.removeEventListener(
        "addTemplate",
        handleAddTemplate as EventListener
      );
  }, [addTemplate]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (
        typeof type === "undefined" ||
        !type ||
        !reactFlowInstance ||
        !reactFlowBounds
      ) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // ✅ SOLUÇÃO: Buscar dados padrão do template
      const defaultNodeData = getDefaultNodeData(type);

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "customNode",
        position,
        data: {
          ...defaultNodeData,
          nodeType: type as 'input' | 'ai' | 'output' | 'logic' | 'api',
        },
      }

      setNodes((nds) => nds.concat(newNode as AgentNode))
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as AgentNode);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<Node["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const validateWorkflow = useCallback(() => {
    // TODO: Re-implement validation logic if necessary
    const result = { isValid: true, errors: [], warnings: [] };
    setValidation(result);
    return result;
  }, [nodes, edges]);

  const handleSave = useCallback(() => {
    const validation = validateWorkflow();
    if (validation.isValid) {
      onSave(nodes as AgentNode[], edges as AgentEdge[]);
    }
  }, [nodes, edges, onSave, validateWorkflow]);

  return (
    <div className="h-full flex">
      {/* Node Palette - Condicional baseado no modo */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-hidden">
        {useFriendlyMode ? <FriendlyNodePalette /> : <NodePalette />}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div ref={reactFlowWrapper} className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionMode={'loose' as any}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#3b82f6", strokeWidth: 2 },
            }}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="agent-canvas"
          >
            <Controls position="top-left" />
            <MiniMap 
              style={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '8px'
              }}
              nodeColor="#3B82F6"
              maskColor="rgba(17, 24, 39, 0.6)"
              position="bottom-left"
            />
            <Background variant={'dots' as any} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Validation Panel */}
        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="absolute top-4 left-80 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 max-w-sm z-50">
            <h4 className="font-semibold text-white mb-2">
              Validação do Workflow
            </h4>

            {validation.errors.length > 0 && (
              <div className="mb-2">
                <div className="text-red-400 text-sm font-medium mb-1">
                  Erros:
                </div>
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-red-300 text-xs">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div>
                <div className="text-yellow-400 text-sm font-medium mb-1">
                  Avisos:
                </div>
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-yellow-300 text-xs">
                    • {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

              </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 h-full flex flex-col">
          <TooltipProvider>
            <NodeToolbar
              node={selectedNode}
              onUpdate={(data) => updateNodeData(selectedNode.id, data)}
              onDelete={() => deleteNode(selectedNode.id)}
            />
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export function VisualCanvasWrapper(props: VisualCanvasProps) {
  return (
    <ReactFlowProvider>
      <VisualCanvas {...props} />
    </ReactFlowProvider>
  );
}
