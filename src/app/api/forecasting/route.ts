import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';

/**
 * Forecasting API
 * Manages AI-powered forecasting and predictions
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, forecastType, targetDate, predictedValue, confidenceIntervalLow, confidenceIntervalHigh, metadata } = body;

    if (!userId || !forecastType || !targetDate || !predictedValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('forecasts')
      .insert({
        user_id: userId,
        forecast_type: forecastType,
        target_date: targetDate,
        predicted_value: predictedValue,
        confidence_interval_low: confidenceIntervalLow,
        confidence_interval_high: confidenceIntervalHigh,
        model_version: 'v1.0',
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Forecast created successfully',
      forecast: data,
    });
  } catch (error) {
    logError(error, 'Forecasting');
    const { response, statusCode } = handleAPIError(error, '/api/forecasting');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const forecastType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('forecasts')
      .select('*')
      .eq('user_id', userId);

    if (forecastType) {
      query = query.eq('forecast_type', forecastType);
    }

    if (startDate) {
      query = query.gte('target_date', startDate);
    }

    if (endDate) {
      query = query.lte('target_date', endDate);
    }

    query = query.order('target_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      forecasts: data || [],
    });
  } catch (error) {
    logError(error, 'Forecasting');
    const { response, statusCode } = handleAPIError(error, '/api/forecasting');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { forecastId, actualValue } = body;

    if (!forecastId || actualValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Forecast ID and actual value are required' },
        { status: 400 }
      );
    }

    // Get the forecast to calculate accuracy
    const { data: forecast, error: fetchError } = await supabase
      .from('forecasts')
      .select('predicted_value')
      .eq('id', forecastId)
      .single();

    if (fetchError || !forecast) {
      throw fetchError || new Error('Forecast not found');
    }

    // Calculate accuracy score (percentage difference)
    const predictedValue = parseFloat(forecast.predicted_value);
    const actualVal = parseFloat(actualValue);
    const accuracyScore = 100 - Math.abs((predictedValue - actualVal) / actualVal * 100);

    const { data, error } = await supabase
      .from('forecasts')
      .update({
        actual_value: actualValue,
        accuracy_score: accuracyScore.toFixed(2),
      })
      .eq('id', forecastId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Forecast updated with actual value',
      forecast: data,
    });
  } catch (error) {
    logError(error, 'Forecasting');
    const { response, statusCode } = handleAPIError(error, '/api/forecasting');
    return NextResponse.json(response, { status: statusCode });
  }
}
