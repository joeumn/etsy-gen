# FoundersForge - AI-Powered Product Creation Platform

A comprehensive Next.js 14 + TypeScript + Tailwind + shadcn/ui application that transforms trending data into profitable digital products using AI. This project implements the complete "Zig" layer system for advanced product creation, monetization, and branding, now including a "Stage 4" automation engine for a fully autonomous, self-running profit machine.

## ��� Features

### Core Platform
- **AI Trend Analysis**: Discover trending products across Etsy, Amazon, and Shopify
- **Instant Product Generation**: Generate complete product listings with AI
- **Revenue Tracking**: Monitor earnings and optimize product strategy
- **Multi-Marketplace Support**: Etsy, Amazon, and Shopify integrations

### Stage 4 - Automation Engine (Passive Mode)
- **Auto-Content & Product Lifecycle**: Automatically generates, lists, and manages products.
- **Dynamic Pricing & Revenue AI**: AI-powered price optimization for maximum profitability.
- **Autonomous Marketing & Traffic**: Generates and schedules social media content to drive traffic.
- **Affiliate Flywheel**: Automatically manages and recruits affiliates.
- **Auto-Learning & Strategy Loop**: Daily AI-driven strategy reports and performance optimization.
- **Cashflow Automation**: Tracks payouts and suggests reinvestment opportunities.
- **Automation Hub**: A dedicated dashboard to monitor the entire autonomous system.

### Zig 3 - AI Design Studio
- **Image Generation**: Create product mockups and designs with AI
- **Asset Management**: Save and organize design assets
- **Studio Canvas**: Interactive design workspace
- **Integration Ready**: Use generated assets in product listings

### Zig 4 - Monetization & Upsells
- **Stripe Integration**: Complete billing and subscription management
- **Usage Tracking**: Monitor API usage and limits
- **Pricing Tiers**: Free, Pro, and Enterprise plans
- **Customer Portal**: Self-service billing management

### Zig 5 - Social Signal Engine
- **Social Media Analysis**: Monitor TikTok, Pinterest, Instagram trends
- **Trend Scoring**: Weighted scoring system (60% sales + 40% social)
- **Real-time Data**: Mock social media data integration
- **Visualization**: Radar charts for trend analysis

### Zig 6 - Auto-Branding AI
- **Brand Generation**: AI-powered brand identity creation
- **Logo Design**: Automated logo generation
- **Color Palettes**: AI-curated color schemes
- **Typography**: Font pairing recommendations
- **Brand Kits**: Downloadable brand assets

### UI/UX Enhancements
- **Framer Motion**: Smooth animations and transitions
- **Dark Mode**: Complete dark/light theme support
- **Responsive Design**: Mobile-first approach
- **FoundersForge Palette**: Custom flame gradient theme
- **Accessibility**: WCAG compliant components

## ���️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: Google Gemini, OpenAI, Anthropic Claude
- **State Management**: React hooks + Context

## ��� Project Structure

\`\`\`
/workspace
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auto-create/          # Stage 4 - Auto Product Creation
│   │   ├── auto-price/           # Stage 4 - Auto Pricing
│   │   ├── auto-market/          # Stage 4 - Auto Marketing
│   │   ├── auto-optimize/        # Stage 4 - Auto-Optimization
│   │   ├── auto-cashflow/        # Stage 4 - Auto Cashflow
│   │   ├── auto-recruit/         # Stage 4 - Auto Affiliate Recruitment
│   │   ├── brand/                # Zig 6 - Auto-Branding
│   │   ├── earnings/             # Revenue tracking
│   │   ├── generate/             # Product generation
│   │   ├── list/                 # Product listings
│   │   ├── scan/                 # Trend scanning
│   │   ├── social-scan/          # Zig 5 - Social Signals
│   │   ├── studio/               # Zig 3 - Design Studio
│   │   └── stripe/               # Zig 4 - Payments
│   ├── automation/               # Stage 4 - Automation Hub
│   ├── dashboard/                # Main dashboard
│   ├── pricing/                  # Pricing page
│   ├── settings/                 # User settings
│   ├── studio/                   # AI Design Studio
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/                          # Utilities and services
│   ├── ai/                       # AI provider integrations (including pricing.ts)
│   ├── db/                       # Database schema (including stage4-migrations.sql)
│   ├── marketplaces/             # Marketplace APIs
│   └── payments/                 # Stripe integration
├── src/
│   └── components/
│       └── ui/                   # Reusable UI components
├── .env.example                  # Environment variables
├── tailwind.config.js            # Tailwind configuration
└── package.json
\`\`\`

## ��� Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Stripe account (for payments)
- AI provider API keys

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd ai-product-dashboard
   pnpm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your API keys and configuration, and enable the Stage 4 features:
   \`\`\`env
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Providers
   GOOGLE_AI_API_KEY=your_google_ai_key
   OPENAI_API_KEY=your_openai_key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Cron Job Security
   CRON_SECRET=your_secret_cron_token
   
   # Feature Flags
   ENABLE_ZIG3_STUDIO=true
   ENABLE_ZIG4_STRIPE=true
   ENABLE_ZIG5_SOCIAL=true
   ENABLE_ZIG6_BRANDING=true
   ENABLE_STAGE4_AUTOCREATE=true
   ENABLE_STAGE4_AUTOMARKET=true
   ENABLE_STAGE4_AUTOPRICING=true
   ENABLE_STAGE4_AUTOOPTIMIZE=true
   ENABLE_STAGE4_AUTOAFFILIATES=true
   ENABLE_STAGE4_AUTOCASHFLOW=true
   \`\`\`

3. **Set up database**
   Run the SQL from \`lib/db/stage3-migrations.sql\` and \`lib/db/stage4-migrations.sql\` in your Supabase dashboard.

4. **Start development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

5. **Open your browser**
   Navigate to \`http://localhost:3000\`

## ��� Design System

### Color Palette
- **Ocean**: #2D9CDB (Primary blue)
- **Flame**: #FF6B22 (Secondary orange) 
- **Gold**: #FFC400 (Accent yellow)
- **Gradients**: Custom flame and ocean gradients

### Typography
- **Headings**: Inter (sans-serif)
- **Body**: Inter (sans-serif)
- **Accent**: Playfair Display (serif)

### Components
- **StatCard**: Animated statistics display
- **RevenueChart**: Recharts integration
- **BrandKitModal**: Brand kit viewer
- **StudioCanvas**: Design workspace
- **PricingDialog**: Subscription management

## ��� Feature Flags

Control feature availability via environment variables:

\`\`\`env
ENABLE_ZIG3_STUDIO=true    # AI Design Studio
ENABLE_ZIG4_STRIPE=true    # Stripe payments
ENABLE_ZIG5_SOCIAL=true    # Social signals
ENABLE_ZIG6_BRANDING=true  # Auto-branding
ENABLE_STAGE4_AUTOCREATE=true # Auto-create products
ENABLE_STAGE4_AUTOMARKET=true # Auto-market products
ENABLE_STAGE4_AUTOPRICING=true # Dynamic pricing
ENABLE_STAGE4_AUTOOPTIMIZE=true # Auto-optimization
ENABLE_STAGE4_AUTOAFFILIATES=true # Auto-affiliate management
ENABLE_STAGE4_AUTOCASHFLOW=true # Auto-cashflow tracking
\`\`\`

## ��� API Endpoints

### Core Features
- \`POST /api/generate\` - Generate products
- \`GET /api/scan\` - Scan trends
- \`GET /api/earnings\` - Get revenue data

### Stage 4 Automation (Cron Jobs)
- \`GET /api/auto-create\` - Generate & list new products daily.
- \`GET /api/auto-price\` - Reprice existing products.
- \`GET /api/auto-market\` - Post to social platforms.
- \`GET /api/auto-optimize\` - Analyze performance & write report.
- \`GET /api/auto-cashflow\` - Record and reinvest profits.
- \`GET /api/auto-recruit\` - Outreach for affiliates/influencers.

### Zig Modules
- \`POST /api/studio/generate\` - Generate design assets
- \`POST /api/stripe/checkout\` - Create checkout session
- \`POST /api/social-scan\` - Analyze social trends
- \`POST /api/brand/generate\` - Generate brand kit

## ��� Usage Examples

### Generate a Product
\`\`\`typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trendData: { category: 'digital_downloads' },
    productType: 'template',
    targetMarketplace: 'etsy'
  })
});
\`\`\`

### Create Design Asset
\`\`\`typescript
const response = await fetch('/api/studio/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Minimalist planner template',
    userId: 'user123'
  })
});
\`\`\`

## ��� Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure cron jobs in \`vercel.json\` to trigger the \`/api/auto-*\` endpoints.
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Use \`next build && next export\`
- **Railway**: Deploy with Docker
- **AWS**: Use Amplify or ECS

## ��� Testing

\`\`\`bash
# Run tests
pnpm test

# Run with UI
pnpm test:ui

# Type checking
pnpm type-check

# Linting
pnpm lint
\`\`\`

## ��� Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Core Web Vitals**: Optimized
- **Bundle Size**: Tree-shaken and optimized
- **Images**: Next.js Image optimization

## ��� Security

- **API Keys**: Server-side only
- **Authentication**: NextAuth.js integration ready
- **CORS**: Properly configured
- **Rate Limiting**: Implemented on API routes

## ��� Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ��� License

This project is licensed under the MIT License - see the LICENSE file for details.

## ��� Support

- **Documentation**: Check this README
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@foundersforge.com

## ��� Acknowledgments

- **shadcn/ui** for beautiful components
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Next.js** for the amazing framework
- **Supabase** for the backend infrastructure

---

**Built with ❤️ by the FoundersForge team**
