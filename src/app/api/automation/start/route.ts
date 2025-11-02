import { NextResponse } from "next/server";
import { productGenerator } from "@/lib/automation/product-generator";
import { logger } from "@/config/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/automation/start
 * Starts the full product generation automation pipeline
 */
export async function POST(request: Request) {
  try {
    logger.info("Starting automation pipeline via API");
    
    // Start the pipeline (this runs in background)
    const result = await productGenerator.runFullPipeline();
    
    return NextResponse.json({
      success: true,
      message: "Automation pipeline started",
      data: result,
    });
    
  } catch (error) {
    logger.error({ err: error }, "Failed to start automation");
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to start automation",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/automation/start
 * Check automation status
 */
export async function GET() {
  try {
    // Check if automation is currently running
    // This would check for active jobs in the database
    
    return NextResponse.json({
      success: true,
      status: "ready",
      message: "Automation system ready. Send POST request to start.",
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
