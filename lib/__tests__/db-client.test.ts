import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js
const mockCreateClient = vi.fn(() => ({
  from: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

describe('Database Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the module cache to allow re-importing with different env vars
    vi.resetModules();
  });

  describe('Production environment', () => {
    it('should warn if Supabase URL is missing in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.SUPABASE_URL;
      const originalKey = process.env.SUPABASE_ANON_KEY;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        process.env.NODE_ENV = 'production';
        process.env.SUPABASE_URL = '';
        process.env.SUPABASE_ANON_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        delete process.env.NEXT_PHASE; // Ensure not in build phase

        vi.resetModules();
        await import('@/lib/db/client');
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('WARNING: Supabase configuration is missing in production')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.SUPABASE_URL = originalUrl;
        process.env.SUPABASE_ANON_KEY = originalKey;
        consoleWarnSpy.mockRestore();
      }
    });

    it('should warn if Supabase anon key is missing in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.SUPABASE_URL;
      const originalKey = process.env.SUPABASE_ANON_KEY;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        process.env.NODE_ENV = 'production';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ANON_KEY = '';
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        delete process.env.NEXT_PHASE; // Ensure not in build phase

        vi.resetModules();
        await import('@/lib/db/client');

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('WARNING: Supabase configuration is missing in production')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.SUPABASE_URL = originalUrl;
        process.env.SUPABASE_ANON_KEY = originalKey;
        consoleWarnSpy.mockRestore();
      }
    });

    it('should create clients successfully when env vars are set in production', async () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'production';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        const { supabase, supabaseAdmin } = await import('@/lib/db/client');

        expect(supabase).toBeDefined();
        expect(supabaseAdmin).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key');
        expect(mockCreateClient).toHaveBeenCalledWith(
          'https://test.supabase.co',
          'test-service-role-key',
          expect.objectContaining({
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          })
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('Development environment', () => {
    it('should create placeholder client when env vars are missing', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.SUPABASE_URL;
      const originalKey = process.env.SUPABASE_ANON_KEY;

      try {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_URL = '';
        process.env.SUPABASE_ANON_KEY = '';
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

        const { supabase } = await import('@/lib/db/client');

        expect(supabase).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith('https://placeholder.supabase.co', 'placeholder-key');
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.SUPABASE_URL = originalUrl;
        process.env.SUPABASE_ANON_KEY = originalKey;
      }
    });

    it('should create admin client as null when service role key is missing', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = '';

        const { supabaseAdmin } = await import('@/lib/db/client');

        expect(supabaseAdmin).toBeNull();
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });

  describe('Service role client', () => {
    it('should create service role client with correct options', async () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        const { supabaseAdmin } = await import('@/lib/db/client');

        expect(supabaseAdmin).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith(
          'https://test.supabase.co',
          'test-service-role-key',
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
