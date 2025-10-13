import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini for image generation
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, assetType = 'image', userId, productId } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
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

    // Generate image using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Create a more detailed prompt for better results
    const enhancedPrompt = `Create a high-quality ${assetType} for an e-commerce product. 
    Style: Modern, clean, professional, suitable for online marketplace listings.
    Prompt: ${prompt}
    Make it visually appealing and market-ready.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    // For now, we'll return a placeholder URL since Gemini doesn't directly generate images
    // In a real implementation, you'd use a service like DALL-E, Midjourney, or Stable Diffusion
    const imageUrl = `https://via.placeholder.com/512x512/2D9CDB/FFFFFF?text=${encodeURIComponent(prompt.slice(0, 20))}`;

    // In a real implementation, you would:
    // 1. Generate the actual image using an image generation service
    // 2. Upload to Supabase Storage
    // 3. Save metadata to database

    return NextResponse.json({
      success: true,
      data: {
        id: `asset_${Date.now()}`,
        prompt,
        imageUrl,
        assetType,
        userId,
        productId,
        createdAt: new Date().toISOString(),
        metadata: {
          generatedBy: 'gemini',
          model: 'gemini-1.5-flash',
          originalPrompt: prompt,
        },
      },
    });
  } catch (error) {
    console.error('Studio API error:', error);
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
    const assetType = searchParams.get('assetType');

    // Check if Zig 3 is enabled
    if (process.env.ENABLE_ZIG3_STUDIO !== 'true') {
      return NextResponse.json(
        { error: 'AI Design Studio is not enabled' },
        { status: 403 }
      );
    }

    // In a real implementation, you would fetch from database
    const mockAssets = [
      {
        id: 'asset_1',
        prompt: 'Modern minimalist logo for tech startup',
        imageUrl: 'https://via.placeholder.com/512x512/2D9CDB/FFFFFF?text=Logo+1',
        assetType: 'logo',
        userId,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'asset_2',
        prompt: 'Product mockup for digital download',
        imageUrl: 'https://via.placeholder.com/512x512/FF6B22/FFFFFF?text=Mockup+1',
        assetType: 'mockup',
        userId,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        assets: mockAssets.filter(asset => 
          !assetType || asset.assetType === assetType
        ),
        count: mockAssets.length,
      },
    });
  } catch (error) {
    console.error('Studio GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design assets' },
      { status: 500 }
    );
  }
}