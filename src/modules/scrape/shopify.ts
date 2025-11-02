import axios from 'axios';
import type { MarketplaceProduct } from "./types";
import { logger } from '@/config/logger';
import { marketplaceRequestDuration, marketplaceHealthScore } from '@/config/metrics';

export const fetchShopifyListings = async (limit = 50): Promise<MarketplaceProduct[]> => {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopDomain || !accessToken) {
    logger.warn('Shopify credentials missing');
    return [];
  }

  const startTime = Date.now();

  try {
    // Use Shopify Admin API to fetch products
    const response = await axios.get(
      `https://${shopDomain}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        params: {
          limit: Math.min(limit, 250),
          status: 'active',
        },
        timeout: 10000,
      }
    );

    const products = response.data.products || [];
    const digitalProducts: MarketplaceProduct[] = [];

    for (const product of products) {
      // Filter for digital products
      const isDigital = 
        product.tags?.toLowerCase().includes('digital') ||
        product.tags?.toLowerCase().includes('download') ||
        product.tags?.toLowerCase().includes('printable') ||
        product.product_type?.toLowerCase().includes('digital');

      if (!isDigital) continue;

      const variant = product.variants[0] || {};

      digitalProducts.push({
        marketplace: 'shopify',
        productId: `shopify-${product.id}`,
        title: product.title,
        price: parseFloat(variant.price || '0'),
        currency: 'USD',
        tags: product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [],
        category: product.product_type || 'Digital Products',
        sales: null, // Shopify Admin API doesn't expose sales directly
        rating: null,
        url: `https://${shopDomain.replace('.myshopify.com', '')}.com/products/${product.handle}`,
        collectedAt: new Date(),
        raw: product,
      });
    }

    marketplaceRequestDuration.observe(
      { marketplace: 'shopify', endpoint: 'products', status: '200' },
      (Date.now() - startTime) / 1000
    );
    marketplaceHealthScore.set({ marketplace: 'shopify' }, 1.0);

    logger.info({ count: digitalProducts.length }, 'Shopify products fetched');

    return digitalProducts;
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch Shopify products');

    marketplaceRequestDuration.observe(
      { marketplace: 'shopify', endpoint: 'products', status: error.response?.status || '500' },
      (Date.now() - startTime) / 1000
    );
    marketplaceHealthScore.set({ marketplace: 'shopify' }, 0.5);

    return [];
  }
};
