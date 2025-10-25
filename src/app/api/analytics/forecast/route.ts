import { NextRequest, NextResponse } from 'next/server';
import { forecastEngine } from '@/lib/analytics/forecast';
import { supabase } from '@/lib/supabase/admin-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'revenue';
    const period = parseInt(searchParams.get('period') || '30');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if analytics feature is enabled
    if (process.env.ENABLE_STAGE3_ANALYTICS !== 'true') {
      return NextResponse.json(
        { error: 'Analytics feature is not enabled' },
        { status: 403 }
      );
    }

    // Validate metric
    const validMetrics = ['revenue', 'orders', 'conversion_rate', 'aov'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate period
    if (period < 7 || period > 365) {
      return NextResponse.json(
        { error: 'Period must be between 7 and 365 days' },
        { status: 400 }
      );
    }

    // Fetch historical data based on metric
    const historicalData = await getHistoricalData(userId, metric);

    if (historicalData.length < 7) {
      return NextResponse.json(
        { error: 'Insufficient historical data for forecasting' },
        { status: 400 }
      );
    }

    // Generate forecast
    const forecast = await forecastEngine.forecastMetric(
      historicalData,
      metric as any,
      period
    );

    // Get insights
    const insights = forecastEngine.getForecastInsights(forecast);

    return NextResponse.json({
      success: true,
      data: {
        ...forecast,
        insights
      }
    });

  } catch (error) {
    console.error('Forecast error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate forecast',
        success: false 
      },
      { status: 500 }
    );
  }
}

async function getHistoricalData(userId: string, metric: string) {
  let query;
  
  switch (metric) {
    case 'revenue':
      query = supabase
        .from('earnings')
        .select('created_at, total_revenue as value')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      break;
    
    case 'orders':
      query = supabase
        .from('earnings')
        .select('created_at, total_sales as value')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      break;
    
    case 'conversion_rate':
      query = supabase
        .from('earnings')
        .select('created_at, conversion_rate as value')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      break;
    
    case 'aov':
      query = supabase
        .from('earnings')
        .select('created_at, average_order_value as value')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      break;
    
    default:
      throw new Error(`Unsupported metric: ${metric}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch historical data: ${error.message}`);
  }

  // Group by date and aggregate
  const groupedData = new Map<string, { date: string; value: number; count: number }>();
  
  data?.forEach((row: any) => {
    if (row && typeof row === 'object' && 'created_at' in row) {
      const date = row.created_at.split('T')[0];
      const existing = groupedData.get(date);
      
      if (existing) {
        existing.value += row.value;
        existing.count += 1;
      } else {
        groupedData.set(date, {
          date,
          value: row.value,
          count: 1
        });
      }
    }
  });

  // Convert to array and calculate averages where needed
  return Array.from(groupedData.values()).map(item => ({
    date: item.date,
    value: metric === 'conversion_rate' ? item.value / item.count : item.value
  }));
}