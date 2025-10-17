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

    // Get user's marketplace connections from settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('marketplace_connections')
      .eq('user_id', userId)
      .single();

    // Get product listings by marketplace
    const { data: listings, error: listingsError } = await supabase
      .from('product_listings')
      .select('*')
      .eq('user_id', userId);

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
    }

    // Get earnings by marketplace
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', userId);

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError);
    }

    // Aggregate data by marketplace
    const marketplaceData: Record<string, any> = {};
    
    // Process listings
    if (listings) {
      listings.forEach((listing: any) => {
        const mp = listing.marketplace.toLowerCase();
        if (!marketplaceData[mp]) {
          marketplaceData[mp] = {
            products: 0,
            sales: 0,
            revenue: 0,
            lastSync: listing.updated_at,
          };
        }
        marketplaceData[mp].products += 1;
        if (listing.updated_at > marketplaceData[mp].lastSync) {
          marketplaceData[mp].lastSync = listing.updated_at;
        }
      });
    }

    // Process earnings
    if (earnings) {
      earnings.forEach((earning: any) => {
        const mp = earning.marketplace.toLowerCase();
        if (!marketplaceData[mp]) {
          marketplaceData[mp] = {
            products: 0,
            sales: 0,
            revenue: 0,
            lastSync: earning.created_at,
          };
        }
        marketplaceData[mp].sales += earning.total_sales || 0;
        marketplaceData[mp].revenue += earning.total_revenue || 0;
      });
    }

    // Get marketplace connections status
    const connections = settings?.marketplace_connections || {};

    // Build response with all marketplaces
    const marketplaces = [
      {
        name: 'Etsy',
        icon: '🎨',
        status: connections.etsy?.connected ? 'connected' : 'available',
        products: marketplaceData.etsy?.products || 0,
        revenue: marketplaceData.etsy?.revenue || 0,
        sales: marketplaceData.etsy?.sales || 0,
        lastSync: marketplaceData.etsy?.lastSync || 'Never',
        syncProgress: connections.etsy?.connected ? 100 : 0,
        apiHealth: connections.etsy?.connected ? 'healthy' : 'not_connected',
      },
      {
        name: 'Shopify',
        icon: '🛍️',
        status: connections.shopify?.connected ? 'connected' : 'available',
        products: marketplaceData.shopify?.products || 0,
        revenue: marketplaceData.shopify?.revenue || 0,
        sales: marketplaceData.shopify?.sales || 0,
        lastSync: marketplaceData.shopify?.lastSync || 'Never',
        syncProgress: connections.shopify?.connected ? 100 : 0,
        apiHealth: connections.shopify?.connected ? 'healthy' : 'not_connected',
      },
      {
        name: 'Amazon',
        icon: '📦',
        status: connections.amazon?.connected ? 'connected' : 'available',
        products: marketplaceData.amazon?.products || 0,
        revenue: marketplaceData.amazon?.revenue || 0,
        sales: marketplaceData.amazon?.sales || 0,
        lastSync: marketplaceData.amazon?.lastSync || 'Never',
        syncProgress: connections.amazon?.connected ? 100 : 0,
        apiHealth: connections.amazon?.connected ? 'healthy' : 'not_connected',
      },
      {
        name: 'Gumroad',
        icon: '💰',
        status: 'available',
        products: marketplaceData.gumroad?.products || 0,
        revenue: marketplaceData.gumroad?.revenue || 0,
        sales: marketplaceData.gumroad?.sales || 0,
        lastSync: 'Never',
        syncProgress: 0,
        apiHealth: 'not_connected',
      },
    ];

    // Calculate totals
    const stats = {
      connectedPlatforms: marketplaces.filter(m => m.status === 'connected').length,
      totalSales: marketplaces.reduce((sum, m) => sum + m.sales, 0),
      totalRevenue: marketplaces.reduce((sum, m) => sum + m.revenue, 0),
      syncStatus: marketplaces.every(m => m.status !== 'connected' || m.syncProgress === 100) ? 100 : 0,
    };

    return NextResponse.json({ marketplaces, stats });
  } catch (error) {
    console.error('Marketplaces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
