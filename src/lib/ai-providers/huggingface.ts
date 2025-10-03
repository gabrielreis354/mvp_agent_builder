import { AIResponse } from "./index";

export interface HuggingFaceConfig {
  apiKey: string;
  baseURL?: string;
}

export class HuggingFaceProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(config: HuggingFaceConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://router.huggingface.co'; // 🔧 CORREÇÃO: URL correta para a API gratuita
  }

  async generateCompletion(
    prompt: string,
    model: string = 'meta-llama/Llama-3.2-3B-Instruct',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    try {
      const messages = [];
      
      // 🔧 SISTEMA UNIVERSAL JSON - FORÇA RESPOSTA EM JSON SEMPRE
      const universalSystemPrompt = `Você é um assistente especializado em análise de documentos. 
IMPORTANTE: Responda SEMPRE em formato JSON válido, seguindo esta estrutura:

{
  "metadata": {
    "tipo_documento": "tipo detectado automaticamente",
    "titulo_relatorio": "Título adequado para o tipo de documento", 
    "data_analise": "${new Date().toLocaleDateString('pt-BR')}",
    "tipo_analise": "Tipo de análise realizada"
  },
  "resumo_executivo": "Resumo conciso da análise",
  "dados_principais": {
    "informacao_extraida": "valores extraídos do documento"
  },
  "pontos_principais": [
    "Primeiro ponto importante",
    "Segundo ponto importante",
    "Terceiro ponto importante"
  ],
  "recomendacoes": [
    "Primeira recomendação",
    "Segunda recomendação", 
    "Terceira recomendação"
  ],
  "conclusao": "Conclusão final da análise"
}

REGRAS OBRIGATÓRIAS:
- Responda APENAS JSON válido
- Não use markdown, asteriscos ou formatação
- Extraia informações reais do documento
- Use "Não informado" se dados não disponíveis
- Adapte os campos aos dados encontrados

${options.systemPrompt || ''}`;

      console.log('🎯 [HuggingFaceProvider] Using Universal JSON System');

      // Adicionar system prompt se suportado pelo modelo
      if (options.systemPrompt || universalSystemPrompt) {
        messages.push({
          role: 'system',
          content: universalSystemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const requestBody = {
        model: model,
        messages: messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2000,
        stream: false
      };

      console.log(`🤖 [HuggingFaceProvider] Making request to ${model}`);

      const response = await fetch(`${this.baseURL}/v1/chat/completions`, { // 🔧 CORREÇÃO: Adicionar /v1/ explicitamente
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response format from HuggingFace API');
      }

      const content = data.choices[0].message?.content || '';
      
      // Verificar se a resposta é JSON válido
      let isValidJSON = false;
      try {
        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
          const parsed = JSON.parse(content);
          if (parsed.metadata) {
            isValidJSON = true;
            console.log('✅ [HuggingFaceProvider] Valid JSON response received');
          }
        }
      } catch (e) {
        console.log('⚠️ [HuggingFaceProvider] Response is not valid JSON, but continuing...');
      }

      return {
        content: content,
        confidence: isValidJSON ? 0.95 : 0.8,
        tokens_used: data.usage?.total_tokens || 0,
        model: model,
        provider: 'huggingface'
      };

    } catch (error) {
      console.error('HuggingFace API Error:', error);
      throw new Error(`HuggingFace completion failed: ${(error as Error).message}`);
    }
  }

  async generateStreamCompletion(
    prompt: string,
    model: string = 'meta-llama/Llama-3.2-3B-Instruct',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      onChunk?: (chunk: string) => void;
    } = {}
  ): Promise<AIResponse> {
    // Para simplicidade inicial, vamos usar a versão não-stream
    // TODO: Implementar streaming se necessário
    console.log('🔄 [HuggingFaceProvider] Stream not implemented, using regular completion');
    return this.generateCompletion(prompt, model, options);
  }
}
