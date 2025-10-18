// /app/api/db-test/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  try {
    // A simple query to test the connection
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful!',
      data: data 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed.',
      error: error.message 
    }, { status: 500 })
  }
}
