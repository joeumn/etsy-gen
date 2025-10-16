// lib/ai/pricing.ts

import { AIProviderFactory } from './aiFactory';

interface PricingContext {
  marketplace: string;
  category: string;
  currentPrice: number;
  salesData: { date: string; unitsSold: number; revenue: number }[];
  competitorPrices: number[];
}

interface PriceRecommendation {
  newPrice: number;
  expectedRevenueDelta: number;
  confidence: number;
  reasoning: string;
}

export class PricingOptimizer {
  private static instance: PricingOptimizer;

  static getInstance(): PricingOptimizer {
    if (!PricingOptimizer.instance) {
      PricingOptimizer.instance = new PricingOptimizer();
    }
    return PricingOptimizer.instance;
  }

  async getOptimalPrice(context: PricingContext): Promise<PriceRecommendation> {
    const aiProvider = await AIProviderFactory.getProvider();

    const prompt = `
      Analyze the following pricing context and recommend an optimal price.

      Context:
      - Marketplace: ${context.marketplace}
      - Category: ${context.category}
      - Current Price: $${context.currentPrice.toFixed(2)}
      - Recent Sales Data: ${JSON.stringify(context.salesData.slice(-10))}
      - Competitor Prices: ${JSON.stringify(context.competitorPrices)}

      Based on this data, provide a new price to maximize revenue.
      Explain your reasoning and provide an estimated revenue delta and a confidence score (0-1).

      Return your response as a JSON object with the following structure:
      {
        "newPrice": number,
        "expectedRevenueDelta": number,
        "confidence": number,
        "reasoning": string
      }
    `;

    // In a real app, you would parse the response more robustly
    const responseText = await aiProvider.generateListingContent({
      title: 'Pricing Optimization',
      description: prompt,
      tags: [], price: 0, category: '', seoKeywords: [],
    }, 'system');
    
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response for pricing.');
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return parsedResponse;
    } catch (error) {
        console.error('Failed to parse pricing recommendation:', error);
        return {
            newPrice: context.currentPrice,
            expectedRevenueDelta: 0,
            confidence: 0,
            reasoning: 'Failed to get a valid recommendation from the AI model.'
        };
    }
  }
}

export const pricingOptimizer = PricingOptimizer.getInstance();
