import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { pricingOptimizer } from '@/lib/ai/pricing';
import { supabase } from '@/lib/db/client';

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

  // In a real scenario, we'd dynamically fetch this from /api/scan, /api/social-scan, etc.
  // For this implementation, we're using pre-researched trends to create a high-quality prompt.
  const trendContext = `
    Based on recent analysis for 2025, the following digital product niches are showing strong potential:
    1.  **Hyper-Personalization & Niche Planners**: Digital planners for specific needs (e.g., ADHD, freelancers, content creators) are outperforming generic planners.
    2.  **AI-Powered Tools for Non-Tech Users**: Templates and guides that help people use AI tools like ChatGPT or Midjourney more effectively are in high demand.
    3.  **Sustainability & Eco-Conscious Products**: Digital products that promote sustainable living, like guides to reducing waste or eco-friendly business plan templates.
    4.  **Minimalist & "Human-Centric" Design**: Templates (social media, websites, business cards) that feature clean, minimalist design with a focus on accessibility and user experience are trending.
    5.  **Self-Improvement & Wellness**: The demand for habit trackers, goal-setting worksheets, and digital journals continues to grow.
  `;

  const synthesisPrompt = `
    You are an AI Trend Analyst for a digital product business.
    Your goal is to generate 3 novel and highly marketable digital product ideas based on the provided trend context.
    For each idea, provide a brief description and the primary niche it targets.

    Context:
    ${trendContext}

    Return your response as a JSON object containing a single key "product_ideas", which is an array of objects, each with "productName", "description", and "niche".
    Example:
    {
      "product_ideas": [
        {
          "productName": "AI Prompt Engineering Kit for Etsy Sellers",
          "description": "A comprehensive pack of ChatGPT prompts and Midjourney templates designed to help Etsy sellers create better listings, product images, and marketing copy.",
          "niche": "AI for Creatives"
        }
      ]
    }
  `;

  const response = await aiProvider.generateListingContent({
    title: 'Trend Synthesis',
    description: synthesisPrompt,
    tags: [], price: 0, category: '', seoKeywords: []
  }, 'system');

  try {
    const parsedResponse = JSON.parse(response);
    return parsedResponse.product_ideas || [];
  } catch (error) {
    console.error("Failed to parse trend synthesis from AI:", error);
    return []; // Return an empty array on failure
  }
}


export async function GET(request: NextRequest) {
  // Secure the endpoint with a cron job secret
  const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.ENABLE_STAGE4_AUTOCREATE !== 'true') {
    return NextResponse.json({ message: 'Auto-create feature is not enabled.' });
  }

  console.log("Starting auto-create job...");

  try {
    // 1. Synthesize Trends to get Product Ideas
    const productIdeas = await synthesizeTrends();
    if (!productIdeas || productIdeas.length === 0) {
      console.log("No new product ideas generated.");
      return NextResponse.json({ message: 'No new product ideas generated.' });
    }

    // 2. Process the first product idea from the list
    const idea = productIdeas[0];
    console.log(`Generating product for idea: ${idea.productName}`);

    // 3. Generate Product Details
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

    // 4. Determine Optimal Price
    const priceRecommendation = await pricingOptimizer.getOptimalPrice({
      marketplace: 'etsy',
      category: product.category,
      currentPrice: product.price, // Use initial price as current
      salesData: [], // No sales data for a new product
      competitorPrices: [9.99, 12.99, 14.99] // Mock competitor data
    });

    product.price = priceRecommendation.newPrice;
    await supabase.from('pricing_history').insert({
        // In a real app, you'd have a product ID before this step
        // product_id: product.id, 
        old_price: 0,
        new_price: product.price,
        expected_delta: priceRecommendation.expectedRevenueDelta,
    });
    
    console.log(`Optimal price set to: $${product.price}`);

    // 5. List the Product on the Marketplace
    const listingResponse = await fetchApi('/api/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marketplace: 'etsy',
        product: product,
        publish: true
      })
    });
    
    console.log('Auto-create job executed successfully. Product listed:', listingResponse.data.listingId);
    return NextResponse.json({
      message: 'Auto-create job executed successfully.',
      productId: listingResponse.data.listingId
    });

  } catch (error) {
    console.error("Error in auto-create job:", error);
    return NextResponse.json({ error: 'Failed to execute auto-create job.' }, { status: 500 });
  }
}
