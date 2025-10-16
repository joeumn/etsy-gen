import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import getServerSession from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // For development, skip database update and return success
    // This allows onboarding to proceed with mock data
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Onboarding completion skipped in development mode'
      });
    }

    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Mark onboarding as complete
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      logError(error, 'OnboardingComplete');
      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    logError(error, 'OnboardingCompleteEndpoint');
    return NextResponse.json(
      { error: 'Onboarding completion failed' },
      { status: 500 }
    );
  }
}
