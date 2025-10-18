import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Health Check Error: Supabase environment variables are missing.');
    return NextResponse.json(
      {
        status: 'Error',
        message: 'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set in the Vercel environment.',
        details: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey,
        }
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Perform a simple query to test the connection and credentials.
    // Fetching from the 'users' table is a good test.
    const { error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Health Check DB Error:', error);
      return NextResponse.json(
        {
          status: 'Error',
          message: 'Database connection failed. Check your credentials and network rules in Supabase.',
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'Success',
      message: 'Database connection is healthy.',
      userCount: count,
    });

  } catch (e: any) {
    console.error('Health Check Unexpected Error:', e);
    return NextResponse.json(
        {
            status: 'Error',
            message: 'An unexpected error occurred during the health check.',
            details: e.message
        },
        { status: 500 }
    );
  }
}