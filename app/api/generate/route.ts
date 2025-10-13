import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { GenerateProductRequest } from '@/lib/ai/IAIProvider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trendData,
      productType = 'digital_download',
      targetMarketplace = 'etsy',
      customPrompt,
      aiProvider = 'gemini',
    } = body;

    if (!trendData) {
      return NextResponse.json(
        { error: 'Trend data is required' },
        { status: 400 }
      );
    }

    // Get specified AI provider
    const provider = await AIProviderFactory.getProvider(aiProvider as any);
    if (!provider.isAvailable) {
      return NextResponse.json(
        { error: `AI provider ${aiProvider} not available` },
        { status: 500 }
      );
    }

    // Generate product
    const generateRequest: GenerateProductRequest = {
      trendData,
      productType,
      targetMarketplace,
      customPrompt,
    };

    const generatedProduct = await provider.generateProduct(generateRequest);

    // Generate listing content for the target marketplace
    const listingContent = await provider.generateListingContent(
      generatedProduct,
      targetMarketplace
    );

    // Generate image if requested
    let imageUrl = '';
    if (generatedProduct.imagePrompt) {
      imageUrl = await provider.generateImage(generatedProduct.imagePrompt);
    }

    return NextResponse.json({
      success: true,
      data: {
        product: generatedProduct,
        listingContent,
        imageUrl,
        aiProvider: provider.name,
        marketplace: targetMarketplace,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aiProvider = searchParams.get('provider') || 'gemini';

    // Get available AI providers
    const availableProviders = AIProviderFactory.getAvailableProviders();

    return NextResponse.json({
      success: true,
      data: {
        availableProviders,
        currentProvider: aiProvider,
        supportedProductTypes: [
          'digital_download',
          'printable',
          'template',
          'ebook',
          'course',
        ],
        supportedMarketplaces: ['etsy', 'amazon', 'shopify'],
      },
    });
  } catch (error) {
    console.error('Generate info API error:', error);
    return NextResponse.json(
      { error: 'Failed to get generation info' },
      { status: 500 }
    );
  }
}