import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/db';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    
    const jobs = await prisma.job.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
