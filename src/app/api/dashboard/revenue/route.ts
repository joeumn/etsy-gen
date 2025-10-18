import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        userId = decoded.split(':')[0];
      } catch {
        // If token decode fails, continue without userId
      }
    }

    // If no userId from auth header, try to get from query params
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
