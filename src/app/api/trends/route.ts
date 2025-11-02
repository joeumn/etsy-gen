import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/db';

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
    
    const trends = await prisma.trend.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { score: 'desc' },
      take: limit,
    });
    
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
