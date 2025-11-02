import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/db';

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
    
    const listings = await prisma.listing.findMany({
      where: { status: { in: ['PUBLISHED', 'DRAFT'] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { product: { select: { title: true } } },
    });
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
