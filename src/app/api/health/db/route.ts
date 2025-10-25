import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase/admin-client';

export async function GET(_req: NextRequest) {
  const db = supabaseAdmin ?? supabase;
  try {
    const { error } = await db.from('users').select('count').limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
