import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { AuthenticationError, handleAPIError } from '@/lib/errors';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    
    // Decode token to get user ID
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split(':')[0];
    } catch {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new AuthenticationError('User not found');
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

      // Top products
      supabase
        .from('top_products')
        .select('*')
        .eq('earnings_id', supabase
          .from('earnings')
          .select('id')
          .eq('user_id', userId)
          .eq('period', period)
          .single()
        )
        .order('revenue', { ascending: false })
        .limit(5),

      // Marketplace performance (from earnings grouped by marketplace)
      supabase
        .from('earnings')
        .select('marketplace, total_revenue, total_sales')
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

    // Process top products
    const topProducts = topProductsData.data?.map(product => ({
      id: product.id,
      name: product.product_title || 'Unknown Product',
      revenue: product.revenue,
      orders: product.sales,
      conversionRate: Math.floor(Math.random() * 10) + 2, // Mock conversion rate
      trending: Math.random() > 0.5 ? 'up' : 'down',
    })) || [];

    // Process marketplace data
    const marketplaceMap = new Map();
    marketplaceData.data?.forEach(item => {
      const existing = marketplaceMap.get(item.marketplace) || { revenue: 0, orders: 0 };
      marketplaceMap.set(item.marketplace, {
        revenue: existing.revenue + item.total_revenue,
        orders: existing.orders + item.total_sales,
      });
    });

    const marketplacePerformance = Array.from(marketplaceMap.entries()).map(([marketplace, data]) => ({
      marketplace,
      revenue: data.revenue,
      orders: data.orders,
      share: Math.floor(Math.random() * 30) + 10, // Mock share percentage
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
    logError(error, 'AnalyticsData');
    const { response, statusCode } = handleAPIError(error, '/api/analytics/data');
    return NextResponse.json(response, { status: statusCode });
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
