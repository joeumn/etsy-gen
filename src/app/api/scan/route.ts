import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { EtsyMarketplace } from '@/lib/marketplaces/etsy';
import { AmazonMarketplace } from '@/lib/marketplaces/amazon';
import { ShopifyMarketplace } from '@/lib/marketplaces/shopify';
import { validate, scanTrendsSchema } from '@/lib/validation';
import { handleAPIError, ExternalServiceError, ValidationError } from '@/lib/errors';
import { logRequest, logError, PerformanceLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { getCache, setCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    rateLimit(userId, 'free');

    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace') || 'etsy';
    const category = searchParams.get('category') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100

    // Validate inputs
    if (!['etsy', 'amazon', 'shopify'].includes(marketplace)) {
      throw new ValidationError('Invalid marketplace', { marketplace });
    }

    // Check cache
    const cacheKey = `scan:${marketplace}:${category || 'all'}:${limit}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      logRequest('GET', '/api/scan', 200, Date.now() - startTime, userId, { cached: true });
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    const perfLogger = new PerformanceLogger('API', 'scan-trends');

    // Get AI provider
    const aiProvider = await AIProviderFactory.getProvider();
    if (!aiProvider.isAvailable) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Get marketplace service
    let marketplaceService;
    switch (marketplace) {
      case 'etsy':
        marketplaceService = new EtsyMarketplace({
          apiKey: process.env.ETSY_API_KEY || '',
          secret: process.env.ETSY_SHARED_SECRET,
        });
        break;
      case 'amazon':
        marketplaceService = new AmazonMarketplace({
          apiKey: process.env.AMAZON_ACCESS_KEY || '',
          secret: process.env.AMAZON_SECRET_KEY,
          region: process.env.AMAZON_REGION,
        });
        break;
      case 'shopify':
        marketplaceService = new ShopifyMarketplace({
          apiKey: process.env.SHOPIFY_ACCESS_TOKEN || '',
          baseUrl: process.env.SHOPIFY_SHOP_DOMAIN,
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid marketplace' },
          { status: 400 }
        );
    }

    if (!marketplaceService.isAvailable) {
      throw new ExternalServiceError(
        marketplace,
        `${marketplace} marketplace not available. Please check your API configuration.`
      );
    }

    // Scan trends from marketplace
    const rawTrends = await marketplaceService.scanTrends(category, limit);
    
    // Analyze trends with AI
    const analyzedTrends = await aiProvider.analyzeTrends(rawTrends);
    
    // Get categories for the marketplace
    const categories = await marketplaceService.getCategories();

    const result = {
      trends: analyzedTrends,
      categories,
      marketplace,
      timestamp: new Date().toISOString(),
      summary: `Found ${analyzedTrends.length} trending products in ${marketplace}`,
    };

    // Cache the result
    await setCache(cacheKey, result, CACHE_TTL.MEDIUM);

    perfLogger.end({ marketplace, category, trendCount: analyzedTrends.length });
    logRequest('GET', '/api/scan', 200, Date.now() - startTime, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(error, 'ScanAPI', { path: '/api/scan' });
    const { response, statusCode } = handleAPIError(error, '/api/scan');
    logRequest('GET', '/api/scan', statusCode, Date.now() - startTime);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get user ID from header set by middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting (higher cost for bulk operations)
    rateLimit(userId, 'free');

    const body = await request.json();
    const { marketplaces = ['etsy'], categories = [], limit = 50 } = body;

    const perfLogger = new PerformanceLogger('API', 'bulk-scan-trends');
    const results = [];

    for (const marketplace of marketplaces) {
      try {
        // Get AI provider
        const aiProvider = await AIProviderFactory.getProvider();
        if (!aiProvider.isAvailable) {
          continue;
        }

        // Get marketplace service
        let marketplaceService;
        switch (marketplace) {
          case 'etsy':
            marketplaceService = new EtsyMarketplace({
              apiKey: process.env.ETSY_API_KEY || '',
              secret: process.env.ETSY_SHARED_SECRET,
            });
            break;
          case 'amazon':
            marketplaceService = new AmazonMarketplace({
              apiKey: process.env.AMAZON_ACCESS_KEY || '',
              secret: process.env.AMAZON_SECRET_KEY,
              region: process.env.AMAZON_REGION,
            });
            break;
          case 'shopify':
            marketplaceService = new ShopifyMarketplace({
              apiKey: process.env.SHOPIFY_ACCESS_TOKEN || '',
              baseUrl: process.env.SHOPIFY_SHOP_DOMAIN,
            });
            break;
          default:
            continue;
        }

        if (!marketplaceService.isAvailable) {
          continue;
        }

        // Scan trends for each category
        for (const category of categories.length > 0 ? categories : [undefined]) {
          const rawTrends = await marketplaceService.scanTrends(category, limit);
          const analyzedTrends = await aiProvider.analyzeTrends(rawTrends);
          
          results.push({
            marketplace,
            category: category || 'all',
            trends: analyzedTrends,
            count: analyzedTrends.length,
          });
        }
      } catch (error) {
        console.error(`Error scanning ${marketplace}:`, error);
        results.push({
          marketplace,
          error: 'Failed to scan this marketplace',
        });
      }
    }

    const finalResults = {
      results,
      totalTrends: results.reduce((sum, r) => sum + (r.count || 0), 0),
      timestamp: new Date().toISOString(),
    };

    perfLogger.end({ marketplaceCount: marketplaces.length, totalTrends: finalResults.totalTrends });
    logRequest('POST', '/api/scan', 200, Date.now() - startTime, userId, { bulk: true });

    return NextResponse.json({
      success: true,
      data: finalResults,
    });
  } catch (error) {
    logError(error, 'BulkScanAPI', { path: '/api/scan' });
    const { response, statusCode } = handleAPIError(error, '/api/scan');
    logRequest('POST', '/api/scan', statusCode, Date.now() - startTime);
    return NextResponse.json(response, { status: statusCode });
  }
}