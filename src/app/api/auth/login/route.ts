import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { logSecurityEvent, logError } from '@/lib/logger';
import { validate, loginSchema } from '@/lib/validation';
import { AuthenticationError, handleAPIError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password } = validate(loginSchema, body);

    // Use real Supabase authentication
    // Get user from database
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (dbError || !user) {
      logSecurityEvent('login_failed', 'low', undefined, {
        email,
        reason: 'user_not_found',
      });
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      logSecurityEvent('login_failed', 'medium', user.id, {
        email,
        reason: 'account_inactive',
      });
      
      throw new AuthenticationError('Account is inactive. Please contact support.');
    }

    // Verify password
    const passwordHash = user.password_hash as unknown as string;
    if (!passwordHash) {
      throw new AuthenticationError('Invalid account configuration');
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      logSecurityEvent('login_failed', 'medium', user.id, {
        email,
        reason: 'invalid_password',
      });
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Log successful login
    logSecurityEvent('login_success', 'low', user.id, { email });

    // Generate token (in production, use proper JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    logError(error, 'AuthLogin');
    const { response, statusCode } = handleAPIError(error, '/api/auth/login');
    return NextResponse.json(response, { status: statusCode });
  }
}

