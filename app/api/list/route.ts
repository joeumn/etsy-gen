import { NextRequest, NextResponse } from 'next/server';
import { EtsyMarketplace } from '@/lib/marketplaces/etsy';
import { AmazonMarketplace } from '@/lib/marketplaces/amazon';
import { ShopifyMarketplace } from '@/lib/marketplaces/shopify';
import { ListingRequest } from '@/lib/marketplaces/BaseMarketplace';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketplace,
      product,
      publish = false,
    } = body;

    if (!marketplace || !product) {
      return NextResponse.json(
        { error: 'Marketplace and product are required' },
        { status: 400 }
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

    // Prepare listing request
    const listingRequest: ListingRequest = {
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags || product.seoKeywords || [],
      images: product.images || [],
      specifications: product.specifications || {},
    };

    // Validate listing
    const validation = await marketplaceService.validateListing(listingRequest);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Listing validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create listing
    const result = await marketplaceService.listProduct(listingRequest);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to create listing',
          details: result.error,
        },
        { status: 500 }
      );
    }

    // If publish is true and listing was created as draft, update to active
    if (publish && result.listing?.status === 'draft') {
      // This would require additional API calls to publish the listing
      // For now, we'll return the draft listing
    }

    return NextResponse.json({
      success: true,
      data: {
        listing: result.listing,
        listingId: result.listingId,
        externalId: result.externalId,
        marketplace,
        status: result.listing?.status || 'created',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('List API error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketplace,
      listingId,
      product,
    } = body;

    if (!marketplace || !listingId || !product) {
      return NextResponse.json(
        { error: 'Marketplace, listingId, and product are required' },
        { status: 400 }
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

    // Prepare update request
    const updateRequest: Partial<ListingRequest> = {
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags || product.seoKeywords || [],
      images: product.images || [],
      specifications: product.specifications || {},
    };

    // Update listing
    const result = await marketplaceService.updateProduct(listingId, updateRequest);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to update listing',
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        listing: result.listing,
        listingId,
        marketplace,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Update listing API error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace');
    const listingId = searchParams.get('listingId');

    if (!marketplace || !listingId) {
      return NextResponse.json(
        { error: 'Marketplace and listingId are required' },
        { status: 400 }
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

    // Delete listing
    const success = await marketplaceService.deleteProduct(listingId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        listingId,
        marketplace,
        deleted: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Delete listing API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}