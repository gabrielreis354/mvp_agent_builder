import { OpenAIProvider, OpenAIConfig } from "./openai";
import { AnthropicProvider, AnthropicConfig } from "./anthropic";
import { GoogleProvider, GoogleConfig } from "./google";
import { HuggingFaceProvider, HuggingFaceConfig } from "./huggingface";

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export type AIProviderType = "openai" | "anthropic" | "google" | "huggingface";

export interface AIProviderConfig {
  openai?: OpenAIConfig;
  anthropic?: AnthropicConfig;
  google?: GoogleConfig;
  huggingface?: HuggingFaceConfig;
}

export class AIProviderManager {
  private providers: Map<AIProviderType, any> = new Map();
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI if configured
    if (this.config.openai?.apiKey) {
      this.providers.set("openai", new OpenAIProvider(this.config.openai));
    }

    // Initialize Anthropic if configured
    if (this.config.anthropic?.apiKey) {
      this.providers.set(
        "anthropic",
        new AnthropicProvider(this.config.anthropic)
      );
    }

    // Initialize Google if configured
    if (this.config.google?.apiKey) {
      this.providers.set("google", new GoogleProvider(this.config.google));
    }

    // Initialize HuggingFace if configured
    if (this.config.huggingface?.apiKey) {
      this.providers.set("huggingface", new HuggingFaceProvider(this.config.huggingface));
    }
  }

  async generateCompletion(
    provider: AIProviderType,
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      enableFallback?: boolean;
    } = {}
  ): Promise<AIResponse> {
    const { enableFallback = true, ...aiOptions } = options;

    // Define ordem de fallback baseada em VELOCIDADE (Haiku primeiro - OpenAI com problemas)
    // 🔧 REVERTENDO: HuggingFace como fallback até estar estável
    const fallbackOrder: AIProviderType[] = ["anthropic", "google", "huggingface", "openai"];

    // Se um provedor específico foi solicitado, tentar ele primeiro
    const providersToTry = provider
      ? [provider, ...fallbackOrder.filter((p) => p !== provider)]
      : fallbackOrder;

    // Use provider-specific default models (otimizado para VELOCIDADE)
    const defaultModels = {
      openai: "gpt-4o-mini", // MUITO RÁPIDO - Melhor custo-benefício
      anthropic: "claude-3-5-haiku-20241022", // MUITO RÁPIDO - Excelente para análises
      google: "gemini-1.5-flash", // RÁPIDO - Mais rápido que 2.5-flash
      huggingface: "meta-llama/Llama-3.2-3B-Instruct", // MUITO RÁPIDO - Open Source
    };

    let lastError: Error | null = null;

    for (const currentProvider of providersToTry) {
      const providerInstance = this.providers.get(currentProvider);

      if (!providerInstance) {
        console.warn(
          `🔄 Provider '${currentProvider}' not configured, trying next...`
        );
        continue;
      }

      try {
        console.log(`🤖 Attempting AI call with ${currentProvider}...`);

        // Usar modelo compatível com o provider atual
        const modelToUse = this.getCompatibleModel(
          model || "gpt-4",
          currentProvider
        );
        
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
  "analise_payload": {
    "resumo_executivo": "Resumo conciso da análise",
    "dados_principais": {
      "informacao_extraida": "valores extraídos do documento"
    },
    "pontos_principais": [
      "Primeiro ponto importante",
      "Segundo ponto importante"
    ],
    "recomendacoes": [
      "Primeira recomendação",
      "Segunda recomendação"
    ],
    "conclusao": "Conclusão final da análise"
  }
}

REGRAS OBRIGATÓRIAS:
- Responda APENAS JSON válido.
- Não use markdown, asteriscos ou formatação.
- Dentro de 'analise_payload', você tem a flexibilidade de adicionar, remover ou renomear campos para melhor representar os dados do documento analisado.
- Use "Não informado" se dados não disponíveis.

${aiOptions.systemPrompt || this.getDefaultSystemPrompt(currentProvider)}`;

        console.log('🎯 [AIProviderManager] Using Universal JSON System');
        
        const systemPrompt = universalSystemPrompt;

        console.log(
          `📋 Using model: ${modelToUse} for provider: ${currentProvider} (requested: ${
            model || "default"
          })`
        );

        const result = await providerInstance.generateCompletion(
          prompt,
          modelToUse,
          {
            ...aiOptions,
            systemPrompt,
          }
        );

        console.log(`✅ AI call successful with ${currentProvider}`);
        return {
          ...result,
          provider: currentProvider, // Garantir que o provider correto seja retornado
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Provider ${currentProvider} failed:`, error);

        // Se não é para usar fallback ou é o último provider, lançar erro
        if (
          !enableFallback ||
          currentProvider === providersToTry[providersToTry.length - 1]
        ) {
          break;
        }

        console.log(`🔄 Trying fallback provider...`);
        continue;
      }
    }

    // Se chegou aqui, todos os providers falharam
    const availableProviders = this.getAvailableProviders();
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message}. ` +
        `Available providers: ${availableProviders.join(", ")}. ` +
        `Check your API keys and network connection.`
    );
  }

  async generateStreamCompletion(
    provider: AIProviderType,
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      onChunk?: (chunk: string) => void;
      enableFallback?: boolean;
    } = {}
  ): Promise<AIResponse> {
    const { enableFallback = true, ...aiOptions } = options;

    // Define ordem de fallback para streaming (Haiku primeiro - OpenAI com problemas)
    const fallbackOrder: AIProviderType[] = ["anthropic", "google", "openai"];
    const providersToTry = provider
      ? [provider, ...fallbackOrder.filter((p) => p !== provider)]
      : fallbackOrder;

    const defaultModels = {
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-haiku-20241022",
      google: "gemini-1.5-flash",
    };

    let lastError: Error | null = null;

    for (const currentProvider of providersToTry) {
      const providerInstance = this.providers.get(currentProvider);

      if (!providerInstance) {
        console.warn(
          `🔄 Stream provider '${currentProvider}' not configured, trying next...`
        );
        continue;
      }

      try {
        console.log(`🌊 Attempting streaming with ${currentProvider}...`);

        // Se não suporta streaming, usar completion normal
        if (!providerInstance.generateStreamCompletion) {
          console.log(
            `📝 ${currentProvider} doesn't support streaming, using regular completion`
          );
          return await this.generateCompletion(
            currentProvider,
            prompt,
            model,
            aiOptions
          );
        }

        // Usar modelo compatível com o provider atual
        const modelToUse = this.getCompatibleModel(
          model || "gpt-4",
          currentProvider
        );
        const systemPrompt =
          aiOptions.systemPrompt ||
          this.getDefaultSystemPrompt(currentProvider);

        console.log(
          `📋 Streaming with model: ${modelToUse} for provider: ${currentProvider} (requested: ${
            model || "default"
          })`
        );

        const result = await providerInstance.generateStreamCompletion(
          prompt,
          modelToUse,
          {
            ...aiOptions,
            systemPrompt,
          }
        );

        console.log(`✅ Streaming successful with ${currentProvider}`);
        return {
          ...result,
          provider: currentProvider,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Stream provider ${currentProvider} failed:`, error);

        if (
          !enableFallback ||
          currentProvider === providersToTry[providersToTry.length - 1]
        ) {
          break;
        }

        console.log(`🔄 Trying next streaming provider...`);
        continue;
      }
    }

    // Se chegou aqui, todos falharam
    throw new Error(
      `All streaming providers failed. Last error: ${lastError?.message}. ` +
        `Falling back to regular completion...`
    );
  }

  /**
   * Método inteligente que tenta automaticamente o melhor provider disponível
   */
  async generateCompletionWithAutoFallback(
    prompt: string,
    options: {
      preferredProvider?: AIProviderType;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      prioritizeCost?: boolean;
    } = {}
  ): Promise<
    AIResponse & { actualProvider: AIProviderType; fallbackUsed: boolean }
  > {
    const { preferredProvider, prioritizeCost = true, ...aiOptions } = options;

    // Ordem baseada em velocidade e custo-benefício (Haiku primeiro - OpenAI com problemas)
    let providerOrder: AIProviderType[] = prioritizeCost
      ? ["anthropic", "google", "openai"] // Haiku + custo otimizado
      : ["anthropic", "google", "openai"]; // Por velocidade/qualidade

    // Se tem preferência, colocar primeiro
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      providerOrder = [
        preferredProvider,
        ...providerOrder.filter((p) => p !== preferredProvider),
      ];
    }

    let fallbackUsed = false;

    for (let i = 0; i < providerOrder.length; i++) {
      const currentProvider = providerOrder[i];

      if (!this.isProviderAvailable(currentProvider)) {
        continue;
      }

      try {
        if (i > 0) fallbackUsed = true;

        const result = await this.generateCompletion(
          currentProvider,
          prompt,
          "", // Deixar vazio para usar modelo padrão do provider
          { ...aiOptions, enableFallback: false } // Desabilitar fallback interno para controle manual
        );

        return {
          ...result,
          actualProvider: currentProvider,
          fallbackUsed,
        };
      } catch (error) {
        console.error(
          `Provider ${currentProvider} failed, trying next...`,
          error
        );
        continue;
      }
    }

    throw new Error(
      "All AI providers are unavailable or failed. Please check your configuration."
    );
  }

  /**
   * Mapeia modelos entre providers para compatibilidade
   */
  private getCompatibleModel(
    requestedModel: string,
    targetProvider: AIProviderType
  ): string {
    const modelMapping: Record<string, Record<AIProviderType, string>> = {
      // Modelos GPT-4 equivalentes (OTIMIZADO PARA VELOCIDADE)
      "gpt-4": {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-1.5-flash", // ⚡ Mais rápido que 2.5-flash
        huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
      },
      "gpt-4o-mini": {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-1.5-flash", // ⚡ Mais rápido que 2.5-flash
        huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
      },
      // Modelos Claude equivalentes
      "claude-3-sonnet": {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-1.5-flash", // ⚡ Mais rápido que 2.5-flash
        huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
      },
      // Modelos Gemini equivalentes
      "gemini-pro": {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-1.5-flash", // ⚡ Mais rápido que 2.5-flash
        huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
      },
      "gemini-2.5-flash": {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-1.5-flash", // ⚡ Upgrade para versão mais rápida
        huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
      },
    };

    // Se há mapeamento específico, usar ele
    if (modelMapping[requestedModel]) {
      return modelMapping[requestedModel][targetProvider];
    }

    // Senão, usar modelo padrão do provider (OTIMIZADO PARA VELOCIDADE)
    const defaultModels = {
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-haiku-20241022",
      google: "gemini-1.5-flash", // ⚡ Mais rápido que 2.5-flash
      huggingface: "meta-llama/Llama-3.2-3B-Instruct", // ⚡ Rápido e eficiente
    };

    return defaultModels[targetProvider];
  }

  private getDefaultSystemPrompt(provider: AIProviderType): string {
    const basePrompt = `Você é um assistente especializado em análise de documentos e processos de Recursos Humanos (RH).

Suas especialidades incluem:
- Análise de contratos de trabalho e conformidade com a CLT
- Processamento de documentos de RH (currículos, avaliações, onboarding)
- Geração de relatórios profissionais em HTML
- Validação de dados e documentos trabalhistas
- Suporte a processos de recrutamento e seleção

Sempre forneça respostas precisas, profissionais e em conformidade com a legislação trabalhista brasileira.`;

    // Provider-specific adjustments
    switch (provider) {
      case "anthropic":
        return `${basePrompt}\n\nSeja detalhado e estruturado em suas análises.`;
      case "openai":
        return `${basePrompt}\n\nForneça respostas claras e organizadas.`;
      case "google":
        return `${basePrompt}\n\nSeja preciso e objetivo em suas respostas.`;
      default:
        return basePrompt;
    }
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(provider: AIProviderType): boolean {
    return this.providers.has(provider);
  }

  async testProvider(provider: AIProviderType): Promise<boolean> {
    try {
      const result = await this.generateCompletion(
        provider,
        'Teste de conectividade. Responda apenas "OK".',
        "",
        { maxTokens: 10 }
      );
      return result.content.toLowerCase().includes("ok");
    } catch (error) {
      console.error(`Provider ${provider} test failed:`, error);
      return false;
    }
  }
}

// Export individual providers for direct use if needed
export { OpenAIProvider, AnthropicProvider, GoogleProvider };
export type { OpenAIConfig, AnthropicConfig, GoogleConfig };
