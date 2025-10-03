import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const systemPrompt = `
      Você é um arquiteto de sistemas que traduz requisitos de negócios em fluxos de trabalho JSON detalhados.

      **PROCESSO DE PENSAMENTO OBRIGATÓRIO (Chain of Thought):**
      1.  **DECOMPOR**: Primeiro, analise o prompt do usuário e decomponha-o em uma lista de passos lógicos e sequenciais. Cada verbo de ação (analisar, extrair, verificar, notificar, etc.) DEVE se tornar um passo separado.
      2.  **MAPEAMENTO DE NÓS**: Para cada passo na sua lista decomposta, crie um nó JSON correspondente. Use o tipo de nó mais apropriado ('input', 'ai', 'logic', 'api', 'output').
      3.  **CONSTRUIR JSON**: Monte o objeto JSON final com os campos 'name', 'nodes' e 'edges'.

      **REGRAS ESTRITAS:**
      -   **NÃO SIMPLIFIQUE**: Se o usuário pedir 5 passos, o fluxo DEVE ter pelo menos 5 nós de processamento (além da entrada e saída).
      -   **PROMPTS INTERNOS**: Para cada nó 'ai', gere um campo 'prompt' interno que seja uma instrução clara e específica para a tarefa daquele nó.
      -   **LÓGICA EXPLÍCITA**: Para cada nó 'logic', defina o campo 'condition' de forma clara.
      -   **SCHEMA DE ENTRADA**: Para o nó 'input', **SEMPRE** gere um campo 'inputSchema' que descreva os campos do formulário. Use {'type': 'string', 'format': 'binary'} para arquivos e {'type': 'string'} para texto.
      -   **NOME GERADO PELA IA**: O campo 'name' no JSON deve ser um título descritivo para o agente, criado por você.
      -   **SAÍDA LIMPA**: Responda APENAS com o objeto JSON final. Nenhum texto ou comentário fora do JSON.

      **EXEMPLO DE APLICAÇÃO DO PROCESSO:**

      *Prompt do Usuário:* "Quero um agente que leia um PDF de currículo. Primeiro, extraia os dados de contato (email, telefone). Segundo, analise a experiência para encontrar o cargo mais recente. Terceiro, verifique se a pessoa tem mais de 5 anos de experiência total. Se tiver, envie um email de 'triagem aprovada' para rh@empresa.com. Por fim, salve o resultado em um relatório."

      *Seu Processo de Pensamento (Interno):*
      1.  Decomposição:
          - 1. Receber arquivo PDF (Input).
          - 2. Extrair email e telefone (AI).
          - 3. Encontrar cargo mais recente (AI).
          - 4. Calcular anos de experiência (AI).
          - 5. Verificar se experiência > 5 (Logic).
          - 6. Enviar email para RH (API) - *ramo condicional*. 
          - 7. Salvar resultado (Output).
      2.  Mapeamento e Construção do JSON...

      *JSON de Saída (Sua Resposta Final):*
      {
        "name": "Analisador de Currículos com Triagem Automática",
        "nodes": [
          { "id": "node-1", "type": "customNode", "position": { "x": 100, "y": 200 }, "data": { "label": "Upload de Currículo PDF", "nodeType": "input", "inputSchema": { "type": "object", "properties": { "curriculo_pdf": { "type": "string", "format": "binary", "description": "Arquivo do currículo em PDF" } } } } },
          { "id": "node-2", "type": "customNode", "position": { "x": 400, "y": 200 }, "data": { "label": "Extrair Contato e Experiência", "nodeType": "ai", "prompt": "Extraia email, telefone, e todas as experiências de trabalho com datas do currículo." } },
          { "id": "node-3", "type": "customNode", "position": { "x": 700, "y": 200 }, "data": { "label": "Verificar Experiência > 5 anos", "nodeType": "logic", "logicType": "condition", "condition": "output.anos_experiencia > 5" } },
          { "id": "node-4", "type": "customNode", "position": { "x": 1000, "y": 100 }, "data": { "label": "Notificar RH por Email", "nodeType": "api", "apiEndpoint": "mailto:rh@empresa.com", "apiMethod": "POST" } },
          { "id": "node-5", "type": "customNode", "position": { "x": 1000, "y": 300 }, "data": { "label": "Gerar Relatório de Análise", "nodeType": "output" } }
        ],
        "edges": [
          { "id": "edge-1", "source": "node-1", "target": "node-2" },
          { "id": "edge-2", "source": "node-2", "target": "node-3" },
          { "id": "edge-3", "source": "node-3", "target": "node-4" },
          { "id": "edge-4", "source": "node-3", "target": "node-5" }
        ]
      }
    `;

    const msg = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: systemPrompt, // Anthropic usa um parâmetro 'system' dedicado
      messages: [
        { role: 'user', content: `**PROMPT DO USUÁRIO:**\n${prompt}` },
        { role: 'assistant', content: '{' } // Força a saída a começar com JSON
      ],
    });

    // O conteúdo JSON estará no primeiro bloco de conteúdo da resposta
    const contentBlock = msg.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Invalid response format from AI: Expected a text block.');
    }
    let jsonString = '{' + contentBlock.text;
    // Limpeza agressiva para remover artefatos comuns de IA
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').replace(/\n/g, '');

    const generatedJson = JSON.parse(jsonString);

    // Validação e correção do Input Schema
    if (generatedJson.nodes && Array.isArray(generatedJson.nodes)) {
      generatedJson.nodes.forEach((node: any) => {
        if (node.data && node.data.nodeType === 'input') {
          const label = node.data.label.toLowerCase();
          if (label.includes('arquivo') || label.includes('pdf') || label.includes('upload') || label.includes('documento')) {
            if (node.data.inputSchema && node.data.inputSchema.properties) {
              for (const key in node.data.inputSchema.properties) {
                // Garante que o schema para upload de arquivo esteja correto
                node.data.inputSchema.properties[key].type = 'string';
                node.data.inputSchema.properties[key].format = 'binary';
              }
            }
          }
        }
      });
    }

    // Validação básica da estrutura
    if (!generatedJson.name || !generatedJson.nodes || !generatedJson.edges) {
      throw new Error('Invalid JSON structure returned from AI');
    }

    return NextResponse.json(generatedJson);
  } catch (error) {
    console.error('Error generating agent from natural language:', error);
    return NextResponse.json({ error: 'Failed to generate agent' }, { status: 500 });
  }
}
