import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import OpenAI from 'openai';

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

    // Use OpenAI DALL-E for actual image generation
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI image generation is not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a professional, high-quality product mockup for: ${prompt}. The image should be suitable for e-commerce listings, with a clean background and professional presentation. Style: modern, clean, commercial.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL received from AI generation');
    }

    // Save the asset to database
    const { data: asset, error: dbError } = await supabase
      .from('design_assets')
      .insert({
        user_id: userId,
        product_id: productId,
        prompt,
        image_url: imageUrl,
        image_type: 'png',
        ai_provider: 'openai-dalle3',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save asset to database');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: asset.id,
        prompt: asset.prompt,
        imageUrl: asset.image_url,
        imageType: asset.image_type,
        userId: asset.user_id,
        productId: asset.product_id,
        createdAt: asset.created_at,
      },
    });
  } catch (error) {
    console.error('Studio generate API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate design asset' },
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

    // Fetch real assets from database
    const { data: assets, error } = await supabase
      .from('design_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch design assets from database');
    }

    // Transform to expected format
    const formattedAssets = (assets || []).map(asset => ({
      id: asset.id,
      prompt: asset.prompt,
      imageUrl: asset.image_url,
      imageType: asset.image_type,
      userId: asset.user_id,
      productId: asset.product_id,
      createdAt: asset.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAssets,
    });
  } catch (error) {
    console.error('Studio assets API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch design assets' },
      { status: 500 }
    );
  }
}