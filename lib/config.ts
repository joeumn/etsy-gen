/**
 * Application Configuration
 * Central configuration management for The Forge
 */

export const APP_CONFIG = {
  // App Information
  name: 'The Forge',
  tagline: 'Never Build Alone.',
  company: 'FoundersForge',
  description: 'AI That Builds Wealth for You',
  
  // Brand Colors
  colors: {
    flame: '#FF6B22',
    ocean: '#2D9CDB',
    gold: '#FFC400',
    dark: '#1C463C',
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
  },
  
  // Feature Flags
  features: {
    signup: false, // Signup disabled - invite only
    socialAuth: false,
    googleDrive: process.env.ENABLE_GOOGLE_DRIVE === 'true',
    autoScheduler: process.env.ENABLE_AUTO_SCHEDULER === 'true',
    aiCopyGenerator: true,
    themeEditor: false,
  },
  
  // Marketplace Configuration
  marketplaces: {
    etsy: {
      name: 'Etsy',
      enabled: !!process.env.ETSY_API_KEY,
      icon: '🎨',
    },
    shopify: {
      name: 'Shopify',
      enabled: !!process.env.SHOPIFY_ACCESS_TOKEN,
      icon: '🛍️',
    },
    amazon: {
      name: 'Amazon',
      enabled: !!process.env.AMAZON_ACCESS_KEY,
      icon: '📦',
    },
    gumroad: {
      name: 'Gumroad',
      enabled: false,
      icon: '💰',
    },
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // Cache TTL (seconds)
  cache: {
    dashboard: 300, // 5 minutes
    analytics: 600, // 10 minutes
    products: 180, // 3 minutes
    trends: 900, // 15 minutes
  },
  
  // Rate Limiting
  rateLimit: {
    free: 100,
    pro: 500,
    enterprise: 2000,
  },
  
  // URLs
  urls: {
    home: '/',
    login: '/auth/login',
    dashboard: '/dashboard',
    analytics: '/analytics',
    products: '/products',
    marketplaces: '/marketplaces',
    integrations: '/integrations',
    settings: '/settings',
    support: '/support',
  },
} as const;

/**
 * Get environment name
 */
export const getEnvironment = (): 'development' | 'production' | 'test' => {
  return (process.env.NODE_ENV as any) || 'development';
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.features): boolean => {
  return APP_CONFIG.features[feature] ?? false;
};

/**
 * Check if marketplace is enabled
 */
export const isMarketplaceEnabled = (marketplace: keyof typeof APP_CONFIG.marketplaces): boolean => {
  return APP_CONFIG.marketplaces[marketplace]?.enabled ?? false;
};

/**
 * Get enabled marketplaces
 */
export const getEnabledMarketplaces = () => {
  return Object.entries(APP_CONFIG.marketplaces)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({
      id: key,
      ...config,
    }));
};

