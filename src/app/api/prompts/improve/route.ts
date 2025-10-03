import { NextRequest, NextResponse } from 'next/server'
import { AIProviderManager } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    // Por enquanto, usar lógica local otimizada
    // TODO: Implementar IA real para melhoria de prompts
    const improvedPrompt = await improvePromptWithAI(prompt)

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      improvedPrompt,
      improvements: [
        'Adicionado contexto específico para o domínio',
        'Especificado formato de entrada e saída',
        'Incluído critérios de qualidade',
        'Definido estrutura do resultado'
      ]
    })

  } catch (error) {
    console.error('Erro ao melhorar prompt:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function improvePromptWithAI(originalPrompt: string): Promise<string> {
  // TODO: Implementar chamada real para IA
  // const aiManager = new AIProviderManager()
  // const response = await aiManager.generateCompletion('openai', improvePromptSystemPrompt + originalPrompt, 'gpt-4o-mini')
  
  // Por enquanto, usar lógica local melhorada
  return improvePromptLocally(originalPrompt)
}

function improvePromptLocally(originalPrompt: string): string {
  const prompt = originalPrompt.toLowerCase()
  let improved = originalPrompt

  // Detectar tipo de tarefa e adicionar contexto específico
  if (prompt.includes('contrato') || prompt.includes('jurídico')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Extraia informações como partes envolvidas, valores, prazos, cláusulas importantes
- Identifique riscos jurídicos e pontos de não conformidade com a CLT
- Analise cláusulas de rescisão, benefícios e direitos trabalhistas
- Forneça recomendações de melhorias e alertas de compliance

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX de contratos trabalhistas

**FORMATO DE SAÍDA:** Gere um relatório HTML estruturado com seções organizadas para visualização profissional e conversão em PDF`

  } else if (prompt.includes('currículo') || prompt.includes('cv') || prompt.includes('candidato')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Analise experiência profissional, formação acadêmica, habilidades técnicas
- Forneça pontuação de 0-100 para cada critério (experiência, formação, habilidades, idiomas)
- Identifique pontos fortes e fracos do candidato
- Dê recomendação final de contratação (Sim/Não/Talvez) com justificativa

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX de currículos

**FORMATO DE SAÍDA:** Gere relatório de triagem estruturado em HTML com pontuação visual e recomendações claras`

  } else if (prompt.includes('despesa') || prompt.includes('financeiro') || prompt.includes('folha')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Identifique gastos suspeitos e padrões anômalos na folha de pagamento
- Categorize despesas em fixas vs. variáveis
- Calcule métricas financeiras (custo total, custo médio por funcionário, percentual de encargos)
- Sugira oportunidades de economia e otimização de benefícios

**FORMATO DE ENTRADA:** Aceite planilhas Excel, CSV ou PDF de folhas de pagamento

**FORMATO DE SAÍDA:** Gere relatório financeiro em HTML com gráficos, tabelas e análises detalhadas`

  } else if (prompt.includes('email') || prompt.includes('suporte') || prompt.includes('atendimento')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Classifique por urgência (baixa/média/alta), categoria (técnico/comercial/financeiro)
- Analise sentimento (positivo/neutro/negativo)
- Sugira respostas automáticas apropriadas
- Identifique necessidade de escalação para especialistas

**FORMATO DE ENTRADA:** Aceite texto de emails, mensagens ou tickets de suporte

**FORMATO DE SAÍDA:** Gere classificação estruturada com sugestões de ação e respostas pré-definidas`

  } else {
    // Melhorias gerais para qualquer prompt
    improved += `

**CONTEXTO ESPECÍFICO:**
- Seja específico sobre o tipo de documento ou dados de entrada
- Defina claramente o formato e estrutura do resultado esperado
- Inclua critérios de qualidade e validação
- Especifique métricas ou indicadores relevantes

**FORMATO DE ENTRADA:** Especifique os tipos de arquivo aceitos (PDF, DOC, Excel, etc.)

**FORMATO DE SAÍDA:** Gere resultado estruturado em HTML para visualização profissional`
  }

  // Adicionar instruções de qualidade se não presentes
  if (!prompt.includes('estruturado') && !prompt.includes('formato')) {
    improved += `

**INSTRUÇÕES DE QUALIDADE:**
- Use linguagem clara e profissional adequada para RH
- Organize informações em seções bem definidas
- Inclua resumo executivo no início
- Forneça recomendações práticas e acionáveis
- Mantenha consistência na formatação e terminologia`
  }

  return improved.trim()
}

const improvePromptSystemPrompt = `Você é um especialista em engenharia de prompts para sistemas de IA voltados para RH. Sua tarefa é melhorar prompts para gerar agentes mais eficazes.

DIRETRIZES PARA MELHORIA:
1. Adicione contexto específico do domínio RH
2. Especifique formatos de entrada e saída claramente
3. Inclua critérios de qualidade e métricas
4. Defina estrutura do resultado esperado
5. Use linguagem profissional adequada para RH
6. Adicione instruções de formatação e apresentação

ESTRUTURA DO PROMPT MELHORADO:
- Tarefa principal (mantém o original)
- Contexto específico do domínio
- Formato de entrada aceito
- Estrutura detalhada da saída
- Critérios de qualidade
- Instruções de formatação

Melhore o seguinte prompt mantendo a intenção original mas tornando-o mais específico e eficaz:

`
