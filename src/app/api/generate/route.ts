import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { GenerateProductRequest } from '@/lib/ai/IAIProvider';
import { validate, generateProductSchema } from '@/lib/validation';
import { handleAPIError, ExternalServiceError } from '@/lib/errors';
import { logRequest, logError, logAIGeneration, PerformanceLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { getCache, setCache, CACHE_TTL } from '@/lib/cache';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    rateLimit(userId, 'free'); // TODO: Get actual user plan from database

    // Validate request body
    const body = await request.json();
    const validatedData = validate(generateProductSchema, body);

    const {
      trendData: rawTrendData,
      productType,
      targetMarketplace,
      customPrompt,
      aiProvider,
    } = validatedData;

    // Ensure trendData has all required fields
    const trendData = {
      keywords: rawTrendData.keywords || [],
      salesVelocity: 0,
      priceRange: { min: 9.99, max: 49.99 },
      competitionLevel: 'medium' as const,
      seasonality: [],
      targetAudience: [],
      ...rawTrendData,
    };

    // Check cache for similar product generation
    const cacheKey = `generate:${JSON.stringify({ trendData, productType, targetMarketplace })}`;
    const cachedResult = await getCache(cacheKey);
    
    if (cachedResult) {
      logRequest('POST', '/api/generate', 200, Date.now() - startTime, userId, { cached: true });
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    // Start performance logging
    const perfLogger = new PerformanceLogger('API', 'generate-product');

    // Get specified AI provider
    const provider = await AIProviderFactory.getProvider(aiProvider);
    if (!provider.isAvailable) {
      throw new ExternalServiceError(
        aiProvider,
        `AI provider ${aiProvider} is not available. Please check your API key.`
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

    // Log AI generation
    logAIGeneration(provider.name, 'generateProduct', true, Date.now() - startTime);

    // Generate listing content for the target marketplace
    const listingContent = await provider.generateListingContent(
      generatedProduct,
      targetMarketplace
    );

    // Generate image if requested
    let imageUrl = '';
    if (generatedProduct.imagePrompt) {
      const imageStartTime = Date.now();
      imageUrl = await provider.generateImage(generatedProduct.imagePrompt);
      logAIGeneration(provider.name, 'generateImage', true, Date.now() - imageStartTime);
    }

    const result = {
      product: generatedProduct,
      listingContent,
      imageUrl,
      aiProvider: provider.name,
      marketplace: targetMarketplace,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    await setCache(cacheKey, result, CACHE_TTL.LONG);

    // End performance logging
    perfLogger.end({ aiProvider: provider.name, marketplace: targetMarketplace });

    // Log successful request
    logRequest('POST', '/api/generate', 200, Date.now() - startTime, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(error, 'GenerateAPI', { path: '/api/generate' });
    const { response, statusCode } = handleAPIError(error, '/api/generate');
    logRequest('POST', '/api/generate', statusCode, Date.now() - startTime);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const aiProvider = searchParams.get('provider') || 'gemini';

    // Get available AI providers
    const availableProviders = AIProviderFactory.getAvailableProviders();

    const result = {
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
    };

    logRequest('GET', '/api/generate', 200, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(error, 'GenerateInfoAPI', { path: '/api/generate' });
    const { response, statusCode } = handleAPIError(error, '/api/generate');
    logRequest('GET', '/api/generate', statusCode, Date.now() - startTime);
    return NextResponse.json(response, { status: statusCode });
  }
}