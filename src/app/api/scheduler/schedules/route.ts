import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';

/**
 * Scrape Scheduler API
 * Manages automated scraping schedules
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, marketplace, category, frequency, timeOfDay, dayOfWeek } = body;

    if (!userId || !name || !marketplace || !frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate next run time based on frequency
    const now = new Date();
    let nextRunAt = new Date(now);
    
    switch (frequency) {
      case 'hourly':
        nextRunAt.setHours(nextRunAt.getHours() + 1);
        break;
      case 'daily':
        nextRunAt.setDate(nextRunAt.getDate() + 1);
        if (timeOfDay) {
          const [hours, minutes] = timeOfDay.split(':');
          nextRunAt.setHours(parseInt(hours), parseInt(minutes), 0);
        }
        break;
      case 'weekly':
        nextRunAt.setDate(nextRunAt.getDate() + 7);
        if (dayOfWeek !== undefined) {
          const currentDay = nextRunAt.getDay();
          const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
          nextRunAt.setDate(nextRunAt.getDate() + daysUntilTarget);
        }
        break;
      case 'monthly':
        nextRunAt.setMonth(nextRunAt.getMonth() + 1);
        break;
    }

    const { data, error } = await supabase
      .from('scrape_schedules')
      .insert({
        user_id: userId,
        name,
        marketplace,
        category,
        frequency,
        time_of_day: timeOfDay,
        day_of_week: dayOfWeek,
        is_active: true,
        next_run_at: nextRunAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Scrape schedule created successfully',
      schedule: data,
    });
  } catch (error) {
    logError(error, 'ScrapeScheduler');
    const { response, statusCode } = handleAPIError(error, '/api/scheduler/schedules');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('scrape_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      schedules: data || [],
    });
  } catch (error) {
    logError(error, 'ScrapeScheduler');
    const { response, statusCode } = handleAPIError(error, '/api/scheduler/schedules');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, isActive } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('scrape_schedules')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Schedule ${isActive ? 'activated' : 'deactivated'} successfully`,
      schedule: data,
    });
  } catch (error) {
    logError(error, 'ScrapeScheduler');
    const { response, statusCode } = handleAPIError(error, '/api/scheduler/schedules');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('scrape_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    logError(error, 'ScrapeScheduler');
    const { response, statusCode } = handleAPIError(error, '/api/scheduler/schedules');
    return NextResponse.json(response, { status: statusCode });
  }
}
