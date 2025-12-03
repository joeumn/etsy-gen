import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    
    const jobs = await db.job.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { created_at: 'desc' },
      take: 20,
    });
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
