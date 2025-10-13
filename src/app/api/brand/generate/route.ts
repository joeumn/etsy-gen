import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productCategory, 
      targetAudience, 
      brandStyle, 
      userId,
      customPrompt 
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if Zig 6 is enabled
    if (process.env.ENABLE_ZIG6_BRANDING !== 'true') {
      return NextResponse.json(
        { error: 'Auto-branding feature is not enabled' },
        { status: 403 }
      );
    }

    // Initialize AI provider
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate brand elements using AI
    const brandPrompt = customPrompt || `
      Create a complete brand identity for a ${productCategory} business targeting ${targetAudience}.
      Brand style: ${brandStyle || 'modern and professional'}.
      
      Generate:
      1. A brand name (creative and memorable)
      2. A tagline (catchy and descriptive)
      3. A color palette (3-5 colors with hex codes)
      4. Typography recommendations (2-3 font pairings)
      5. Brand personality traits
    `;

    const result = await model.generateContent([{ text: brandPrompt }]);
    const response = await result.response;
    const brandContent = response.text();

    // Parse AI response to extract brand elements
    const brandName = extractBrandName(brandContent);
    const tagline = extractTagline(brandContent);
    const colorPalette = extractColorPalette(brandContent);
    const typography = extractTypography(brandContent);

    // Generate logo URL (placeholder for demo)
    const logoUrl = `https://via.placeholder.com/200x100/2D9CDB/FFFFFF?text=${encodeURIComponent(brandName.slice(0, 10))}`;

    // Create brand kit data
    const brandKit = {
      id: Date.now().toString(),
      name: brandName,
      tagline,
      logoUrl,
      colorPalette: {
        primary: colorPalette.primary || '#2D9CDB',
        secondary: colorPalette.secondary || '#FF6B22',
        accent: colorPalette.accent || '#FFC400',
        neutral: colorPalette.neutral || '#6B7280',
      },
      typography: {
        heading: typography.heading || 'Inter, sans-serif',
        body: typography.body || 'Inter, sans-serif',
        accent: typography.accent || 'Playfair Display, serif',
      },
      metadata: {
        productCategory,
        targetAudience,
        brandStyle,
        generatedAt: new Date().toISOString(),
      },
      userId,
    };

    // In a real implementation, you would:
    // 1. Generate actual logo using AI image generation
    // 2. Upload logo to Supabase Storage
    // 3. Save brand kit to database
    // 4. Generate downloadable brand kit ZIP file

    return NextResponse.json({
      success: true,
      data: brandKit,
    });
  } catch (error) {
    console.error('Brand generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brand kit' },
      { status: 500 }
    );
  }
}

// Helper functions to parse AI response
function extractBrandName(content: string): string {
  const match = content.match(/brand name[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : 'Brand Name';
}

function extractTagline(content: string): string {
  const match = content.match(/tagline[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : 'Your tagline here';
}

function extractColorPalette(content: string) {
  const colorMatches = content.match(/#[0-9A-Fa-f]{6}/g);
  const colors = colorMatches || ['#2D9CDB', '#FF6B22', '#FFC400', '#6B7280'];
  
  return {
    primary: colors[0] || '#2D9CDB',
    secondary: colors[1] || '#FF6B22',
    accent: colors[2] || '#FFC400',
    neutral: colors[3] || '#6B7280',
  };
}

function extractTypography(content: string) {
  const fontMatches = content.match(/([A-Za-z\s]+(?:serif|sans-serif|monospace))/gi);
  const fonts = fontMatches || ['Inter, sans-serif', 'Playfair Display, serif'];
  
  return {
    heading: fonts[0] || 'Inter, sans-serif',
    body: fonts[1] || 'Inter, sans-serif',
    accent: fonts[2] || 'Playfair Display, serif',
  };
}