/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    ENABLE_ZIG_1: process.env.ENABLE_ZIG_1 || 'false',
    ENABLE_ZIG_2: process.env.ENABLE_ZIG_2 || 'false',
    ENABLE_ZIG_3: process.env.ENABLE_ZIG_3 || 'false',
    ENABLE_ZIG_4: process.env.ENABLE_ZIG_4 || 'false',
    ENABLE_ZIG_5: process.env.ENABLE_ZIG_5 || 'false',
    ENABLE_ZIG_6: process.env.ENABLE_ZIG_6 || 'false',
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig