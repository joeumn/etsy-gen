import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";
import { validate, registerSchema } from "@/lib/validation";
import { handleAPIError, ConflictError } from "@/lib/errors";
import { logError, logSecurityEvent, logUserActivity } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { name, email, password } = validate(registerSchema, body);

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logSecurityEvent('registration_failed', 'low', undefined, {
        email,
        reason: 'email_exists',
      });
      
      throw new ConflictError("User with this email already exists");
    }

    // Create new user
    const user = await createUser(email, password, name);

    logSecurityEvent('registration_success', 'low', user.id, { email });
    logUserActivity(user.id, 'account_created', 'user');

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    logError(error, 'AuthRegister', { path: '/api/auth/register' });
    const { response, statusCode } = handleAPIError(error, '/api/auth/register');
    return NextResponse.json(response, { status: statusCode });
  }
}

