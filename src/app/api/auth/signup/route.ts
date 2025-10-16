import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { logSecurityEvent, logError, logUserActivity } from '@/lib/logger';
import { validate, registerSchema } from '@/lib/validation';
import { ConflictError, handleAPIError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password, name } = validate(registerSchema, body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      logSecurityEvent('signup_failed', 'low', undefined, {
        email,
        reason: 'email_exists',
      });
      
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        role: 'user',
        is_active: true,
        email_verified: false,
      })
      .select()
      .single();

    if (createError || !newUser) {
      throw new Error('Failed to create user account');
    }

    // Create user usage record
    await supabase
      .from('user_usage')
      .insert({
        user_id: newUser.id,
        plan: 'free',
        monthly_scans: 0,
        monthly_generations: 0,
        monthly_designs: 0,
        monthly_brands: 0,
      });

    // Log successful registration
    logSecurityEvent('signup_success', 'low', newUser.id, { email });
    logUserActivity(newUser.id, 'account_created', 'user');

    // Generate token
    const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    logError(error, 'AuthSignup');
    const { response, statusCode } = handleAPIError(error, '/api/auth/signup');
    return NextResponse.json(response, { status: statusCode });
  }
}

