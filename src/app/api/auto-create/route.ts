import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { pricingOptimizer } from '@/lib/ai/pricing';
import { supabase } from '@/lib/supabase/admin-client';

// Helper function to call internal APIs
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call to ${url} failed with status ${response.status}: ${errorText}`);
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching API endpoint ${url}:`, error);
    throw error;
  }
}

async function synthesizeTrends() {
  const aiProvider = await AIProviderFactory.getProvider();
  const trendContext = `
    Based on recent analysis for 2025, the following digital product niches are showing strong potential:
    1.  **Hyper-Personalization & Niche Planners**: Digital planners for specific needs (e.g., ADHD, freelancers, content creators) are outperforming generic planners.
    2.  **AI-Powered Tools for Non-Tech Users**: Templates and guides that help people use AI tools like ChatGPT or Midjourney more effectively are in high demand.
    3.  **Sustainability & Eco-Conscious Products**: Digital products that promote sustainable living, like guides to reducing waste or eco-friendly business plan templates.
    4.  **Minimalist & "Human-Centric" Design**: Templates (social media, websites, business cards) that feature clean, minimalist design with a focus on accessibility and user experience are trending.
    5.  **Self-Improvement & Wellness**: The demand for habit trackers, goal-setting worksheets, and digital journals continues to grow.
  `;
  const synthesisPrompt = `
    You are an AI Trend Analyst. Your goal is to generate 3 novel and marketable digital product ideas based on the provided trend context.
    Return a JSON object with a key "product_ideas", which is an array of objects, each with "productName", "description", and "niche".
  `;
  const responseText = await aiProvider.generateListingContent({
      title: 'Trend Synthesis', description: synthesisPrompt, tags: [], price: 0, category: '', seoKeywords: []
  }, 'system');
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response for trends.');
    const parsedResponse = JSON.parse(jsonMatch[0]);
    return parsedResponse.product_ideas || [];
  } catch (error) {
    console.error("Failed to parse trend synthesis from AI:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (process.env.ENABLE_STAGE4_AUTOCREATE !== 'true') {
    return NextResponse.json({ message: 'Auto-create feature is not enabled.' });
  }
  console.log("Starting auto-create job...");
  try {
    const productIdeas = await synthesizeTrends();
    if (!productIdeas || productIdeas.length === 0) {
      return NextResponse.json({ message: 'No new product ideas generated.' });
    }
    const idea = productIdeas[0];
    console.log(`Generating product for idea: ${idea.productName}`);
    const generatedProductData = await fetchApi('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trendData: { keywords: idea.niche.split(' '), salesVelocity: 100, priceRange: { min: 5, max: 25 }, competitionLevel: 'medium', seasonality: [], targetAudience: [] },
        productType: 'template',
        targetMarketplace: 'etsy',
        customPrompt: `Based on the product idea "${idea.productName}" (${idea.description}), generate a full product listing.`
      })
    });
    const product = generatedProductData.data.product;
    const priceRecommendation = await pricingOptimizer.getOptimalPrice({
      marketplace: 'etsy',
      category: product.category,
      currentPrice: product.price,
      salesData: [],
      competitorPrices: [9.99, 12.99, 14.99]
    });
    product.price = priceRecommendation.newPrice;
    // Note: This endpoint needs product.user_id from the generated product
    // Ensure user_id is available from the product data returned by /api/generate
    if (product.user_id) {
      await supabase.from('pricing_history').insert({
          user_id: product.user_id,
          product_id: product.id,
          old_price: 0,
          new_price: product.price,
          expected_delta: priceRecommendation.expectedRevenueDelta,
      });
    }
    console.log(`Optimal price set to: $${product.price}`);
    const listingResponse = await fetchApi('/api/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace: 'etsy', product, publish: true })
    });
    console.log('Auto-create job executed successfully. Product listed:', listingResponse.data.listingId);
    return NextResponse.json({ message: 'Auto-create job executed successfully.', productId: listingResponse.data.listingId });
  } catch (error) {
    console.error("Error in auto-create job:", error);
    return NextResponse.json({ error: 'Failed to execute auto-create job.' }, { status: 500 });
  }
}
