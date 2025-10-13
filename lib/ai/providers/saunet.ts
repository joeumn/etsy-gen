import axios from 'axios';
import { AIProvider, AIProviderConfig, GenerateProductRequest, GeneratedProduct, TrendData, TrendAnalysisResult } from '../IAIProvider';

export class SaunetProvider implements AIProvider {
  name = 'Saunet';
  isAvailable = false;
  private baseUrl = 'https://api.saunet.ai/v1';

  constructor(private config: AIProviderConfig) {
    this.isAvailable = !!config.apiKey;
  }

  async generateProduct(request: GenerateProductRequest): Promise<GeneratedProduct> {
    const prompt = this.buildProductPrompt(request);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.config.model || 'saunet-pro',
          messages: [
            {
              role: 'system',
              content: 'You are an expert digital product creator and marketplace analyst. Generate high-quality, marketable digital products based on trend data.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Saunet');
      }

      return this.parseProductResponse(content, request);
    } catch (error) {
      console.error('Saunet API error:', error);
      throw new Error('Failed to generate product with Saunet');
    }
  }

  async analyzeTrends(data: any[]): Promise<TrendData[]> {
    const prompt = `Analyze the following marketplace data and extract trending digital products. Return JSON format with trends array containing keywords, salesVelocity, priceRange, competitionLevel, seasonality, and targetAudience for each trend.

Data: ${JSON.stringify(data.slice(0, 100))}

Return only valid JSON.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.config.model || 'saunet-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a marketplace trend analyst. Analyze data and extract actionable insights about trending digital products.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Saunet');
      }

      const parsed = JSON.parse(content);
      return parsed.trends || [];
    } catch (error) {
      console.error('Saunet trend analysis error:', error);
      return [];
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'saunet-dall-e',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data[0]?.url || '';
    } catch (error) {
      console.error('Saunet image generation error:', error);
      return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`;
    }
  }

  async generateListingContent(product: GeneratedProduct, marketplace: string): Promise<string> {
    const prompt = `Generate optimized listing content for ${marketplace} marketplace:

Product: ${JSON.stringify(product)}

Include:
- SEO-optimized title
- Compelling description with benefits
- Relevant tags
- Call-to-action
- Marketplace-specific formatting

Return only the content, no explanations.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.config.model || 'saunet-pro',
          messages: [
            {
              role: 'system',
              content: 'You are an expert copywriter specializing in marketplace listings. Create compelling, SEO-optimized content.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || product.description;
    } catch (error) {
      console.error('Saunet listing generation error:', error);
      return product.description;
    }
  }

  private buildProductPrompt(request: GenerateProductRequest): string {
    const { trendData, productType, targetMarketplace, customPrompt } = request;
    
    return `Generate a new digital product for ${targetMarketplace} marketplace.

Product Type: ${productType}
Trend Data: ${JSON.stringify(trendData)}
${customPrompt ? `Custom Requirements: ${customPrompt}` : ''}

Create a product with:
- Compelling title (SEO optimized)
- Detailed description highlighting benefits
- Relevant tags for discovery
- Competitive pricing based on trend data
- Target category
- SEO keywords
- Product specifications

Return as JSON with keys: title, description, tags, price, category, seoKeywords, content, specifications`;
  }

  private parseProductResponse(text: string, request: GenerateProductRequest): GeneratedProduct {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || 'Generated Product',
        description: parsed.description || 'AI-generated digital product',
        tags: parsed.tags || [],
        price: parsed.price || 9.99,
        category: parsed.category || 'Digital Downloads',
        seoKeywords: parsed.seoKeywords || [],
        content: parsed.content || '',
        specifications: parsed.specifications || {},
      };
    } catch (error) {
      console.error('Failed to parse Saunet response:', error);
      
      return {
        title: `AI Generated ${request.productType.replace('_', ' ')}`,
        description: `High-quality digital ${request.productType.replace('_', ' ')} based on current trends.`,
        tags: request.trendData.keywords.slice(0, 5),
        price: request.trendData.priceRange.min + 5,
        category: 'Digital Downloads',
        seoKeywords: request.trendData.keywords,
        content: '',
        specifications: {},
      };
    }
  }
}