export interface MarketplaceConfig {
  apiKey: string;
  secret?: string;
  baseUrl?: string;
  region?: string;
}

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  status: 'draft' | 'active' | 'inactive' | 'sold_out';
  marketplace: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  specifications?: Record<string, any>;
}

export interface ListingResponse {
  success: boolean;
  listingId?: string;
  externalId?: string;
  error?: string;
  listing?: ProductListing;
}

export interface EarningsData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
}

export interface TrendData {
  keywords: string[];
  salesVelocity: number;
  priceRange: { min: number; max: number };
  competitionLevel: 'low' | 'medium' | 'high';
  seasonality: string[];
  targetAudience: string[];
  category: string;
  marketplace: string;
  timestamp: Date;
}

export abstract class BaseMarketplace {
  protected config: MarketplaceConfig;
  public name: string;
  public isAvailable: boolean;

  constructor(config: MarketplaceConfig, name: string) {
    this.config = config;
    this.name = name;
    this.isAvailable = !!config.apiKey;
  }

  abstract listProduct(request: ListingRequest): Promise<ListingResponse>;
  abstract updateProduct(listingId: string, request: Partial<ListingRequest>): Promise<ListingResponse>;
  abstract deleteProduct(listingId: string): Promise<boolean>;
  abstract getProduct(listingId: string): Promise<ProductListing | null>;
  abstract getEarnings(period: string): Promise<EarningsData>;
  abstract scanTrends(category?: string, limit?: number): Promise<TrendData[]>;
  abstract getCategories(): Promise<string[]>;
  abstract validateListing(request: ListingRequest): Promise<{ valid: boolean; errors: string[] }>;
}