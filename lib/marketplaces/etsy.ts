import axios from 'axios';
import { BaseMarketplace, MarketplaceConfig, ListingRequest, ListingResponse, ProductListing, EarningsData, TrendData } from './BaseMarketplace';

export class EtsyMarketplace extends BaseMarketplace {
  private baseUrl = 'https://openapi.etsy.com/v3';

  constructor(config: MarketplaceConfig) {
    super(config, 'Etsy');
  }

  async listProduct(request: ListingRequest): Promise<ListingResponse> {
    try {
      // Etsy API requires OAuth, so this is a simplified implementation
      const response = await axios.post(
        `${this.baseUrl}/application/shops/${this.config.apiKey}/listings`,
        {
          title: request.title,
          description: request.description,
          price: request.price,
          who_made: 'i_did',
          when_made: 'made_to_order',
          taxonomy_id: this.getCategoryId(request.category),
          tags: request.tags,
          materials: request.specifications?.materials || [],
          processing_min: 1,
          processing_max: 3,
          state: 'draft',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const listing = response.data.results[0];
      return {
        success: true,
        listingId: listing.listing_id.toString(),
        externalId: listing.listing_id.toString(),
        listing: this.mapToProductListing(listing),
      };
    } catch (error: any) {
      console.error('Etsy listing error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create Etsy listing',
      };
    }
  }

  async updateProduct(listingId: string, request: Partial<ListingRequest>): Promise<ListingResponse> {
    try {
      const updateData: any = {};
      
      if (request.title) updateData.title = request.title;
      if (request.description) updateData.description = request.description;
      if (request.price) updateData.price = request.price;
      if (request.tags) updateData.tags = request.tags;

      const response = await axios.put(
        `${this.baseUrl}/application/shops/${this.config.apiKey}/listings/${listingId}`,
        updateData,
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
        listing: this.mapToProductListing(response.data),
      };
    } catch (error: any) {
      console.error('Etsy update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update Etsy listing',
      };
    }
  }

  async deleteProduct(listingId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.baseUrl}/application/shops/${this.config.apiKey}/listings/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Etsy delete error:', error);
      return false;
    }
  }

  async getProduct(listingId: string): Promise<ProductListing | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/application/shops/${this.config.apiKey}/listings/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return this.mapToProductListing(response.data);
    } catch (error) {
      console.error('Etsy get product error:', error);
      return null;
    }
  }

  async getEarnings(period: string): Promise<EarningsData> {
    try {
      // Etsy doesn't provide direct earnings API, so we'll simulate
      const response = await axios.get(
        `${this.baseUrl}/application/shops/${this.config.apiKey}/receipts`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const receipts = response.data.results || [];
      const totalRevenue = receipts.reduce((sum: number, receipt: any) => sum + (receipt.grandtotal || 0), 0);
      const totalSales = receipts.length;

      return {
        period,
        totalSales,
        totalRevenue,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        conversionRate: 0.05, // Simulated
        topProducts: [], // Would need additional API calls
      };
    } catch (error) {
      console.error('Etsy earnings error:', error);
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
        `${this.baseUrl}/application/listings/active`,
        {
          params: {
            category: category || 'digital_downloads',
            limit,
            sort_on: 'score',
            sort_order: 'desc',
          },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const listings = response.data.results || [];
      return this.analyzeTrends(listings);
    } catch (error) {
      console.error('Etsy trends error:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    return [
      'Digital Downloads',
      'Printables',
      'Templates',
      'E-books',
      'Courses',
      'Graphics',
      'Fonts',
      'SVG Files',
      'PNG Files',
      'PDF Files',
    ];
  }

  async validateListing(request: ListingRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!request.title || request.title.length < 10) {
      errors.push('Title must be at least 10 characters long');
    }

    if (!request.description || request.description.length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (request.price < 0.20) {
      errors.push('Price must be at least $0.20');
    }

    if (request.tags.length < 1) {
      errors.push('At least one tag is required');
    }

    if (request.tags.length > 13) {
      errors.push('Maximum 13 tags allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private mapToProductListing(etsyListing: any): ProductListing {
    return {
      id: etsyListing.listing_id?.toString() || '',
      title: etsyListing.title || '',
      description: etsyListing.description || '',
      price: etsyListing.price || 0,
      category: etsyListing.taxonomy_path?.[0] || 'Digital Downloads',
      tags: etsyListing.tags || [],
      images: etsyListing.images?.map((img: any) => img.url_fullxfull) || [],
      status: etsyListing.state === 'active' ? 'active' : 'draft',
      marketplace: 'etsy',
      externalId: etsyListing.listing_id?.toString(),
      createdAt: new Date(etsyListing.creation_tsz * 1000),
      updatedAt: new Date(etsyListing.last_modified_tsz * 1000),
    };
  }

  private getCategoryId(category: string): number {
    const categoryMap: Record<string, number> = {
      'Digital Downloads': 69150467,
      'Printables': 69150467,
      'Templates': 69150467,
      'E-books': 69150467,
      'Courses': 69150467,
    };
    return categoryMap[category] || 69150467;
  }

  private analyzeTrends(listings: any[]): TrendData[] {
    const trends: TrendData[] = [];
    const categoryGroups: Record<string, any[]> = {};

    // Group by category
    listings.forEach(listing => {
      const category = listing.taxonomy_path?.[0] || 'Digital Downloads';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(listing);
    });

    // Analyze each category
    Object.entries(categoryGroups).forEach(([category, categoryListings]) => {
      const prices = categoryListings.map(l => l.price).filter(p => p > 0);
      const keywords = categoryListings.flatMap(l => l.tags || []);

      if (prices.length > 0) {
        trends.push({
          keywords: this.extractTopKeywords(keywords),
          salesVelocity: this.calculateSalesVelocity(categoryListings),
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
          competitionLevel: this.calculateCompetitionLevel(categoryListings.length),
          seasonality: this.detectSeasonality(categoryListings),
          targetAudience: this.inferTargetAudience(categoryListings),
          category,
          marketplace: 'etsy',
          timestamp: new Date(),
        });
      }
    });

    return trends;
  }

  private extractTopKeywords(tags: string[], limit: number = 10): string[] {
    const frequency: Record<string, number> = {};
    tags.forEach(tag => {
      frequency[tag.toLowerCase()] = (frequency[tag.toLowerCase()] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  private calculateSalesVelocity(listings: any[]): number {
    // Simplified calculation based on views and favorites
    return listings.reduce((sum, listing) => {
      return sum + (listing.views || 0) * 0.01 + (listing.num_favorers || 0) * 0.1;
    }, 0);
  }

  private calculateCompetitionLevel(count: number): 'low' | 'medium' | 'high' {
    if (count < 100) return 'low';
    if (count < 500) return 'medium';
    return 'high';
  }

  private detectSeasonality(listings: any[]): string[] {
    // Simplified seasonality detection
    const months = listings.map(l => new Date(l.creation_tsz * 1000).getMonth());
    const seasonal = ['spring', 'summer', 'fall', 'winter'];
    return seasonal; // Simplified - would need more sophisticated analysis
  }

  private inferTargetAudience(listings: any[]): string[] {
    // Simplified audience inference based on tags and categories
    const allTags = listings.flatMap(l => l.tags || []);
    const audiences = ['crafters', 'small business', 'designers', 'teachers', 'parents'];
    return audiences; // Simplified - would need more sophisticated analysis
  }
}