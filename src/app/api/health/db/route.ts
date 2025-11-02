import { NextResponse } from 'next/server';
import { prisma } from '@/config/db';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try to connect to database
    await prisma.$connect();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
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
