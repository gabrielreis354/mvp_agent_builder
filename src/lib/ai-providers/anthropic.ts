import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export class AnthropicProvider {
  private client: Anthropic;
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async generateCompletion(
    prompt: string,
    model: string = 'claude-3-5-haiku-20241022',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    try {
      const message = await this.client.messages.create({
        model: model,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3,
        system: options.systemPrompt || 'Você é um assistente especializado em análise de documentos e processos de RH.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0]?.type === 'text' ? message.content[0].text : '';
      const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;

      return {
        content,
        confidence: 0.95, // Anthropic doesn't provide confidence scores
        tokens_used: tokensUsed,
        model,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamCompletion(
    prompt: string,
    model: string = 'claude-3-5-haiku-20241022',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      onChunk?: (chunk: string) => void;
    } = {}
  ): Promise<AIResponse> {
    try {
      const stream = await this.client.messages.create({
        model: model,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3,
        system: options.systemPrompt || 'Você é um assistente especializado em análise de documentos e processos de RH.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      });

      let fullContent = '';
      let tokensUsed = 0;

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const chunkText = chunk.delta.text;
          fullContent += chunkText;
          if (options.onChunk) {
            options.onChunk(chunkText);
          }
        }
        
        if (chunk.type === 'message_delta' && chunk.usage) {
          tokensUsed = chunk.usage.output_tokens || 0;
        }
      }

      return {
        content: fullContent,
        confidence: 0.95,
        tokens_used: tokensUsed,
        model,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic streaming error:', error);
      throw new Error(`Anthropic streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
