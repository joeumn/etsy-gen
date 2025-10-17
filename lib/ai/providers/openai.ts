import OpenAI from 'openai';
import { AIProvider, AIProviderConfig, GenerateProductRequest, GeneratedProduct, TrendData, TrendAnalysisResult } from '../IAIProvider';
import { AIProviderError } from '../../errors';
import { logError, logAIGeneration, logger } from '../../logger';
import { retry } from '../../performance';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  isAvailable = false;
  private client!: OpenAI;

  constructor(private config: AIProviderConfig) {
    try {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
      this.isAvailable = !!config.apiKey;
      logger.info('OpenAI provider initialized', { provider: 'OpenAI' });
    } catch (error) {
      logError(error, 'OpenAIProvider', { action: 'initialize' });
      this.isAvailable = false;
    }
  }

  async generateProduct(request: GenerateProductRequest): Promise<GeneratedProduct> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      throw new AIProviderError(
        'OpenAI',
        'OpenAI provider is not available. Please check your API key.'
      );
    }

    const prompt = this.buildProductPrompt(request);
    
    try {
      const completion = await retry(
        async () => await this.client.chat.completions.create({
          model: this.config.model || 'gpt-4',
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
        }),
        { maxAttempts: 3, delay: 1000, backoff: true }
      );

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AIProviderError('OpenAI', 'No response from OpenAI');
      }

      const product = this.parseProductResponse(response, request);
      
      logAIGeneration(
        'OpenAI',
        'generateProduct',
        true,
        Date.now() - startTime,
        { productType: request.productType, model: this.config.model }
      );

      return product;
    } catch (error) {
      logError(error, 'OpenAIProvider', { action: 'generateProduct', request });
      logAIGeneration('OpenAI', 'generateProduct', false, Date.now() - startTime);
      
      throw new AIProviderError(
        'OpenAI',
        'Failed to generate product with OpenAI. ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  async analyzeTrends(data: any[]): Promise<TrendData[]> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      throw new AIProviderError('OpenAI', 'OpenAI provider is not available');
    }

    const prompt = `Analyze the following marketplace data and extract trending digital products. Return JSON format with trends array containing keywords, salesVelocity, priceRange, competitionLevel, seasonality, and targetAudience for each trend.

Data: ${JSON.stringify(data.slice(0, 100))}

Return only valid JSON with this structure:
{
  "trends": [
    {
      "keywords": ["keyword1", "keyword2"],
      "salesVelocity": 0-100,
      "priceRange": {"min": 0, "max": 0},
      "competitionLevel": "low|medium|high",
      "seasonality": ["season1"],
      "targetAudience": ["audience1"]
    }
  ]
}`;

    try {
      const completion = await retry(
        async () => await this.client.chat.completions.create({
          model: this.config.model || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a marketplace trend analyst. Analyze data and extract actionable insights about trending digital products. Always return valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
        { maxAttempts: 3, delay: 1000, backoff: true }
      );

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AIProviderError('OpenAI', 'No response from OpenAI');
      }

      const parsed = JSON.parse(response);
      const trends = parsed.trends || [];
      
      logAIGeneration(
        'OpenAI',
        'analyzeTrends',
        true,
        Date.now() - startTime,
        { trendCount: trends.length }
      );
      
      return trends;
    } catch (error) {
      logError(error, 'OpenAIProvider', { action: 'analyzeTrends' });
      logAIGeneration('OpenAI', 'analyzeTrends', false, Date.now() - startTime);
      return [];
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      logger.warn('OpenAI unavailable for image generation', { provider: 'OpenAI' });
      return `https://via.placeholder.com/1024x1024/FF6B22/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 50))}`;
    }

    try {
      const response = await retry(
        async () => await this.client.images.generate({
          model: 'dall-e-3',
          prompt: prompt.substring(0, 4000), // DALL-E has a 4000 char limit
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
        { maxAttempts: 2, delay: 2000 }
      );

      const imageUrl = response.data?.[0]?.url || '';
      
      logAIGeneration(
        'OpenAI',
        'generateImage',
        true,
        Date.now() - startTime,
        { model: 'dall-e-3' }
      );
      
      return imageUrl;
    } catch (error) {
      logError(error, 'OpenAIProvider', { action: 'generateImage', prompt: prompt.substring(0, 100) });
      logAIGeneration('OpenAI', 'generateImage', false, Date.now() - startTime);
      return `https://via.placeholder.com/1024x1024/FF6B22/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 50))}`;
    }
  }

  async generateListingContent(product: GeneratedProduct, marketplace: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      logger.warn('OpenAI unavailable, using product description', { provider: 'OpenAI' });
      return product.description;
    }

    const prompt = `Generate optimized listing content for ${marketplace} marketplace:

Product: ${JSON.stringify(product)}

Requirements:
- SEO-optimized title (max 140 characters)
- Compelling description with benefits and features
- Use emotional triggers and value propositions
- Include call-to-action
- ${marketplace === 'etsy' ? 'Artistic and handmade focus' : ''}
- ${marketplace === 'amazon' ? 'Professional and feature-rich' : ''}
- ${marketplace === 'shopify' ? 'Brand story and quality emphasis' : ''}

Return only the formatted content, no explanations or metadata.`;

    try {
      const completion = await retry(
        async () => await this.client.chat.completions.create({
          model: this.config.model || 'gpt-4',
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
          temperature: 0.8, // Higher creativity for marketing copy
          max_tokens: 1000,
        }),
        { maxAttempts: 2, delay: 1000 }
      );

      const content = completion.choices[0]?.message?.content || product.description;
      
      logAIGeneration(
        'OpenAI',
        'generateListingContent',
        true,
        Date.now() - startTime,
        { marketplace }
      );

      return content;
    } catch (error) {
      logError(error, 'OpenAIProvider', { action: 'generateListingContent', marketplace });
      logAIGeneration('OpenAI', 'generateListingContent', false, Date.now() - startTime);
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
      console.error('Failed to parse OpenAI response:', error);
      
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