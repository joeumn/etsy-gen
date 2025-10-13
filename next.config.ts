import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENABLE_ZIG3_STUDIO: process.env.ENABLE_ZIG3_STUDIO || 'false',
    ENABLE_ZIG4_STRIPE: process.env.ENABLE_ZIG4_STRIPE || 'false',
    ENABLE_ZIG5_SOCIAL: process.env.ENABLE_ZIG5_SOCIAL || 'false',
    ENABLE_ZIG6_BRANDING: process.env.ENABLE_ZIG6_BRANDING || 'false',
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
};

export default nextConfig;
