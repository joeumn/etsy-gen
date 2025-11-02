import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requiredEnvVars = [
      "DATABASE_URL",
      "GOOGLE_AI_API_KEY",
      "NEXTAUTH_SECRET",
    ];

    const configured = requiredEnvVars.filter(key => process.env[key]).length;

    return NextResponse.json({
      ok: true,
      configured,
      total: requiredEnvVars.length,
      message: `${configured}/${requiredEnvVars.length} environment variables configured`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to check environment" },
      { status: 500 }
    );
  }
}
