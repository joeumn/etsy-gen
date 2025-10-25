import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import { formatDistanceToNow } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent product listings
    const { data: recentListings } = await supabase
      .from('product_listings')
      .select('id, title, marketplace, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent AI generations
    const { data: recentGenerations } = await supabase
      .from('ai_generation_logs')
      .select('id, prompt, created_at, success')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent scrape jobs
    const { data: recentScrapes } = await supabase
      .from('scrape_jobs')
      .select('id, marketplace, status, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine and sort all activities
    const allActivities = [
      ...(recentListings?.map((listing) => ({
        id: `listing-${listing.id}`,
        action: 'Product Listed',
        product: listing.title || 'Untitled Product',
        marketplace: listing.marketplace?.charAt(0).toUpperCase() + listing.marketplace?.slice(1) || 'Unknown',
        time: formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }),
        status: listing.status === 'active' ? 'success' : 'pending',
        timestamp: new Date(listing.created_at).getTime(),
      })) || []),
      ...(recentGenerations?.map((gen) => ({
        id: `generation-${gen.id}`,
        action: 'AI Generation',
        product: gen.prompt?.substring(0, 30) || 'Content Generated',
        marketplace: 'AI Studio',
        time: formatDistanceToNow(new Date(gen.created_at), { addSuffix: true }),
        status: gen.success ? 'success' : 'error',
        timestamp: new Date(gen.created_at).getTime(),
      })) || []),
      ...(recentScrapes?.map((scrape) => ({
        id: `scrape-${scrape.id}`,
        action: 'Trend Scan Completed',
        product: scrape.marketplace?.charAt(0).toUpperCase() + scrape.marketplace?.slice(1) || 'Unknown',
        marketplace: scrape.marketplace?.charAt(0).toUpperCase() + scrape.marketplace?.slice(1) || 'Unknown',
        time: formatDistanceToNow(new Date(scrape.completed_at || scrape.created_at), { addSuffix: true }),
        status: scrape.status === 'completed' ? 'success' : scrape.status === 'failed' ? 'error' : 'pending',
        timestamp: new Date(scrape.completed_at || scrape.created_at).getTime(),
      })) || []),
    ];

    // Sort by timestamp and take the 10 most recent
    const recentActivity = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(({ timestamp, ...activity }) => activity); // Remove timestamp from final output

    return NextResponse.json({ recentActivity });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
