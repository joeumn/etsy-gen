// Simple authentication for private app
// Hardcoded credentials for single user access

export interface User {
  id: string;
  email: string;
  name: string;
}

// Hardcoded credentials (in production, use environment variables)
const VALID_CREDENTIALS = {
  email: 'admin@foundersforge.com',
  password: 'forge2024!'
};

export class AuthService {
  private static readonly AUTH_KEY = 'foundersforge_auth';

  static async login(email: string, password: string): Promise<User | null> {
    // Simple credential validation
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const user: User = {
        id: 'admin-user',
        email: VALID_CREDENTIALS.email,
        name: 'FoundersForge Admin'
      };

      // Store in localStorage
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      return user;
    }

    return null;
  }

  static logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}
