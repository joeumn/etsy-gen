import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { EtsyMarketplace } from '@/lib/marketplaces/etsy';
import { AmazonMarketplace } from '@/lib/marketplaces/amazon';
import { ShopifyMarketplace } from '@/lib/marketplaces/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace') || 'etsy';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

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
      return NextResponse.json(
        { error: `${marketplace} marketplace not available` },
        { status: 500 }
      );
    }

    // Scan trends from marketplace
    const rawTrends = await marketplaceService.scanTrends(category, limit);
    
    // Analyze trends with AI
    const analyzedTrends = await aiProvider.analyzeTrends(rawTrends);
    
    // Get categories for the marketplace
    const categories = await marketplaceService.getCategories();

    return NextResponse.json({
      success: true,
      data: {
        trends: analyzedTrends,
        categories,
        marketplace,
        timestamp: new Date().toISOString(),
        summary: `Found ${analyzedTrends.length} trending products in ${marketplace}`,
      },
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Failed to scan trends' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketplaces = ['etsy'], categories = [], limit = 50 } = body;

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

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalTrends: results.reduce((sum, r) => sum + (r.count || 0), 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bulk scan API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk scan' },
      { status: 500 }
    );
  }
}