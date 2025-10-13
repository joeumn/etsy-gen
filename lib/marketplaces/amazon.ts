import axios from 'axios';
import { BaseMarketplace, MarketplaceConfig, ListingRequest, ListingResponse, ProductListing, EarningsData, TrendData } from './BaseMarketplace';

export class AmazonMarketplace extends BaseMarketplace {
  private baseUrl = 'https://sellingpartnerapi-na.amazon.com';

  constructor(config: MarketplaceConfig) {
    super(config, 'Amazon');
  }

  async listProduct(request: ListingRequest): Promise<ListingResponse> {
    try {
      // Amazon SP-API requires complex authentication and product catalog setup
      // This is a simplified implementation
      const response = await axios.post(
        `${this.baseUrl}/catalog/2022-04-01/items`,
        {
          marketplaceIds: ['ATVPDKIKX0DER'], // US marketplace
          items: [{
            attributes: {
              product_type: 'DIGITAL_DOWNLOAD',
              item_name: request.title,
              bullet_point: request.description.split('. ').slice(0, 5),
              item_keywords: request.tags.join(','),
              list_price: {
                value: request.price,
                currency: 'USD',
              },
              external_product_id: {
                value: `AI-${Date.now()}`,
                type: 'ASIN',
              },
            },
          }],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const item = response.data.items[0];
      return {
        success: true,
        listingId: item.asin,
        externalId: item.asin,
        listing: this.mapToProductListing(item, request),
      };
    } catch (error: any) {
      console.error('Amazon listing error:', error);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || 'Failed to create Amazon listing',
      };
    }
  }

  async updateProduct(listingId: string, request: Partial<ListingRequest>): Promise<ListingResponse> {
    try {
      // Amazon SP-API update implementation
      const response = await axios.patch(
        `${this.baseUrl}/catalog/2022-04-01/items/${listingId}`,
        {
          attributes: {
            item_name: request.title,
            bullet_point: request.description?.split('. ').slice(0, 5),
            item_keywords: request.tags?.join(','),
            list_price: request.price ? {
              value: request.price,
              currency: 'USD',
            } : undefined,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        listingId,
        listing: this.mapToProductListing(response.data, request as ListingRequest),
      };
    } catch (error: any) {
      console.error('Amazon update error:', error);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || 'Failed to update Amazon listing',
      };
    }
  }

  async deleteProduct(listingId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.baseUrl}/catalog/2022-04-01/items/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Amazon delete error:', error);
      return false;
    }
  }

  async getProduct(listingId: string): Promise<ProductListing | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/catalog/2022-04-01/items/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return this.mapToProductListing(response.data);
    } catch (error) {
      console.error('Amazon get product error:', error);
      return null;
    }
  }

  async getEarnings(period: string): Promise<EarningsData> {
    try {
      // Amazon SP-API earnings implementation
      const response = await axios.get(
        `${this.baseUrl}/reports/2021-06-30/reports`,
        {
          params: {
            reportTypes: 'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
            processingStatuses: 'DONE',
          },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      // Parse settlement report data
      const reports = response.data.reports || [];
      let totalRevenue = 0;
      let totalSales = 0;

      // Simplified calculation - would need to parse actual report data
      return {
        period,
        totalSales,
        totalRevenue,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        conversionRate: 0.03, // Amazon average
        topProducts: [],
      };
    } catch (error) {
      console.error('Amazon earnings error:', error);
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
      // Amazon Product Advertising API for trend analysis
      const response = await axios.get(
        `${this.baseUrl}/paapi5/searchitems`,
        {
          params: {
            Keywords: category || 'digital download',
            SearchIndex: 'DigitalDownloads',
            ItemCount: limit,
            SortBy: 'Relevance',
          },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const items = response.data.SearchResult?.Items || [];
      return this.analyzeTrends(items);
    } catch (error) {
      console.error('Amazon trends error:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    return [
      'Digital Downloads',
      'E-books',
      'Software',
      'Mobile Apps',
      'Games',
      'Music',
      'Video',
      'Templates',
      'Graphics',
      'Fonts',
    ];
  }

  async validateListing(request: ListingRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!request.title || request.title.length < 10) {
      errors.push('Title must be at least 10 characters long');
    }

    if (!request.description || request.description.length < 50) {
      errors.push('Description must be at least 50 characters long');
    }

    if (request.price < 0.99) {
      errors.push('Price must be at least $0.99');
    }

    if (request.tags.length < 1) {
      errors.push('At least one keyword is required');
    }

    if (request.tags.length > 5) {
      errors.push('Maximum 5 keywords allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private mapToProductListing(amazonItem: any, request?: ListingRequest): ProductListing {
    return {
      id: amazonItem.asin || '',
      title: amazonItem.itemInfo?.title?.displayValue || request?.title || '',
      description: amazonItem.itemInfo?.features?.displayValues?.join('. ') || request?.description || '',
      price: amazonItem.offers?.listings?.[0]?.price?.displayAmount?.replace('$', '') || request?.price || 0,
      category: amazonItem.itemInfo?.classifications?.binding?.displayValue || 'Digital Downloads',
      tags: request?.tags || [],
      images: amazonItem.images?.primary?.large?.url ? [amazonItem.images.primary.large.url] : [],
      status: 'active',
      marketplace: 'amazon',
      externalId: amazonItem.asin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private analyzeTrends(items: any[]): TrendData[] {
    const trends: TrendData[] = [];
    const categoryGroups: Record<string, any[]> = {};

    // Group by category
    items.forEach(item => {
      const category = item.itemInfo?.classifications?.binding?.displayValue || 'Digital Downloads';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(item);
    });

    // Analyze each category
    Object.entries(categoryGroups).forEach(([category, categoryItems]) => {
      const prices = categoryItems
        .map(item => parseFloat(item.offers?.listings?.[0]?.price?.displayAmount?.replace('$', '') || '0'))
        .filter(p => p > 0);

      if (prices.length > 0) {
        trends.push({
          keywords: this.extractKeywords(categoryItems),
          salesVelocity: this.calculateSalesVelocity(categoryItems),
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
          competitionLevel: this.calculateCompetitionLevel(categoryItems.length),
          seasonality: this.detectSeasonality(categoryItems),
          targetAudience: this.inferTargetAudience(categoryItems),
          category,
          marketplace: 'amazon',
          timestamp: new Date(),
        });
      }
    });

    return trends;
  }

  private extractKeywords(items: any[]): string[] {
    const keywords: string[] = [];
    items.forEach(item => {
      if (item.itemInfo?.title?.displayValue) {
        keywords.push(...item.itemInfo.title.displayValue.toLowerCase().split(' '));
      }
      if (item.itemInfo?.features?.displayValues) {
        item.itemInfo.features.displayValues.forEach((feature: string) => {
          keywords.push(...feature.toLowerCase().split(' '));
        });
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

  private calculateSalesVelocity(items: any[]): number {
    // Simplified calculation based on bestseller rank
    return items.reduce((sum, item) => {
      const rank = item.salesRank?.[0]?.displayValue || 1000000;
      return sum + (1000000 / rank);
    }, 0);
  }

  private calculateCompetitionLevel(count: number): 'low' | 'medium' | 'high' {
    if (count < 50) return 'low';
    if (count < 200) return 'medium';
    return 'high';
  }

  private detectSeasonality(items: any[]): string[] {
    // Simplified seasonality detection
    return ['year-round']; // Most digital products are year-round
  }

  private inferTargetAudience(items: any[]): string[] {
    // Simplified audience inference
    return ['general consumers', 'professionals', 'students'];
  }
}