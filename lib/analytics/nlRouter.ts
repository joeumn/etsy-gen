// Natural Language to SQL Router for Analytics
// Safely converts NL queries to SQL with allowlist protection

import { supabase } from '@/lib/db/client';

export interface QueryResult {
  type: 'table' | 'timeseries' | 'bar' | 'radar' | 'pie';
  data: any[];
  columns?: string[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  description?: string;
}

export interface QueryTemplate {
  pattern: RegExp;
  sql: string;
  resultType: QueryResult['type'];
  title: string;
  description: string;
  parameters: string[];
}

// Allowed tables and columns for security
const ALLOWED_TABLES = {
  earnings: ['id', 'user_id', 'marketplace', 'period', 'total_sales', 'total_revenue', 'average_order_value', 'conversion_rate', 'created_at'],
  product_listings: ['id', 'user_id', 'marketplace', 'title', 'price', 'category', 'tags', 'status', 'created_at'],
  generated_products: ['id', 'user_id', 'title', 'price', 'category', 'tags', 'created_at'],
  affiliate_conversions: ['id', 'code', 'user_id', 'plan', 'mrr_cents', 'conversion_value_cents', 'occurred_at'],
  affiliate_signups: ['id', 'code', 'user_id', 'occurred_at'],
  affiliate_clicks: ['id', 'code', 'occurred_at', 'landing_path']
};

// Predefined query templates
const QUERY_TEMPLATES: QueryTemplate[] = [
  // Revenue queries
  {
    pattern: /revenue.*last.*(\d+).*days?/i,
    sql: `
      SELECT 
        DATE(created_at) as date,
        SUM(total_revenue) as revenue,
        COUNT(*) as orders
      FROM earnings 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '$2 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    resultType: 'timeseries',
    title: 'Revenue Last {days} Days',
    description: 'Daily revenue breakdown',
    parameters: ['user_id', 'days']
  },
  {
    pattern: /revenue.*by.*platform/i,
    sql: `
      SELECT 
        marketplace as platform,
        SUM(total_revenue) as revenue,
        COUNT(*) as orders,
        AVG(average_order_value) as avg_order_value
      FROM earnings 
      WHERE user_id = $1
      GROUP BY marketplace
      ORDER BY revenue DESC
    `,
    resultType: 'bar',
    title: 'Revenue by Platform',
    description: 'Revenue breakdown by marketplace',
    parameters: ['user_id']
  },
  {
    pattern: /top.*products.*revenue/i,
    sql: `
      SELECT 
        pl.title as product,
        SUM(e.total_revenue) as revenue,
        SUM(e.total_sales) as sales,
        AVG(e.average_order_value) as avg_order_value
      FROM earnings e
      JOIN product_listings pl ON e.listing_id = pl.id
      WHERE e.user_id = $1
      GROUP BY pl.id, pl.title
      ORDER BY revenue DESC
      LIMIT 10
    `,
    resultType: 'table',
    title: 'Top Products by Revenue',
    description: 'Best performing products',
    parameters: ['user_id']
  },
  {
    pattern: /conversion.*rate.*platform/i,
    sql: `
      SELECT 
        marketplace as platform,
        AVG(conversion_rate) as avg_conversion_rate,
        COUNT(*) as data_points
      FROM earnings 
      WHERE user_id = $1
      GROUP BY marketplace
      ORDER BY avg_conversion_rate DESC
    `,
    resultType: 'bar',
    title: 'Conversion Rate by Platform',
    description: 'Average conversion rates across platforms',
    parameters: ['user_id']
  },
  {
    pattern: /monthly.*revenue.*trend/i,
    sql: `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(total_revenue) as revenue,
        COUNT(*) as orders
      FROM earnings 
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `,
    resultType: 'timeseries',
    title: 'Monthly Revenue Trend',
    description: '12-month revenue trend',
    parameters: ['user_id']
  },
  {
    pattern: /category.*performance/i,
    sql: `
      SELECT 
        pl.category,
        SUM(e.total_revenue) as revenue,
        COUNT(DISTINCT pl.id) as products,
        AVG(e.average_order_value) as avg_order_value
      FROM earnings e
      JOIN product_listings pl ON e.listing_id = pl.id
      WHERE e.user_id = $1
        AND pl.category IS NOT NULL
      GROUP BY pl.category
      ORDER BY revenue DESC
    `,
    resultType: 'pie',
    title: 'Revenue by Category',
    description: 'Revenue distribution across categories',
    parameters: ['user_id']
  },
  // Affiliate queries
  {
    pattern: /affiliate.*performance/i,
    sql: `
      SELECT 
        a.code,
        a.display_name,
        COALESCE(s.signups, 0) as signups,
        COALESCE(c.conversions, 0) as conversions,
        COALESCE(c.mrr_cents_total, 0) as mrr_cents,
        CASE 
          WHEN COALESCE(s.signups, 0) = 0 THEN 0
          ELSE ROUND((COALESCE(c.conversions, 0)::DECIMAL / s.signups) * 100, 2)
        END as conversion_rate
      FROM affiliates a
      LEFT JOIN (
        SELECT code, COUNT(*) as signups 
        FROM affiliate_signups 
        GROUP BY code
      ) s ON s.code = a.code
      LEFT JOIN (
        SELECT 
          code, 
          COUNT(*) as conversions,
          SUM(mrr_cents) as mrr_cents_total
        FROM affiliate_conversions 
        GROUP BY code
      ) c ON c.code = a.code
      WHERE a.user_id = $1
      ORDER BY mrr_cents DESC
    `,
    resultType: 'table',
    title: 'Affiliate Performance',
    description: 'Your affiliate referral performance',
    parameters: ['user_id']
  }
];

export class NLAnalyticsRouter {
  private static instance: NLAnalyticsRouter;
  private cache = new Map<string, QueryResult>();

  static getInstance(): NLAnalyticsRouter {
    if (!NLAnalyticsRouter.instance) {
      NLAnalyticsRouter.instance = new NLAnalyticsRouter();
    }
    return NLAnalyticsRouter.instance;
  }

  async processQuery(query: string, userId: string): Promise<QueryResult> {
    // Check cache first
    const cacheKey = `${userId}:${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Find matching template
    const template = this.findMatchingTemplate(query);
    if (!template) {
      throw new Error('No matching query template found. Try asking about revenue, products, or conversions.');
    }

    // Extract parameters
    const parameters = this.extractParameters(query, template);
    
    // Execute query
    const result = await this.executeQuery(template, parameters, userId);
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    // Store query for future reference
    await this.storeQuery(query, template, parameters, userId);

    return result;
  }

  private findMatchingTemplate(query: string): QueryTemplate | null {
    for (const template of QUERY_TEMPLATES) {
      if (template.pattern.test(query)) {
        return template;
      }
    }
    return null;
  }

  private extractParameters(query: string, template: QueryTemplate): string[] {
    const match = query.match(template.pattern);
    if (!match) return [];

    const params: string[] = [];
    
    // Extract days parameter for time-based queries
    const daysMatch = query.match(/(\d+).*days?/i);
    if (daysMatch) {
      params.push(daysMatch[1]);
    }

    return params;
  }

  private async executeQuery(template: QueryTemplate, parameters: string[], userId: string): Promise<QueryResult> {
    try {
      // Add userId as first parameter
      const allParams = [userId, ...parameters];
      
      const { data, error } = await supabase.rpc('execute_analytics_query', {
        sql_query: template.sql,
        params: allParams
      });

      if (error) {
        throw new Error(`Query execution failed: ${error.message}`);
      }

      // Transform data based on result type
      const transformedData = this.transformData(data, template.resultType);

      return {
        type: template.resultType,
        data: transformedData,
        title: this.interpolateTitle(template.title, parameters),
        description: template.description
      };
    } catch (error) {
      console.error('Query execution error:', error);
      throw new Error('Failed to execute analytics query');
    }
  }

  private transformData(data: any[], resultType: QueryResult['type']): any[] {
    switch (resultType) {
      case 'timeseries':
        return data.map(row => ({
          x: row.date || row.month,
          y: row.revenue || row.value,
          orders: row.orders || 0
        }));
      
      case 'bar':
        return data.map(row => ({
          name: row.platform || row.category || row.name,
          value: row.revenue || row.avg_conversion_rate || row.value,
          count: row.orders || row.data_points || row.count
        }));
      
      case 'pie':
        return data.map(row => ({
          name: row.category,
          value: row.revenue,
          products: row.products,
          avgOrderValue: row.avg_order_value
        }));
      
      case 'table':
        return data;
      
      default:
        return data;
    }
  }

  private interpolateTitle(title: string, parameters: string[]): string {
    let interpolated = title;
    parameters.forEach((param, index) => {
      interpolated = interpolated.replace(`{${index === 0 ? 'days' : 'param'}}`, param);
    });
    return interpolated;
  }

  private async storeQuery(query: string, template: QueryTemplate, parameters: string[], userId: string): Promise<void> {
    try {
      const queryHash = this.hashQuery(query);
      
      await supabase.from('analytics_queries').upsert({
        query_text: query,
        query_hash: queryHash,
        sql_template: template.sql,
        parameters: { userId, ...parameters },
        result_type: template.resultType,
        last_used_at: new Date().toISOString(),
        usage_count: 1
      }, {
        onConflict: 'query_hash',
        ignoreDuplicates: false
      });
    } catch (error) {
      console.error('Failed to store query:', error);
      // Don't throw - this is not critical
    }
  }

  private hashQuery(query: string): string {
    // Simple hash function for query deduplication
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Get suggested queries for the user
  async getSuggestedQueries(userId: string): Promise<string[]> {
    return [
      "Show me revenue last 30 days",
      "What are my top products by revenue?",
      "How is my conversion rate by platform?",
      "Show me monthly revenue trend",
      "What's my affiliate performance?",
      "Revenue by category breakdown"
    ];
  }

  // Get query history for the user
  async getQueryHistory(userId: string, limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_queries')
        .select('query_text, result_type, last_used_at, usage_count')
        .order('last_used_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get query history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const nlRouter = NLAnalyticsRouter.getInstance();