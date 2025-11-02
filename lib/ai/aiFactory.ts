import { AIProvider, AIProviderConfig } from './IAIProvider';
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