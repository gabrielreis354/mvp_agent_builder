import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export class OpenAIProvider {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
    });
  }

  async generateCompletion(
    prompt: string,
    model: string = 'gpt-4',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
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
      
      messages.push({
        role: 'system',
        content: universalSystemPrompt
      });
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2000,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        confidence: 0.95, // OpenAI doesn't provide confidence scores
        tokens_used: tokensUsed,
        model,
        provider: 'openai'
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      
      // Tratamento específico de erros da OpenAI
      if (error?.status === 404) {
        throw new Error(`❌ Modelo "${model}" não está disponível ou não existe. Verifique se o modelo está correto e se você tem acesso a ele.`);
      }
      
      if (error?.status === 401) {
        throw new Error(`❌ Chave de API inválida. Verifique suas credenciais da OpenAI.`);
      }
      
      if (error?.status === 429) {
        throw new Error(`❌ Limite de requisições excedido. Aguarde alguns momentos e tente novamente.`);
      }
      
      if (error?.status === 500 || error?.status === 503) {
        throw new Error(`❌ Serviço da OpenAI temporariamente indisponível. Tente novamente em alguns instantes.`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`❌ Falha na chamada da API OpenAI: ${errorMessage}`);
    }
  }

  async generateEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: model,
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error: any) {
      console.error('OpenAI embedding error:', error);
      
      if (error?.status === 404) {
        throw new Error(`❌ Modelo de embedding "${model}" não está disponível.`);
      }
      
      if (error?.status === 401) {
        throw new Error(`❌ Chave de API inválida para embeddings.`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`❌ Falha ao gerar embedding: ${errorMessage}`);
    }
  }

  async moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }> {
    try {
      const response = await this.client.moderations.create({
        input: text,
      });

      const result = response.results[0];
      return {
        flagged: result?.flagged || false,
        categories: (result?.categories || {}) as unknown as Record<string, boolean>,
        category_scores: (result?.category_scores || {}) as unknown as Record<string, number>
      };
    } catch (error: any) {
      console.error('OpenAI moderation error:', error);
      
      if (error?.status === 401) {
        throw new Error(`❌ Chave de API inválida para moderação.`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`❌ Falha na moderação de conteúdo: ${errorMessage}`);
    }
  }
}
