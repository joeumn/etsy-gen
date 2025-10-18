import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get marketplace performance from product listings
    const { data: listings, error } = await supabase
      .from('product_listings')
      .select('marketplace, status')
      .eq('user_id', userId);

    if (error) {
      console.error('Marketplace stats fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch marketplace data' }, { status: 500 });
    }

    // Calculate marketplace performance scores based on active listings
    const marketplaceCounts: Record<string, number> = {};
    listings?.forEach((listing) => {
      const marketplace = listing.marketplace || 'unknown';
      marketplaceCounts[marketplace] = (marketplaceCounts[marketplace] || 0) + 1;
    });

    // Calculate performance score (0-100) based on number of listings
    const maxListings = Math.max(...Object.values(marketplaceCounts), 1);
    const marketplaceData = Object.entries(marketplaceCounts).map(([marketplace, count]) => ({
      subject: marketplace.charAt(0).toUpperCase() + marketplace.slice(1),
      value: Math.round((count / maxListings) * 100),
    }));

    return NextResponse.json({ marketplaceData });
  } catch (error) {
    console.error('Dashboard marketplace stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
