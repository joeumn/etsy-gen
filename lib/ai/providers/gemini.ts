import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderConfig, GenerateProductRequest, GeneratedProduct, TrendData, TrendAnalysisResult } from '../IAIProvider';
import { AIProviderError } from '../../errors';
import { logError, logAIGeneration, logger } from '../../logger';
import { retry } from '../../performance';
import { cached, CACHE_TTL } from '../../cache';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';
  isAvailable = false;
  private client!: GoogleGenerativeAI;

  constructor(private config: AIProviderConfig) {
    try {
      this.client = new GoogleGenerativeAI(config.apiKey);
      this.isAvailable = !!config.apiKey;
      logger.info('Gemini provider initialized', { provider: 'Gemini' });
    } catch (error) {
      logError(error, 'GeminiProvider', { action: 'initialize' });
      this.isAvailable = false;
    }
  }

  async generateProduct(request: GenerateProductRequest): Promise<GeneratedProduct> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      throw new AIProviderError(
        'Gemini',
        'Gemini provider is not available. Please check your API key.'
      );
    }

    const model = this.client.getGenerativeModel({ 
      model: this.config.model || 'gemini-pro',
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        maxOutputTokens: this.config.maxTokens || 2000,
      },
    });
    
    const prompt = this.buildProductPrompt(request);
    
    try {
      // Retry with exponential backoff for transient failures
      const result = await retry(
        async () => await model.generateContent(prompt),
        { maxAttempts: 3, delay: 1000, backoff: true }
      );
      
      const response = await result.response;
      const text = response.text();
      
      const product = this.parseProductResponse(text, request);
      
      logAIGeneration(
        'Gemini',
        'generateProduct',
        true,
        Date.now() - startTime,
        { productType: request.productType }
      );
      
      return product;
    } catch (error) {
      logError(error, 'GeminiProvider', { action: 'generateProduct', request });
      logAIGeneration('Gemini', 'generateProduct', false, Date.now() - startTime);
      
      throw new AIProviderError(
        'Gemini',
        'Failed to generate product with Gemini. ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  async analyzeTrends(data: any[]): Promise<TrendData[]> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      throw new AIProviderError('Gemini', 'Gemini provider is not available');
    }

    const model = this.client.getGenerativeModel({ 
      model: this.config.model || 'gemini-pro',
      generationConfig: {
        temperature: 0.5, // Lower temperature for more factual analysis
        maxOutputTokens: this.config.maxTokens || 4000,
      },
    });
    
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
      const result = await retry(
        async () => await model.generateContent(prompt),
        { maxAttempts: 3, delay: 1000, backoff: true }
      );
      
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      const trends = parsed.trends || [];
      
      logAIGeneration(
        'Gemini',
        'analyzeTrends',
        true,
        Date.now() - startTime,
        { trendCount: trends.length }
      );
      
      return trends;
    } catch (error) {
      logError(error, 'GeminiProvider', { action: 'analyzeTrends' });
      logAIGeneration('Gemini', 'analyzeTrends', false, Date.now() - startTime);
      
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // For now, return a placeholder. In production, you'd use Gemini's image generation
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`;
  }

  async generateListingContent(product: GeneratedProduct, marketplace: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      logger.warn('Gemini unavailable, using product description', { provider: 'Gemini' });
      return product.description;
    }

    const model = this.client.getGenerativeModel({ 
      model: this.config.model || 'gemini-pro',
      generationConfig: {
        temperature: this.config.temperature || 0.8, // Higher creativity for marketing
        maxOutputTokens: 1500,
      },
    });
    
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
      const result = await retry(
        async () => await model.generateContent(prompt),
        { maxAttempts: 2, delay: 500 }
      );
      
      const response = await result.response;
      const content = response.text();
      
      logAIGeneration(
        'Gemini',
        'generateListingContent',
        true,
        Date.now() - startTime,
        { marketplace }
      );
      
      return content;
    } catch (error) {
      logError(error, 'GeminiProvider', { action: 'generateListingContent', marketplace });
      logAIGeneration('Gemini', 'generateListingContent', false, Date.now() - startTime);
      
      // Fallback to product description
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
      // Extract JSON from response
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
      console.error('Failed to parse Gemini response:', error);
      
      // Fallback product
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