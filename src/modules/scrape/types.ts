export interface MarketplaceProduct {
  marketplace: string;
  productId: string;
  title: string;
  price: number;
  currency?: string;
  tags: string[];
  category?: string | null;
  sales?: number | null;
  rating?: number | null;
  url?: string;
  collectedAt?: Date;
  raw?: Record<string, unknown>;
}

export interface ScrapeContext {
  jobId: string;
  metadata?: Record<string, unknown>;
}

export interface ScrapeSummary {
  count: number;
  marketplaces: Record<string, number>;
}
