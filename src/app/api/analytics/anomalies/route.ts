import { NextRequest, NextResponse } from 'next/server';
import { anomalyDetector } from '@/lib/analytics/anomaly';
import { supabase } from '@/lib/supabase/admin-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'revenue';
    const period = parseInt(searchParams.get('period') || '30');
    const method = searchParams.get('method') as 'zscore' | 'iqr' || 'zscore';
    const threshold = parseFloat(searchParams.get('threshold') || '2.0');
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

    // Validate method
    if (!['zscore', 'iqr'].includes(method)) {
      return NextResponse.json(
        { error: 'Method must be either "zscore" or "iqr"' },
        { status: 400 }
      );
    }

    // Validate threshold
    if (threshold < 0.5 || threshold > 5.0) {
      return NextResponse.json(
        { error: 'Threshold must be between 0.5 and 5.0' },
        { status: 400 }
      );
    }

    // Fetch historical data based on metric
    const historicalData = await getHistoricalData(userId, metric, period);

    if (historicalData.length < 10) {
      return NextResponse.json(
        { error: 'Insufficient historical data for anomaly detection' },
        { status: 400 }
      );
    }

    // Detect anomalies
    const result = await anomalyDetector.detectAnomalies(
      historicalData,
      method,
      threshold
    );

    // Get summary
    const summary = anomalyDetector.getAnomalySummary(result.anomalies);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        summary
      }
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to detect anomalies',
        success: false 
      },
      { status: 500 }
    );
  }
}

async function getHistoricalData(userId: string, metric: string, period: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  let query;
  
  switch (metric) {
    case 'revenue':
      query = supabase
        .from('earnings')
        .select('created_at, total_revenue as value')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      break;
    
    case 'orders':
      query = supabase
        .from('earnings')
        .select('created_at, total_sales as value')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      break;
    
    case 'conversion_rate':
      query = supabase
        .from('earnings')
        .select('created_at, conversion_rate as value')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      break;
    
    case 'aov':
      query = supabase
        .from('earnings')
        .select('created_at, average_order_value as value')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
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