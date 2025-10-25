import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real stats from database
    const [
      { data: revenueData },
      { count: productsCount },
      { data: successRate }
    ] = await Promise.all([
      // Total revenue (last 30 days)
      supabase
        .from('earnings')
        .select('total_revenue')
        .eq('user_id', userId)
        .eq('period', '30d')
        .single(),

      // Products listed
      supabase
        .from('product_listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      // Success rate (from AI generation logs)
      supabase
        .from('ai_generation_logs')
        .select('success')
        .eq('user_id', userId)
        .limit(100)
    ]);

    // Get active scrapes from database
    const { count: activeScrapesCount } = await supabase
      .from('scrape_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'running');

    const totalRevenue = revenueData?.total_revenue || 0;
    const productsListed = productsCount || 0;
    const activeScrapes = activeScrapesCount || 0;

    // Calculate success rate
    const totalGenerations = successRate?.length || 0;
    const successfulGenerations = successRate?.filter(log => log.success).length || 0;
    const successRatePercent = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;

    // Get trend data for revenue
    const { data: previousRevenue } = await supabase
      .from('earnings')
      .select('total_revenue')
      .eq('user_id', userId)
      .eq('period', '30d')
      .order('created_at', { ascending: false })
      .limit(2);

    let revenueTrend = 0;
    if (previousRevenue && previousRevenue.length >= 2) {
      const current = previousRevenue[0].total_revenue;
      const previous = previousRevenue[1].total_revenue;
      revenueTrend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    const stats = [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        description: "Last 30 days",
        trend: { value: Math.abs(revenueTrend), label: "vs previous", isPositive: revenueTrend >= 0 },
        icon: "DollarSign",
        gradient: "flame",
      },
      {
        title: "Products Listed",
        value: productsListed.toString(),
        description: "Across all platforms",
        trend: { value: 0, label: "this month", isPositive: true },
        icon: "Package",
        gradient: "ocean",
      },
      {
        title: "Active Scrapes",
        value: activeScrapes.toString(),
        description: "Running now",
        icon: "Activity",
        gradient: "gold",
      },
      {
        title: "Success Rate",
        value: `${successRatePercent.toFixed(1)}%`,
        description: "Conversion rate",
        trend: { value: 0, label: "vs previous", isPositive: true },
        icon: "Target",
        gradient: "forge",
      },
    ];

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
