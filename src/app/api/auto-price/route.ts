import { NextRequest, NextResponse } from 'next/server';
import { pricingOptimizer } from '@/lib/ai/pricing';
import { supabase } from '@/lib/supabase/admin-client';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call to ${url} failed: ${errorText}`);
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching API endpoint ${url}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (process.env.ENABLE_STAGE4_AUTOPRICING !== 'true') {
    return NextResponse.json({ message: 'Auto-pricing feature is not enabled.' });
  }
  console.log("Starting auto-price job...");
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    // Fetch products with user_id for multi-tenant tracking
    const { data: products, error: productsError } = await supabase
      .from('product_listings')
      .select('*, user_id')
      .eq('status', 'active')
      .lt('created_at', thirtyDaysAgo);

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products eligible for repricing.' });
    }

    for (const product of products) {
      console.log(`Analyzing price for product: ${product.title}`);
      const { data: salesData, error: salesError } = await supabase
        .from('earnings')
        .select('created_at, total_sales, total_revenue')
        .eq('listing_id', product.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (salesError) {
        console.error(`Could not fetch sales data for product ${product.id}:`, salesError);
        continue;
      }

      const recommendation = await pricingOptimizer.getOptimalPrice({
        marketplace: product.marketplace,
        category: product.category,
        currentPrice: product.price,
        salesData: salesData.map(s => ({ date: s.created_at, unitsSold: s.total_sales, revenue: s.total_revenue })),
        competitorPrices: [product.price * 0.8, product.price * 1.2, product.price * 1.5]
      });

      if (recommendation.newPrice.toFixed(2) !== product.price.toFixed(2)) {
        console.log(`Updating price for ${product.title} from $${product.price} to $${recommendation.newPrice}`);
        await fetchApi('/api/list', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            marketplace: product.marketplace,
            listingId: product.external_id,
            product: { price: recommendation.newPrice }
          })
        });
        // Insert with user_id for multi-tenant tracking
        await supabase.from('pricing_history').insert({
          user_id: product.user_id,
          product_id: product.id,
          old_price: product.price,
          new_price: recommendation.newPrice,
          expected_delta: recommendation.expectedRevenueDelta,
        });
      } else {
        console.log(`Price for ${product.title} remains optimal. No change needed.`);
      }
    }
    return NextResponse.json({ message: 'Auto-price job executed successfully.' });
  } catch (error) {
    console.error("Error in auto-price job:", error);
    return NextResponse.json({ error: 'Failed to execute auto-price job.' }, { status: 500 });
  }
}
