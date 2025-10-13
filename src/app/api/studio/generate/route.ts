import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, userId, productId } = body;

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Prompt and User ID are required' },
        { status: 400 }
      );
    }

    // Check if Zig 3 is enabled
    if (process.env.ENABLE_ZIG3_STUDIO !== 'true') {
      return NextResponse.json(
        { error: 'AI Design Studio is not enabled' },
        { status: 403 }
      );
    }

    // Initialize Gemini for image generation
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate image using Gemini
    const result = await model.generateContent([
      {
        text: `Create a professional product mockup for: ${prompt}. 
        The image should be high quality, suitable for e-commerce listings, 
        with a clean background and professional presentation.`,
      },
    ]);

    // For demo purposes, we'll return a placeholder image
    // In production, you would use the actual generated image
    const imageUrl = `https://via.placeholder.com/800x600/2D9CDB/FFFFFF?text=${encodeURIComponent(prompt.slice(0, 30))}`;

    // In a real implementation, you would:
    // 1. Generate the actual image using Gemini or another AI service
    // 2. Upload the image to Supabase Storage
    // 3. Save the asset metadata to the database

    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        imageType: 'png',
        userId,
        productId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Studio generate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate design asset' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if Zig 3 is enabled
    if (process.env.ENABLE_ZIG3_STUDIO !== 'true') {
      return NextResponse.json(
        { error: 'AI Design Studio is not enabled' },
        { status: 403 }
      );
    }

    // In a real implementation, you would fetch from the database
    const mockAssets = [
      {
        id: '1',
        prompt: 'Minimalist planner template',
        imageUrl: 'https://via.placeholder.com/400x300/2D9CDB/FFFFFF?text=Planner+Template',
        imageType: 'png',
        userId,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        prompt: 'Watercolor wedding invitation',
        imageUrl: 'https://via.placeholder.com/400x300/FF6B22/FFFFFF?text=Wedding+Invitation',
        imageType: 'png',
        userId,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockAssets,
    });
  } catch (error) {
    console.error('Studio assets API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design assets' },
      { status: 500 }
    );
  }
}