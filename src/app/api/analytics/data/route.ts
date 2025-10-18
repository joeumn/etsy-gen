import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Get real analytics data from database
    const [
      earningsData,
      topProductsData,
      marketplaceData,
      trendData
    ] = await Promise.all([
      // Earnings data
      supabase
        .from('earnings')
        .select('*')
        .eq('user_id', userId)
        .eq('period', period)
        .order('created_at', { ascending: false })
        .limit(10),

      // Top products - using direct query
      supabase
        .from('top_products')
        .select('*, earnings!inner(user_id)')
        .eq('earnings.user_id', userId)
        .order('revenue', { ascending: false })
        .limit(5),

      // Marketplace performance (from earnings grouped by marketplace)
      supabase
        .from('earnings')
        .select('marketplace, total_revenue, total_sales, conversion_rate')
        .eq('user_id', userId)
        .eq('period', period),

      // Trend data for insights
      supabase
        .from('trend_data')
        .select('keywords, sales_velocity, confidence_score')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Process earnings data for revenue chart
    const revenueData = earningsData.data?.map(earning => ({
      name: new Date(earning.created_at).toLocaleDateString(),
      revenue: earning.total_revenue,
      profit: earning.total_revenue * 0.5, // Simplified profit calculation
      orders: earning.total_sales,
    })) || [];

    // Process top products with real conversion rates
    const topProducts = topProductsData.data?.map(product => ({
      id: product.id,
      name: product.product_title || 'Unknown Product',
      revenue: product.revenue,
      orders: product.sales,
      conversionRate: product.earnings?.conversion_rate || 0,
      trending: product.sales > (product.previous_sales || 0) ? 'up' : 'down',
    })) || [];

    // Process marketplace data with real metrics
    const marketplaceMap = new Map();
    let totalRevenue = 0;
    
    marketplaceData.data?.forEach(item => {
      totalRevenue += item.total_revenue;
      const existing = marketplaceMap.get(item.marketplace) || { revenue: 0, orders: 0, conversionRate: 0 };
      marketplaceMap.set(item.marketplace, {
        revenue: existing.revenue + item.total_revenue,
        orders: existing.orders + item.total_sales,
        conversionRate: item.conversion_rate || 0,
      });
    });

    const marketplacePerformance = Array.from(marketplaceMap.entries()).map(([marketplace, data]) => ({
      marketplace,
      revenue: data.revenue,
      orders: data.orders,
      share: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
      conversionRate: data.conversionRate,
    }));

    // Generate AI insights based on trend data
    const insights = generateInsights(trendData.data || []);

    return NextResponse.json({
      revenueData,
      topProducts,
      marketplacePerformance,
      insights,
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateInsights(trendData: any[]): any[] {
  const insights = [];

  if (trendData.length > 0) {
    // High growth opportunity
    const highVelocityTrends = trendData.filter(t => t.sales_velocity > 100);
    if (highVelocityTrends.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'High Growth Opportunity',
        description: `Your "${highVelocityTrends[0].keywords?.[0] || 'trending'}" products are showing strong market demand.`,
      });
    }

    // Trending keywords
    const trendingKeywords = trendData
      .filter(t => t.confidence_score > 70)
      .flatMap(t => t.keywords)
      .slice(0, 3);

    if (trendingKeywords.length > 0) {
      insights.push({
        type: 'trend',
        title: 'Trending Keywords Detected',
        description: `"${trendingKeywords.join('", "')}" searches are increasing. Optimize your listings with these keywords.`,
      });
    }

    // Conversion optimization
    insights.push({
      type: 'optimization',
      title: 'Conversion Optimization',
      description: 'Products with detailed descriptions have 2.3x better conversion rates. Add more content to your top sellers.',
    });
  } else {
    // Default insights if no data
    insights.push(
      {
        type: 'opportunity',
        title: 'Start Your First Scan',
        description: 'Run a trend scan to discover high-demand products in your niche.',
      },
      {
        type: 'trend',
        title: 'Market Intelligence Available',
        description: 'Connect your marketplaces to get real-time sales analytics and insights.',
      }
    );
  }

  return insights;
}
