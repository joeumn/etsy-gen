import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentSummary, checkCriticalEnvVars, getFeatureFlagStatus, isVercel, isProduction } from '@/lib/env-check';

/**
 * Debug endpoint to check environment variable status
 * This should be disabled or protected in production
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with specific auth
  if (isProduction() && !process.env.ALLOW_DEBUG_ENDPOINTS) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const summary = getEnvironmentSummary();
    const critical = checkCriticalEnvVars();
    const features = getFeatureFlagStatus();

    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: isVercel(),
        isProduction: isProduction(),
      },
      summary: {
        total: summary.total,
        set: summary.set,
        missing: summary.missing,
        publicVars: summary.publicVars,
        privateVars: summary.privateVars,
      },
      critical: {
        isValid: critical.isValid,
        missing: critical.missing,
      },
      features,
      variables: summary.results.map((r: any) => ({
        name: r.name,
        isSet: r.isSet,
        isPublic: r.isPublic,
      })),
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
