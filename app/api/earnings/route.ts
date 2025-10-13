import { NextRequest, NextResponse } from 'next/server';
import { EtsyMarketplace } from '@/lib/marketplaces/etsy';
import { AmazonMarketplace } from '@/lib/marketplaces/amazon';
import { ShopifyMarketplace } from '@/lib/marketplaces/shopify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace') || 'all';
    const period = searchParams.get('period') || '30d';

    const results = [];

    if (marketplace === 'all' || marketplace === 'etsy') {
      try {
        const etsyService = new EtsyMarketplace({
          apiKey: process.env.ETSY_API_KEY || '',
          secret: process.env.ETSY_SHARED_SECRET,
        });

        if (etsyService.isAvailable) {
          const etsyEarnings = await etsyService.getEarnings(period);
          results.push({
            marketplace: 'etsy',
            ...etsyEarnings,
          });
        }
      } catch (error) {
        console.error('Etsy earnings error:', error);
        results.push({
          marketplace: 'etsy',
          error: 'Failed to fetch Etsy earnings',
        });
      }
    }

    if (marketplace === 'all' || marketplace === 'amazon') {
      try {
        const amazonService = new AmazonMarketplace({
          apiKey: process.env.AMAZON_ACCESS_KEY || '',
          secret: process.env.AMAZON_SECRET_KEY,
          region: process.env.AMAZON_REGION,
        });

        if (amazonService.isAvailable) {
          const amazonEarnings = await amazonService.getEarnings(period);
          results.push({
            marketplace: 'amazon',
            ...amazonEarnings,
          });
        }
      } catch (error) {
        console.error('Amazon earnings error:', error);
        results.push({
          marketplace: 'amazon',
          error: 'Failed to fetch Amazon earnings',
        });
      }
    }

    if (marketplace === 'all' || marketplace === 'shopify') {
      try {
        const shopifyService = new ShopifyMarketplace({
          apiKey: process.env.SHOPIFY_ACCESS_TOKEN || '',
          baseUrl: process.env.SHOPIFY_SHOP_DOMAIN,
        });

        if (shopifyService.isAvailable) {
          const shopifyEarnings = await shopifyService.getEarnings(period);
          results.push({
            marketplace: 'shopify',
            ...shopifyEarnings,
          });
        }
      } catch (error) {
        console.error('Shopify earnings error:', error);
        results.push({
          marketplace: 'shopify',
          error: 'Failed to fetch Shopify earnings',
        });
      }
    }

    // Calculate totals
    const totalSales = results.reduce((sum, r) => sum + ('totalSales' in r ? r.totalSales : 0), 0);
    const totalRevenue = results.reduce((sum, r) => sum + ('totalRevenue' in r ? r.totalRevenue : 0), 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Combine top products from all marketplaces
    const allTopProducts = results
      .flatMap(r => 'topProducts' in r ? r.topProducts : [])
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalSales,
          totalRevenue,
          averageOrderValue,
          topProducts: allTopProducts,
        },
        byMarketplace: results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Earnings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketplaces = ['etsy', 'amazon', 'shopify'], period = '30d' } = body;

    const results = [];

    for (const marketplace of marketplaces) {
      try {
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

        if (marketplaceService.isAvailable) {
          const earnings = await marketplaceService.getEarnings(period);
          results.push({
            marketplace,
            ...earnings,
          });
        }
      } catch (error) {
        console.error(`${marketplace} earnings error:`, error);
        results.push({
          marketplace,
          error: `Failed to fetch ${marketplace} earnings`,
        });
      }
    }

    // Calculate totals
    const totalSales = results.reduce((sum, r) => sum + ('totalSales' in r ? r.totalSales : 0), 0);
    const totalRevenue = results.reduce((sum, r) => sum + ('totalRevenue' in r ? r.totalRevenue : 0), 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalSales,
          totalRevenue,
          averageOrderValue,
        },
        byMarketplace: results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bulk earnings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}