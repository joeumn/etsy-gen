import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENABLE_ZIG3_STUDIO: process.env.ENABLE_ZIG3_STUDIO || 'true',
    ENABLE_ZIG4_STRIPE: process.env.ENABLE_ZIG4_STRIPE || 'true',
    ENABLE_ZIG5_SOCIAL: process.env.ENABLE_ZIG5_SOCIAL || 'true',
    ENABLE_ZIG6_BRANDING: process.env.ENABLE_ZIG6_BRANDING || 'true',
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
};

export default nextConfig;
