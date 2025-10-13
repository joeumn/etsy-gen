# FoundersForge - AI-Powered Product Creation Platform

A comprehensive Next.js 14 + TypeScript + Tailwind + shadcn/ui application that transforms trending data into profitable digital products using AI. This project implements the complete "Zig" layer system for advanced product creation, monetization, and branding.

## 🚀 Features

### Core Platform
- **AI Trend Analysis**: Discover trending products across Etsy, Amazon, and Shopify
- **Instant Product Generation**: Generate complete product listings with AI
- **Revenue Tracking**: Monitor earnings and optimize product strategy
- **Multi-Marketplace Support**: Etsy, Amazon, and Shopify integrations

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

## 🛠️ Tech Stack

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

## 📁 Project Structure

```
/workspace
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── brand/               # Zig 6 - Auto-Branding
│   │   ├── earnings/            # Revenue tracking
│   │   ├── generate/            # Product generation
│   │   ├── list/                # Product listings
│   │   ├── scan/                # Trend scanning
│   │   ├── social-scan/         # Zig 5 - Social Signals
│   │   ├── studio/              # Zig 3 - Design Studio
│   │   └── stripe/              # Zig 4 - Payments
│   ├── dashboard/               # Main dashboard
│   ├── pricing/                 # Pricing page
│   ├── settings/                # User settings
│   ├── studio/                  # AI Design Studio
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── lib/                         # Utilities and services
│   ├── ai/                      # AI provider integrations
│   ├── db/                      # Database schema
│   ├── marketplaces/            # Marketplace APIs
│   └── payments/                # Stripe integration
├── src/
│   └── components/
│       └── ui/                  # Reusable UI components
├── .env.example                 # Environment variables
├── tailwind.config.js           # Tailwind configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Stripe account (for payments)
- AI provider API keys

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ai-product-dashboard
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Providers
   GOOGLE_AI_API_KEY=your_google_ai_key
   OPENAI_API_KEY=your_openai_key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   # Feature Flags
   ENABLE_ZIG3_STUDIO=true
   ENABLE_ZIG4_STRIPE=true
   ENABLE_ZIG5_SOCIAL=true
   ENABLE_ZIG6_BRANDING=true
   ```

3. **Set up database**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   # or use the Supabase CLI
   supabase db reset
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Design System

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

## 🔧 Feature Flags

Control feature availability via environment variables:

```env
ENABLE_ZIG3_STUDIO=true    # AI Design Studio
ENABLE_ZIG4_STRIPE=true    # Stripe payments
ENABLE_ZIG5_SOCIAL=true    # Social signals
ENABLE_ZIG6_BRANDING=true  # Auto-branding
```

## 📊 API Endpoints

### Core Features
- `POST /api/generate` - Generate products
- `GET /api/scan` - Scan trends
- `GET /api/earnings` - Get revenue data

### Zig Modules
- `POST /api/studio/generate` - Generate design assets
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/social-scan` - Analyze social trends
- `POST /api/brand/generate` - Generate brand kit

## 🎯 Usage Examples

### Generate a Product
```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trendData: { category: 'digital_downloads' },
    productType: 'template',
    targetMarketplace: 'etsy'
  })
});
```

### Create Design Asset
```typescript
const response = await fetch('/api/studio/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Minimalist planner template',
    userId: 'user123'
  })
});
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Use `next build && next export`
- **Railway**: Deploy with Docker
- **AWS**: Use Amplify or ECS

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with UI
pnpm test:ui

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Core Web Vitals**: Optimized
- **Bundle Size**: Tree-shaken and optimized
- **Images**: Next.js Image optimization

## 🔒 Security

- **API Keys**: Server-side only
- **Authentication**: NextAuth.js integration ready
- **CORS**: Properly configured
- **Rate Limiting**: Implemented on API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@foundersforge.com

## 🎉 Acknowledgments

- **shadcn/ui** for beautiful components
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Next.js** for the amazing framework
- **Supabase** for the backend infrastructure

---

**Built with ❤️ by the FoundersForge team**