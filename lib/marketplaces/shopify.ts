import axios from 'axios';
import { BaseMarketplace, MarketplaceConfig, ListingRequest, ListingResponse, ProductListing, EarningsData, TrendData } from './BaseMarketplace';

export class ShopifyMarketplace extends BaseMarketplace {
  private baseUrl: string;

  constructor(config: MarketplaceConfig) {
    super(config, 'Shopify');
    this.baseUrl = `https://${config.baseUrl}/admin/api/2023-10`;
  }

  async listProduct(request: ListingRequest): Promise<ListingResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/products.json`,
        {
          product: {
            title: request.title,
            body_html: request.description,
            vendor: 'AI Product Generator',
            product_type: request.category,
            tags: request.tags.join(', '),
            variants: [{
              price: request.price.toString(),
              inventory_management: null,
              inventory_policy: 'deny',
              fulfillment_service: 'manual',
              requires_shipping: false,
              taxable: true,
            }],
            images: request.images.map(url => ({ src: url })),
            options: [{
              name: 'Title',
              values: ['Default Title'],
            }],
            status: 'draft',
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const product = response.data.product;
      return {
        success: true,
        listingId: product.id.toString(),
        externalId: product.id.toString(),
        listing: this.mapToProductListing(product),
      };
    } catch (error: any) {
      console.error('Shopify listing error:', error);
      return {
        success: false,
        error: error.response?.data?.errors || 'Failed to create Shopify product',
      };
    }
  }

  async updateProduct(listingId: string, request: Partial<ListingRequest>): Promise<ListingResponse> {
    try {
      const updateData: any = {
        product: {
          id: listingId,
        },
      };

      if (request.title) updateData.product.title = request.title;
      if (request.description) updateData.product.body_html = request.description;
      if (request.category) updateData.product.product_type = request.category;
      if (request.tags) updateData.product.tags = request.tags.join(', ');
      if (request.images) updateData.product.images = request.images.map(url => ({ src: url }));
      if (request.price) {
        updateData.product.variants = [{
          price: request.price.toString(),
        }];
      }

      const response = await axios.put(
        `${this.baseUrl}/products/${listingId}.json`,
        updateData,
        {
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        listingId,
        listing: this.mapToProductListing(response.data.product),
      };
    } catch (error: any) {
      console.error('Shopify update error:', error);
      return {
        success: false,
        error: error.response?.data?.errors || 'Failed to update Shopify product',
      };
    }
  }

  async deleteProduct(listingId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.baseUrl}/products/${listingId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Shopify delete error:', error);
      return false;
    }
  }

  async getProduct(listingId: string): Promise<ProductListing | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/products/${listingId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
          },
        }
      );

      return this.mapToProductListing(response.data.product);
    } catch (error) {
      console.error('Shopify get product error:', error);
      return null;
    }
  }

  async getEarnings(period: string): Promise<EarningsData> {
    try {
      // Get orders for the period
      const response = await axios.get(
        `${this.baseUrl}/orders.json`,
        {
          params: {
            status: 'any',
            created_at_min: this.getDateForPeriod(period),
            limit: 250,
          },
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
          },
        }
      );

      const orders = response.data.orders || [];
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_price || 0), 0);
      const totalSales = orders.length;

      // Get top products
      const productSales: Record<string, { sales: number; revenue: number; title: string }> = {};
      orders.forEach((order: any) => {
        order.line_items?.forEach((item: any) => {
          const productId = item.product_id?.toString();
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = { sales: 0, revenue: 0, title: item.title };
            }
            productSales[productId].sales += item.quantity;
            productSales[productId].revenue += parseFloat(item.price) * item.quantity;
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          title: data.title,
          sales: data.sales,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        period,
        totalSales,
        totalRevenue,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        conversionRate: 0.02, // Shopify average
        topProducts,
      };
    } catch (error) {
      console.error('Shopify earnings error:', error);
      return {
        period,
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        topProducts: [],
      };
    }
  }

  async scanTrends(category?: string, limit: number = 50): Promise<TrendData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/products.json`,
        {
          params: {
            product_type: category || 'Digital Download',
            limit,
            published_status: 'published',
          },
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
          },
        }
      );

      const products = response.data.products || [];
      return this.analyzeTrends(products);
    } catch (error) {
      console.error('Shopify trends error:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/product_types.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.config.apiKey,
          },
        }
      );

      return response.data.product_types || [
        'Digital Downloads',
        'E-books',
        'Templates',
        'Graphics',
        'Fonts',
        'Printables',
        'Courses',
        'Software',
      ];
    } catch (error) {
      console.error('Shopify categories error:', error);
      return [
        'Digital Downloads',
        'E-books',
        'Templates',
        'Graphics',
        'Fonts',
        'Printables',
        'Courses',
        'Software',
      ];
    }
  }

  async validateListing(request: ListingRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!request.title || request.title.length < 1) {
      errors.push('Title is required');
    }

    if (!request.description || request.description.length < 1) {
      errors.push('Description is required');
    }

    if (request.price < 0) {
      errors.push('Price must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private mapToProductListing(shopifyProduct: any): ProductListing {
    return {
      id: shopifyProduct.id?.toString() || '',
      title: shopifyProduct.title || '',
      description: shopifyProduct.body_html || '',
      price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
      category: shopifyProduct.product_type || 'Digital Downloads',
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
      images: shopifyProduct.images?.map((img: any) => img.src) || [],
      status: shopifyProduct.status === 'active' ? 'active' : 'draft',
      marketplace: 'shopify',
      externalId: shopifyProduct.id?.toString(),
      createdAt: new Date(shopifyProduct.created_at),
      updatedAt: new Date(shopifyProduct.updated_at),
    };
  }

  private getDateForPeriod(period: string): string {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private analyzeTrends(products: any[]): TrendData[] {
    const trends: TrendData[] = [];
    const categoryGroups: Record<string, any[]> = {};

    // Group by category
    products.forEach(product => {
      const category = product.product_type || 'Digital Downloads';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(product);
    });

    // Analyze each category
    Object.entries(categoryGroups).forEach(([category, categoryProducts]) => {
      const prices = categoryProducts
        .map(p => parseFloat(p.variants?.[0]?.price || '0'))
        .filter(p => p > 0);

      if (prices.length > 0) {
        trends.push({
          keywords: this.extractKeywords(categoryProducts),
          salesVelocity: this.calculateSalesVelocity(categoryProducts),
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
          competitionLevel: this.calculateCompetitionLevel(categoryProducts.length),
          seasonality: this.detectSeasonality(categoryProducts),
          targetAudience: this.inferTargetAudience(categoryProducts),
          category,
          marketplace: 'shopify',
          timestamp: new Date(),
        });
      }
    });

    return trends;
  }

  private extractKeywords(products: any[]): string[] {
    const keywords: string[] = [];
    products.forEach(product => {
      if (product.title) {
        keywords.push(...product.title.toLowerCase().split(' '));
      }
      if (product.tags) {
        keywords.push(...product.tags.toLowerCase().split(', '));
      }
    });

    const frequency: Record<string, number> = {};
    keywords.forEach(keyword => {
      if (keyword.length > 3) {
        frequency[keyword] = (frequency[keyword] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private calculateSalesVelocity(products: any[]): number {
    // Simplified calculation based on created date and tags
    return products.reduce((sum, product) => {
      const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const tagCount = product.tags ? product.tags.split(', ').length : 0;
      return sum + (tagCount * 10) / Math.max(daysSinceCreated, 1);
    }, 0);
  }

  private calculateCompetitionLevel(count: number): 'low' | 'medium' | 'high' {
    if (count < 20) return 'low';
    if (count < 100) return 'medium';
    return 'high';
  }

  private detectSeasonality(products: any[]): string[] {
    // Simplified seasonality detection
    return ['year-round'];
  }

  private inferTargetAudience(products: any[]): string[] {
    // Simplified audience inference
    return ['business owners', 'creators', 'professionals'];
  }
}