import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthenticatedUser, requireAuth } from '../auth-session';
import { getUserById } from '../auth-helper';

// Mock the dependencies
vi.mock('../auth-helper', () => ({
  getUserById: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('Auth Session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    it('should return user when valid user ID in headers', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar_url: null,
        is_active: true,
        email_verified: true,
      };

      // Mock headers
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'x-user-id') return 'user-123';
          if (key === 'x-user-email') return 'test@example.com';
          return null;
        }),
      } as any);

      // Mock getUserById
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      const result = await getAuthenticatedUser();

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        avatar_url: mockUser.avatar_url,
      });
    });

    it('should return null when no user ID in headers', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn(() => null),
      } as any);

      const result = await getAuthenticatedUser();

      expect(result).toBeNull();
    });

    it('should return null when user not found in database', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'x-user-id') return 'user-123';
          return null;
        }),
      } as any);

      vi.mocked(getUserById).mockResolvedValue(null);

      const result = await getAuthenticatedUser();

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar_url: null,
        is_active: true,
        email_verified: true,
      };

      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'x-user-id') return 'user-123';
          if (key === 'x-user-email') return 'test@example.com';
          return null;
        }),
      } as any);

      vi.mocked(getUserById).mockResolvedValue(mockUser);

      const result = await requireAuth();

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        avatar_url: mockUser.avatar_url,
      });
    });

    it('should throw error when not authenticated', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn(() => null),
      } as any);

      await expect(requireAuth()).rejects.toThrow('Unauthorized - No valid session');
    });
  });
});
