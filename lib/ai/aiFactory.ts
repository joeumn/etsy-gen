import {
  AIProvider,
  AIProviderConfig,
  GenerateProductRequest,
  GeneratedProduct,
} from './IAIProvider';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AzureOpenAIProvider } from './providers/azureOpenAI';
import { AnthropicProvider } from './providers/anthropic';
import { SaunetProvider } from './providers/saunet';

export type AIProviderType = 'gemini' | 'openai' | 'azure' | 'anthropic' | 'saunet';

export class AIProviderFactory {
  private static providers: Map<AIProviderType, AIProvider> = new Map();

  static async getProvider(type: AIProviderType = 'gemini'): Promise<AIProvider> {
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    const config = this.getProviderConfig(type);
    let provider: AIProvider;

    switch (type) {
      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'azure':
        provider = new AzureOpenAIProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      case 'saunet':
        provider = new SaunetProvider(config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }

    this.providers.set(type, provider);
    return provider;
  }

  static getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];
    
    for (const type of ['gemini', 'openai', 'azure', 'anthropic', 'saunet'] as AIProviderType[]) {
      const config = this.getProviderConfig(type);
      if (config.apiKey) {
        available.push(type);
      }
    }
    
    return available;
  }

  private static getProviderConfig(type: AIProviderType): AIProviderConfig {
    const baseConfig: AIProviderConfig = {
      apiKey: '',
      temperature: 0.7,
      maxTokens: 2000,
    };

    switch (type) {
      case 'gemini':
        return {
          ...baseConfig,
          apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
          model: 'gemini-1.5-pro',
        };
      case 'openai':
        return {
          ...baseConfig,
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4',
        };
      case 'azure':
        return {
          ...baseConfig,
          apiKey: process.env.AZURE_OPENAI_API_KEY || '',
          baseUrl: process.env.AZURE_OPENAI_ENDPOINT || '',
          model: 'gpt-4',
        };
      case 'anthropic':
        return {
          ...baseConfig,
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: 'claude-3-sonnet-20240229',
        };
      case 'saunet':
        return {
          ...baseConfig,
          apiKey: process.env.SAUNET_API_KEY || '',
          model: 'saunet-pro',
        };
      default:
        return baseConfig;
    }
  }

  static async switchProvider(type: AIProviderType): Promise<AIProvider> {
    this.providers.clear();
    return this.getProvider(type);
  }
}

type CompetitionLevel = GenerateProductRequest['trendData']['competitionLevel'];

export type AIContentKind = 'product_generation';

export interface GenerateAIContentOptions {
  provider?: AIProviderType;
  type: AIContentKind;
  prompt?: string;
  trend: {
    keyword: string;
    searchVolume: number;
    competition?: string;
    avgPrice?: number;
  };
  productType?: GenerateProductRequest['productType'];
  marketplace?: GenerateProductRequest['targetMarketplace'];
}

export type NormalizedAIContent<TJson = unknown> =
  | { format: 'json'; json: TJson; text: string }
  | { format: 'text'; text: string };

const DEFAULT_PRICE_RANGE: GenerateProductRequest['trendData']['priceRange'] = {
  min: 5,
  max: 50,
};

function normalizeCompetition(value?: string): CompetitionLevel {
  if (!value) return 'medium';
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('low')) return 'low';
  if (normalized.includes('high')) return 'high';
  return 'medium';
}

function resolvePriceRange(avgPrice?: number): GenerateProductRequest['trendData']['priceRange'] {
  if (typeof avgPrice !== 'number' || Number.isNaN(avgPrice) || avgPrice <= 0) {
    return DEFAULT_PRICE_RANGE;
  }

  const safePrice = Math.max(1, avgPrice);
  const spread = Math.max(1, Math.round(safePrice * 0.2));
  return {
    min: Number(Math.max(1, safePrice - spread).toFixed(2)),
    max: Number(Math.max(safePrice + spread, safePrice + 1).toFixed(2)),
  };
}

function toProductRequest(
  options: GenerateAIContentOptions,
): GenerateProductRequest {
  const { trend, prompt, productType = 'digital_download', marketplace = 'etsy' } = options;

  return {
    trendData: {
      keywords: [trend.keyword],
      salesVelocity: Math.max(0, trend.searchVolume ?? 0),
      priceRange: resolvePriceRange(trend.avgPrice),
      competitionLevel: normalizeCompetition(trend.competition),
      seasonality: [],
      targetAudience: [],
    },
    productType,
    targetMarketplace: marketplace,
    customPrompt: prompt,
  } satisfies GenerateProductRequest;
}

export async function generateAIContent(
  options: GenerateAIContentOptions,
): Promise<NormalizedAIContent<GeneratedProduct>> {
  const providerType = options.provider ?? 'gemini';
  const provider = await AIProviderFactory.getProvider(providerType);

  if (!provider.isAvailable) {
    throw new Error(`AI provider ${providerType} is not available`);
  }

  switch (options.type) {
    case 'product_generation': {
      const request = toProductRequest(options);
      const product = await provider.generateProduct(request);
      return {
        format: 'json',
        json: product,
        text: JSON.stringify(product),
      } satisfies NormalizedAIContent<GeneratedProduct>;
    }
    default:
      throw new Error(`Unsupported AI content type: ${options.type}`);
  }
}
