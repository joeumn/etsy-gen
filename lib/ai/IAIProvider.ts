export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateProductRequest {
  trendData: TrendData;
  productType: 'digital_download' | 'printable' | 'template' | 'ebook' | 'course';
  targetMarketplace: 'etsy' | 'amazon' | 'shopify';
  customPrompt?: string;
}

export interface TrendData {
  keywords: string[];
  salesVelocity: number;
  priceRange: { min: number; max: number };
  competitionLevel: 'low' | 'medium' | 'high';
  seasonality: string[];
  targetAudience: string[];
}

export interface GeneratedProduct {
  title: string;
  description: string;
  tags: string[];
  price: number;
  category: string;
  seoKeywords: string[];
  imagePrompt?: string;
  content?: string; // For digital products like PDFs, templates
  specifications?: Record<string, any>;
}

export interface AIProvider {
  name: string;
  isAvailable: boolean;
  
  generateProduct(request: GenerateProductRequest): Promise<GeneratedProduct>;
  analyzeTrends(data: any[]): Promise<TrendData[]>;
  generateImage(prompt: string): Promise<string>; // Returns image URL or base64
  generateListingContent(product: GeneratedProduct, marketplace: string): Promise<string>;
}

export interface TrendAnalysisResult {
  trends: TrendData[];
  summary: string;
  recommendations: string[];
  confidence: number;
}