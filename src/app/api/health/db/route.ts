import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/config/db';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    return NextResponse.json({
      ok: true,
      message: "Database connected successfully"
    });
  } catch (error: any) {
    console.error("Database health check failed:", error);
    return NextResponse.json({
      ok: false,
      error: error?.message || "Database connection failed",
      message: "Database offline - app will use mock data"
    }, { status: 500 });
  }
}
