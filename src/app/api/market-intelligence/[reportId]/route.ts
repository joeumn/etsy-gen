// /app/api/market-intelligence/[reportId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMarketReport, deleteMarketReport } from '@/lib/ai/intelligence';

// GET: Retrieve a specific market report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const report = await getMarketReport(reportId, userId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Market Intelligence API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch market report',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific market report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await deleteMarketReport(reportId, userId);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error: any) {
    console.error('Market Intelligence API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete market report',
      },
      { status: 500 }
    );
  }
}
