import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header or query params
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        userId = decoded.split(':')[0];
      } catch {
        // Continue without userId
      }
    }

    if (!userId) {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId');
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get generated products
    const { data: generatedProducts, error: productsError } = await supabase
      .from('generated_products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Get product listings
    const { data: listings, error: listingsError } = await supabase
      .from('product_listings')
      .select('*')
      .eq('user_id', userId);

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
    }

    // Get earnings
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', userId);

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError);
    }

    // Map listings to products
    const listingsByProductId: Record<string, any[]> = {};
    if (listings) {
      listings.forEach((listing: any) => {
        if (!listingsByProductId[listing.generated_product_id]) {
          listingsByProductId[listing.generated_product_id] = [];
        }
        listingsByProductId[listing.generated_product_id].push(listing);
      });
    }

    // Map earnings to listings
    const earningsByListingId: Record<string, any> = {};
    if (earnings) {
      earnings.forEach((earning: any) => {
        if (!earningsByListingId[earning.listing_id]) {
          earningsByListingId[earning.listing_id] = {
            sales: 0,
            revenue: 0,
          };
        }
        earningsByListingId[earning.listing_id].sales += earning.total_sales || 0;
        earningsByListingId[earning.listing_id].revenue += earning.total_revenue || 0;
      });
    }

    // Build product list with aggregated data
    const products = (generatedProducts || []).map((product: any) => {
      const productListings = listingsByProductId[product.id] || [];
      
      let totalSales = 0;
      let totalRevenue = 0;
      const marketplaces: string[] = [];
      
      productListings.forEach((listing: any) => {
        if (!marketplaces.includes(listing.marketplace)) {
          marketplaces.push(listing.marketplace);
        }
        
        const listingEarnings = earningsByListingId[listing.id];
        if (listingEarnings) {
          totalSales += listingEarnings.sales;
          totalRevenue += listingEarnings.revenue;
        }
      });

      const status = productListings.some((l: any) => l.status === 'active') ? 'active' : 'draft';
      
      // Determine performance based on revenue
      let performance = 'low';
      if (totalRevenue > 5000) performance = 'high';
      else if (totalRevenue > 2000) performance = 'medium';

      return {
        id: product.id,
        title: product.title,
        category: product.category || 'Uncategorized',
        marketplace: marketplaces,
        price: product.price || 0,
        revenue: totalRevenue,
        sales: totalSales,
        status,
        performance,
        createdAt: product.created_at,
        aiProvider: product.ai_provider,
      };
    });

    // Calculate stats
    const totalProducts = products.length;
    const activeListings = listings?.filter((l: any) => l.status === 'active').length || 0;
    const totalRevenue = products.reduce((sum: number, p: any) => sum + p.revenue, 0);
    const avgPerformance = products.length > 0 
      ? (products.filter((p: any) => p.performance === 'high').length / products.length * 5).toFixed(1)
      : '0.0';

    const stats = {
      totalProducts,
      activeListings,
      totalRevenue,
      avgPerformance,
    };

    return NextResponse.json({ products, stats });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
