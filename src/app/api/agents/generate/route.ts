import { NextRequest, NextResponse } from 'next/server'
import { Agent, AgentNode, AgentEdge } from '@/types/agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body
    
    // Generate agent from natural language prompt
    const generatedAgent = await generateAgentFromPrompt(prompt)
    
    return NextResponse.json(generatedAgent)
    
  } catch (error) {
    console.error('Error generating agent:', error)
    return NextResponse.json(
      { error: 'Failed to generate agent' },
      { status: 500 }
    )
  }
}

async function generateAgentFromPrompt(prompt: string): Promise<Partial<Agent>> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const nodes: AgentNode[] = []
  const edges: AgentEdge[] = []

  // Input node - usando formato compatível com CustomNode
  const inputNode: AgentNode = {
    id: 'input-1',
    type: 'customNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Entrada de Dados',
      nodeType: 'input',
      inputSchema: {
        type: 'object',
        properties: {
          document: { type: 'string', description: 'Documento para análise' },
          text: { type: 'string', description: 'Texto para processamento' }
        }
      }
    }
  }
  nodes.push(inputNode)

  // AI processing node with optimal provider
  const optimal = getOptimalProvider(prompt)
  const aiNode: AgentNode = {
    id: 'ai-1',
    type: 'customNode',
    position: { x: 350, y: 100 },
    data: {
      label: 'Processamento IA',
      nodeType: 'ai',
      prompt: generateOptimizedPrompt(prompt),
      provider: optimal.provider as any,
      model: optimal.model,
      temperature: 0.3,
      maxTokens: 2000
    }
  }
  nodes.push(aiNode)

  // Add logic node if needed for validation/conditions
  if (prompt.toLowerCase().includes('validar') || prompt.toLowerCase().includes('verificar') || prompt.toLowerCase().includes('aprovar')) {
    const logicNode: AgentNode = {
      id: 'logic-1',
      type: 'customNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Validação',
        nodeType: 'logic',
        logicType: 'validate',
        validation: 'data.confidence > 0.8 && data.completeness > 0.9'
      }
    }
    nodes.push(logicNode)
    
    edges.push({
      id: 'edge-2',
      source: 'ai-1',
      target: 'logic-1'
    })
  }

  // Add API node if integration is mentioned
  if (prompt.toLowerCase().includes('integrar') || prompt.toLowerCase().includes('notificar') || prompt.toLowerCase().includes('enviar')) {
    const apiNode: AgentNode = {
      id: 'api-1',
      type: 'customNode',
      position: { x: nodes.length > 2 ? 850 : 600, y: 100 },
      data: {
        label: 'Integração API',
        nodeType: 'api',
        apiEndpoint: 'https://api.sistema.com/webhook',
        apiMethod: 'POST',
        apiHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${API_KEY}'
        }
      }
    }
    nodes.push(apiNode)
    
    const sourceNode = nodes.length > 3 ? 'logic-1' : 'ai-1'
    edges.push({
      id: `edge-${edges.length + 2}`,
      source: sourceNode,
      target: 'api-1'
    })
  }

  // Output node
  const outputNode: AgentNode = {
    id: 'output-1',
    type: 'customNode',
    position: { x: nodes.length > 3 ? 1100 : nodes.length > 2 ? 850 : 600, y: 100 },
    data: {
      label: 'Resultado',
      nodeType: 'output',
      outputSchema: {
        type: 'object',
        properties: {
          extracted_data: { type: 'object', description: 'Dados extraídos' },
          confidence: { type: 'number', description: 'Nível de confiança' },
          summary: { type: 'string', description: 'Resumo do processamento' },
          recommendations: { type: 'array', description: 'Recomendações' }
        }
      }
    }
  }
  nodes.push(outputNode)

  // Create main flow edges
  edges.push({
    id: 'edge-1',
    source: 'input-1',
    target: 'ai-1'
  })

  // Connect to output
  const lastProcessingNode = nodes[nodes.length - 2] // Second to last node
  edges.push({
    id: `edge-${edges.length + 1}`,
    source: lastProcessingNode.id,
    target: 'output-1'
  })

  return {
    name: generateAgentName(prompt),
    description: prompt,
    category: detectCategory(prompt),
    nodes,
    edges,
    tags: extractTags(prompt),
    status: 'draft',
    isTemplate: false,
    author: 'AI Generator',
    version: '1.0.0'
  }
}

function getOptimalProvider(prompt: string): { provider: string; model: string } {
  const promptLower = prompt.toLowerCase()
  
  if (promptLower.includes('contrato') || promptLower.includes('jurídico')) {
    return { provider: 'openai', model: 'gpt-4' }
  }
  if (promptLower.includes('financeiro') || promptLower.includes('dados')) {
    return { provider: 'google', model: 'gemini-pro' }
  }
  if (promptLower.includes('suporte') || promptLower.includes('cliente')) {
    return { provider: 'openai', model: 'gpt-4' }
  }
  return { provider: 'openai', model: 'gpt-4' }
}

function generateOptimizedPrompt(userPrompt: string): string {
  return `Baseado na solicitação: "${userPrompt}"

Você é um assistente especializado em processamento de dados. Analise o conteúdo fornecido e:

1. Extraia todas as informações relevantes
2. Estruture os dados de forma clara e organizada  
3. Identifique padrões e insights importantes
4. Forneça recomendações baseadas na análise
5. Calcule um nível de confiança para os resultados

Formato de resposta esperado:
- Dados extraídos: [informações estruturadas]
- Insights: [padrões identificados]
- Recomendações: [ações sugeridas]
- Confiança: [0-1]

Seja preciso, objetivo e forneça justificativas para suas conclusões.`
}

function generateAgentName(prompt: string): string {
  const promptLower = prompt.toLowerCase()
  
  if (promptLower.includes('contrato')) return 'Analisador de Contratos IA'
  if (promptLower.includes('suporte')) return 'Assistente de Suporte Inteligente'
  if (promptLower.includes('financeiro')) return 'Analisador Financeiro IA'
  if (promptLower.includes('documento')) return 'Processador de Documentos IA'
  if (promptLower.includes('email')) return 'Classificador de Emails IA'
  if (promptLower.includes('social') || promptLower.includes('mídia')) return 'Monitor de Redes Sociais IA'
  
  return 'Agente Personalizado IA'
}

function detectCategory(prompt: string): string {
  const promptLower = prompt.toLowerCase()
  
  if (promptLower.includes('contrato') || promptLower.includes('rh')) return 'rh'
  if (promptLower.includes('suporte') || promptLower.includes('cliente')) return 'atendimento'
  if (promptLower.includes('financeiro') || promptLower.includes('despesa')) return 'financeiro'
  if (promptLower.includes('jurídico') || promptLower.includes('legal')) return 'juridico'
  if (promptLower.includes('marketing') || promptLower.includes('social')) return 'marketing'
  if (promptLower.includes('documento') || promptLower.includes('arquivo')) return 'documentos'
  
  return 'geral'
}

function extractTags(prompt: string): string[] {
  const tags: string[] = []
  const promptLower = prompt.toLowerCase()
  
  if (promptLower.includes('contrato')) tags.push('contratos')
  if (promptLower.includes('suporte')) tags.push('suporte')
  if (promptLower.includes('financeiro')) tags.push('financeiro')
  if (promptLower.includes('automação') || promptLower.includes('automatizar')) tags.push('automacao')
  if (promptLower.includes('análise') || promptLower.includes('analisar')) tags.push('analise')
  if (promptLower.includes('classificar')) tags.push('classificacao')
  if (promptLower.includes('extrair')) tags.push('extracao')
  if (promptLower.includes('validar')) tags.push('validacao')
  if (promptLower.includes('integrar')) tags.push('integracao')
  if (promptLower.includes('ia') || promptLower.includes('inteligente')) tags.push('ia')
  
  return tags.length > 0 ? tags : ['personalizado']
}
