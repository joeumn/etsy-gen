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
    it('should error if Supabase URL is missing in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        process.env.NODE_ENV = 'production';
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        delete process.env.NEXT_PHASE; // Ensure not in build phase

        vi.resetModules();
        await import('@/lib/db/client');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('--- DATABASE CONNECTION FAILED ---')
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('MISSING: NEXT_PUBLIC_SUPABASE_URL')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        consoleErrorSpy.mockRestore();
      }
    });

    it('should error if Supabase anon key is missing in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        process.env.NODE_ENV = 'production';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        delete process.env.NEXT_PHASE; // Ensure not in build phase

        vi.resetModules();
        await import('@/lib/db/client');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('--- DATABASE CONNECTION FAILED ---')
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        consoleErrorSpy.mockRestore();
      }
    });

    it('should create clients successfully when env vars are set in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NODE_ENV = 'production';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        vi.resetModules();
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
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });

  describe('Development environment', () => {
    it('should create placeholder client when env vars are missing', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

        vi.resetModules();
        const { supabase } = await import('@/lib/db/client');

        expect(supabase).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith('https://placeholder.supabase.co', 'placeholder-key');
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
      }
    });

    it('should fallback to regular client when service role key is missing', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = '';

        vi.resetModules();
        const { supabase, supabaseAdmin } = await import('@/lib/db/client');

        expect(supabaseAdmin).toBe(supabase);
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });

  describe('Service role client', () => {
    it('should create service role client with correct options', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        vi.resetModules();
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
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });
});
