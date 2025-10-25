import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js
const mockCreateClient = vi.fn(() => ({
  from: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

describe('Admin Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the module cache to allow re-importing with different env vars
    vi.resetModules();
  });

  describe('Production environment', () => {
    it('should create placeholder client when env vars are missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        delete process.env.NEXT_PHASE; // Ensure not in build phase

        vi.resetModules();
        const { supabase } = await import('@/lib/supabase/admin-client');
        
        // Should create placeholder client to avoid build failures
        expect(supabase).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith('https://placeholder.supabase.co', 'placeholder-key');
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
      }
    });

    it('should create clients successfully when env vars are set in production', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        vi.resetModules();
        const { supabase, supabaseAdmin } = await import('@/lib/supabase/admin-client');

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
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });

  describe('Development environment', () => {
    it('should create placeholder client when env vars are missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

        vi.resetModules();
        const { supabase } = await import('@/lib/supabase/admin-client');

        expect(supabase).toBeDefined();
        expect(mockCreateClient).toHaveBeenCalledWith('https://placeholder.supabase.co', 'placeholder-key');
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
      }
    });

    it('should fallback to regular client when service role key is missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = '';

        vi.resetModules();
        const { supabase, supabaseAdmin } = await import('@/lib/supabase/admin-client');

        expect(supabaseAdmin).toBe(supabase);
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });

  describe('Service role client', () => {
    it('should create service role client with correct options', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

        vi.resetModules();
        const { supabaseAdmin } = await import('@/lib/supabase/admin-client');

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
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
      }
    });
  });
});
