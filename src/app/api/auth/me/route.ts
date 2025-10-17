import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { AuthenticationError, handleAPIError } from '@/lib/errors';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    
    // Decode token (in production, use proper JWT verification)
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split(':')[0];
    } catch {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Check if using mock auth
    if (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL) {
      // Simple mock token verification for development
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const userId = decoded.split(':')[0];

        if (userId === 'test-user-id') {
          return NextResponse.json({
            success: true,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
              avatar_url: null,
              is_active: true,
              email_verified: true,
              created_at: new Date().toISOString(),
              usage: null, // Mock users don't have usage data
            },
          });
        } else {
          throw new AuthenticationError('Invalid authentication token');
        }
      } catch {
        throw new AuthenticationError('Invalid authentication token');
      }
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, is_active, email_verified, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.is_active) {
      throw new AuthenticationError('Account is inactive');
    }

    // Get user usage data
    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        usage,
      },
    });
  } catch (error) {
    logError(error, 'AuthMe');
    const { response, statusCode } = handleAPIError(error, '/api/auth/me');
    return NextResponse.json(response, { status: statusCode });
  }
}

