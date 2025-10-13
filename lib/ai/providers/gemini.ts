import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderConfig, GenerateProductRequest, GeneratedProduct, TrendData, TrendAnalysisResult } from '../IAIProvider';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';
  isAvailable = false;
  private client: GoogleGenerativeAI;

  constructor(private config: AIProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.isAvailable = !!config.apiKey;
  }

  async generateProduct(request: GenerateProductRequest): Promise<GeneratedProduct> {
    const model = this.client.getGenerativeModel({ model: this.config.model || 'gemini-pro' });
    
    const prompt = this.buildProductPrompt(request);
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseProductResponse(text, request);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate product with Gemini');
    }
  }

  async analyzeTrends(data: any[]): Promise<TrendData[]> {
    const model = this.client.getGenerativeModel({ model: this.config.model || 'gemini-pro' });
    
    const prompt = `Analyze the following marketplace data and extract trending digital products. Return JSON format with trends array containing keywords, salesVelocity, priceRange, competitionLevel, seasonality, and targetAudience for each trend.

Data: ${JSON.stringify(data.slice(0, 100))}

Return only valid JSON.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = JSON.parse(text);
      return parsed.trends || [];
    } catch (error) {
      console.error('Gemini trend analysis error:', error);
      return [];
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // For now, return a placeholder. In production, you'd use Gemini's image generation
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`;
  }

  async generateListingContent(product: GeneratedProduct, marketplace: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.config.model || 'gemini-pro' });
    
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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini listing generation error:', error);
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