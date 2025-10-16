import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    // For development, skip actual API test and return success
    // This allows onboarding to proceed with mock data
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Gemini API check skipped in development mode'
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Test Gemini API connection
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Simple test prompt
    const result = await model.generateContent('Say "Hello, World!" in exactly those words.');
    const response = await result.response;
    const text = response.text();

    if (text.includes('Hello, World!')) {
      return NextResponse.json({
        success: true,
        message: 'Gemini API connected successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'API response unexpected' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    logError(error, 'GeminiTestEndpoint');

    // Handle specific Gemini errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Gemini API test failed' },
      { status: 500 }
    );
  }
}
