import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get revenue data from the last 5 weeks
    const { data: revenueRecords, error } = await supabase
      .from('earnings')
      .select('period, total_revenue, profit, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Revenue fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
    }

    // Transform data for chart
    const revenueData = revenueRecords?.map((record, index) => ({
      name: `Week ${index + 1}`,
      revenue: record.total_revenue || 0,
      profit: record.profit || 0,
    })) || [];

    return NextResponse.json({ revenueData });
  } catch (error) {
    console.error('Dashboard revenue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
