/**
 * Supabase Database Client
 * This file provides database access using Supabase with proper TypeScript types
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from './logger';

// Database Types
export type JobStage = 'SCRAPE' | 'ANALYZE' | 'GENERATE' | 'LIST';
export type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
export type ListingStatus = 'PENDING' | 'DRAFT' | 'PUBLISHED' | 'FAILED';

export interface Job {
  id: string;
  user_id?: string;
  job_key: string;
  stage: JobStage;
  status: JobStatus;
  attempts: number;
  result?: any;
  error?: any;
  started_at?: Date;
  completed_at?: Date;
  duration_ms?: number;
  metadata?: any;
  parent_job_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScrapeResult {
  id: string;
  user_id?: string;
  marketplace: string;
  product_id: string;
  title: string;
  price?: number;
  currency: string;
  tags?: string[];
  category?: string;
  sales?: number;
  rating?: number;
  collected_at: Date;
  metadata?: any;
  job_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Trend {
  id: string;
  user_id?: string;
  niche: string;
  score: number;
  tam_approx?: number;
  momentum?: number;
  competition?: number;
  summary?: string;
  recommended_assets?: any;
  metadata?: any;
  job_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  tags?: string[];
  attributes?: any;
  asset_paths?: string[];
  preview_url?: string;
  metadata?: any;
  job_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Listing {
  id: string;
  user_id?: string;
  marketplace: string;
  remote_id?: string;
  status: ListingStatus;
  price?: number;
  currency: string;
  quantity?: number;
  product_id: string;
  job_id?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Setting {
  id: string;
  user_id?: string;
  namespace: string;
  key: string;
  value: any;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKey {
  id: string;
  user_id?: string;
  namespace: string;
  name: string;
  encrypted_value: string;
  iv: string;
  last_four: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

// Supabase client initialization (lazy)
let _supabaseClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (_supabaseClient) return _supabaseClient;
  
  const supabaseUrl = env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase URL or key not configured. Database operations will fail.');
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
  }
  
  _supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return _supabaseClient;
};

// Export a client accessor
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

// Helper function to handle errors
function handleError(error: any, operation: string) {
  logger.error({ err: error }, `Database ${operation} failed`);
  throw error;
}

// Database helper functions for backward compatibility with Prisma-style queries
export const db = {
  job: {
    async findMany(params?: {
      where?: Partial<Job>;
      orderBy?: { [key: string]: 'asc' | 'desc' };
      take?: number;
      include?: any;
    }): Promise<Job[]> {
      try {
        let query = supabase.from('jobs').select('*');
        
        if (params?.where) {
          Object.entries(params.where).forEach(([key, value]) => {
            if (value !== undefined) {
              query = query.eq(key, value);
            }
          });
        }
        
        if (params?.orderBy) {
          Object.entries(params.orderBy).forEach(([key, direction]) => {
            query = query.order(key, { ascending: direction === 'asc' });
          });
        }
        
        if (params?.take) {
          query = query.limit(params.take);
        }
        
        const { data, error } = await query;
        if (error) {
          logger.error({ err: error }, 'Database job.findMany failed');
          return [];
        }
        return data || [];
      } catch (error) {
        logger.error({ err: error }, 'Database job.findMany failed');
        return [];
      }
    },
    
    async findUnique(params: { where: { id?: string; job_key?: string } }) {
      try {
        let query = supabase.from('jobs').select('*');
        
        if (params.where.id) {
          query = query.eq('id', params.where.id);
        } else if (params.where.job_key) {
          query = query.eq('job_key', params.where.job_key);
        }
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return data || null;
      } catch (error) {
        return handleError(error, 'job.findUnique');
      }
    },
    
    async create(params: { data: Partial<Job> }) {
      try {
        const { data, error } = await supabase.from('jobs').insert([params.data]).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'job.create');
      }
    },
    
    async update(params: { where: { id: string }; data: Partial<Job> }) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .update(params.data)
          .eq('id', params.where.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'job.update');
      }
    },
    
    async delete(params: { where: { id: string } }) {
      try {
        const { error } = await supabase.from('jobs').delete().eq('id', params.where.id);
        if (error) throw error;
      } catch (error) {
        return handleError(error, 'job.delete');
      }
    }
  },
  
  listing: {
    async findMany(params?: {
      where?: Partial<Listing> | { status?: { in: string[] } | ListingStatus; [key: string]: any };
      orderBy?: { [key: string]: 'asc' | 'desc' };
      take?: number;
      include?: any;
    }): Promise<any[]> {
      try {
        let query = supabase.from('listings').select('*, product:products(*)');
        
        if (params?.where) {
          Object.entries(params.where).forEach(([key, value]) => {
            if (key === 'status' && value && typeof value === 'object' && 'in' in value) {
              query = query.in('status', (value as any).in);
            } else if (value !== undefined) {
              query = query.eq(key, value);
            }
          });
        }
        
        if (params?.orderBy) {
          Object.entries(params.orderBy).forEach(([key, direction]) => {
            query = query.order(key, { ascending: direction === 'asc' });
          });
        }
        
        if (params?.take) {
          query = query.limit(params.take);
        }
        
        const { data, error } = await query;
        if (error) {
          logger.error({ err: error }, 'Database listing.findMany failed');
          return [];
        }
        return data || [];
      } catch (error) {
        logger.error({ err: error }, 'Database listing.findMany failed');
        return [];
      }
    },
    
    async create(params: { data: Partial<Listing> }) {
      try {
        const { data, error } = await supabase.from('listings').insert([params.data]).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'listing.create');
      }
    },
    
    async update(params: { where: { id: string }; data: Partial<Listing> }) {
      try {
        const { data, error } = await supabase
          .from('listings')
          .update(params.data)
          .eq('id', params.where.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'listing.update');
      }
    }
  },
  
  scrapeResult: {
    async create(params: { data: Partial<ScrapeResult> }) {
      try {
        const { data, error } = await supabase.from('scrape_results').insert([params.data]).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'scrapeResult.create');
      }
    },
    
    async upsert(params: { where: { marketplace_productId_collectedAt: { marketplace: string; productId: string; collectedAt: Date } }; create: Partial<ScrapeResult>; update: Partial<ScrapeResult> }) {
      try {
        // Supabase doesn't support composite unique constraints in upsert directly
        // So we need to check if it exists first, then update or create
        const { marketplace, productId, collectedAt } = params.where.marketplace_productId_collectedAt;
        
        const { data: existing } = await supabase
          .from('scrape_results')
          .select('*')
          .eq('marketplace', marketplace)
          .eq('product_id', productId)
          .eq('collected_at', collectedAt.toISOString())
          .single();
        
        if (existing) {
          const { data, error } = await supabase
            .from('scrape_results')
            .update(params.update)
            .eq('id', existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('scrape_results')
            .insert([{ ...params.create, marketplace, product_id: productId, collected_at: collectedAt }])
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      } catch (error) {
        return handleError(error, 'scrapeResult.upsert');
      }
    }
  },
  
  trend: {
    async findMany(params?: {
      where?: Partial<Trend>;
      orderBy?: { [key: string]: 'asc' | 'desc' };
      take?: number;
    }): Promise<Trend[]> {
      try {
        let query = supabase.from('trends').select('*');
        
        if (params?.where) {
          Object.entries(params.where).forEach(([key, value]) => {
            if (value !== undefined) {
              query = query.eq(key, value);
            }
          });
        }
        
        if (params?.orderBy) {
          Object.entries(params.orderBy).forEach(([key, direction]) => {
            query = query.order(key, { ascending: direction === 'asc' });
          });
        }
        
        if (params?.take) {
          query = query.limit(params.take);
        }
        
        const { data, error } = await query;
        if (error) {
          logger.error({ err: error }, 'Database trend.findMany failed');
          return [];
        }
        return data || [];
      } catch (error) {
        logger.error({ err: error }, 'Database trend.findMany failed');
        return [];
      }
    },
    
    async create(params: { data: Partial<Trend> }) {
      try {
        const { data, error } = await supabase.from('trends').insert([params.data]).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'trend.create');
      }
    },
    
    async upsert(params: { where: { id: string }; create: Partial<Trend>; update: Partial<Trend> }) {
      try {
        const { data, error } = await supabase
          .from('trends')
          .upsert([{
            id: params.where.id,
            ...params.create,
            ...params.update
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'trend.upsert');
      }
    }
  },
  
  product: {
    async create(params: { data: Partial<Product> }): Promise<Product> {
      try {
        const { data, error } = await supabase.from('products').insert([params.data]).select().single();
        if (error) throw error;
        return data as Product;
      } catch (error) {
        handleError(error, 'product.create');
        throw error; // This line will never execute but satisfies TypeScript
      }
    },
    
    async findUnique(params: { where: { id: string } }): Promise<Product | null> {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.where.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        handleError(error, 'product.findUnique');
        return null;
      }
    },
    
    async update(params: { where: { id: string }; data: Partial<Product> }): Promise<Product> {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(params.data)
          .eq('id', params.where.id)
          .select()
          .single();
        if (error) throw error;
        return data as Product;
      } catch (error) {
        handleError(error, 'product.update');
        throw error;
      }
    }
  },
  
  setting: {
    async findUnique(params: { where: { namespace_key?: { namespace: string; key: string } } }) {
      try {
        if (!params.where.namespace_key) return null;
        
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('namespace', params.where.namespace_key.namespace)
          .eq('key', params.where.namespace_key.key)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        return handleError(error, 'setting.findUnique');
      }
    },
    
    async upsert(params: { where: { namespace_key: { namespace: string; key: string } }; create: Partial<Setting>; update: Partial<Setting> }) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .upsert([{
            namespace: params.where.namespace_key.namespace,
            key: params.where.namespace_key.key,
            ...params.create,
            ...params.update
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'setting.upsert');
      }
    }
  },
  
  apiKey: {
    async findUnique(params: { where: { namespace_name?: { namespace: string; name: string } } }) {
      try {
        if (!params.where.namespace_name) return null;
        
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('namespace', params.where.namespace_name.namespace)
          .eq('name', params.where.namespace_name.name)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        return handleError(error, 'apiKey.findUnique');
      }
    },
    
    async upsert(params: { where: { namespace_name: { namespace: string; name: string } }; create: Partial<ApiKey>; update: Partial<ApiKey> }) {
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .upsert([{
            namespace: params.where.namespace_name.namespace,
            name: params.where.namespace_name.name,
            ...params.create,
            ...params.update
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        return handleError(error, 'apiKey.upsert');
      }
    }
  }
};

// Export prisma-compatible interface for easier migration
export const prisma = db;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('jobs').select('id').limit(1);
    return !error;
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
    return false;
  }
}
