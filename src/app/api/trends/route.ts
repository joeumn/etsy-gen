import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
    
    const trends = await db.trend.findMany({
      orderBy: { score: 'desc' },
      take: limit,
    });
    
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
