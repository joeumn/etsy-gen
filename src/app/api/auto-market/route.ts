import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { supabase } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (process.env.ENABLE_STAGE4_AUTOMARKET !== 'true') {
    return NextResponse.json({ message: 'Auto-market feature is not enabled.' });
  }
  console.log("Starting auto-market job...");
  try {
    const { data: products, error } = await supabase
      .from('product_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !products || products.length === 0) {
      return NextResponse.json({ message: 'No products to market.' });
    }
    const product = products[0];

    const aiProvider = await AIProviderFactory.getProvider();
    const marketingPrompt = `
      Create a short, engaging social media post for the following product to be posted on Twitter/X and Pinterest.
      Product:
      - Title: ${product.title}
      - Description: ${product.description}
      - Price: $${product.price}
      - URL: ${product.listing_url || `https://your-store.com/products/${product.id}`}
      Include relevant hashtags and a call to action. Return only the post content as a simple string.
    `;
    const postContent = await aiProvider.generateListingContent({
      title: product.title, description: marketingPrompt, tags: product.tags,
      price: product.price, category: product.category, seoKeywords: [],
    }, 'twitter');

    console.log(`Generated Post for ${product.title}:\n${postContent}`);
    await supabase.from('traffic_sources').insert({
      platform: 'twitter',
      post_url: `https://twitter.com/your-account/status/${Date.now()}`,
      impressions: 0, clicks: 0, conversions: 0,
    });
    return NextResponse.json({ message: 'Auto-market job executed successfully.', postContent });
  } catch (error) {
    console.error("Error in auto-market job:", error);
    return NextResponse.json({ error: 'Failed to execute auto-market job.' }, { status: 500 });
  }
}
