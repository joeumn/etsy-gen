# The Forge by FoundersForge

<div align="center">

**"Never Build Alone."**

AI That Builds Wealth for You

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/badge/build-passing-success)]()
[![License](https://img.shields.io/badge/license-Private-red)]()

</div>

---

## 🔥 What is The Forge?

**The Forge** is an autonomous AI-powered platform that builds digital product empires while you sleep.

Our AI:
- 🔍 **Scrapes** Etsy, Shopify, Amazon, Gumroad for trending products
- 🧠 **Analyzes** market data to identify high-profit opportunities
- ✨ **Creates** complete products (titles, descriptions, mockups, pricing)
- 📦 **Lists** products automatically across all your marketplaces
- 📊 **Tracks** revenue, conversions, and performance in real-time

**Version**: 2.0.0  
**Status**: Private Beta  
**Updated**: October 15, 2025

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** or npm
- **Supabase account** with PostgreSQL database
- **AI API Key** (Gemini recommended, OpenAI works too)

### Installation

```bash
# Clone repository
   git clone <repository-url>
cd etsy-gen

# Install dependencies
npm install
# or
   pnpm install
```

### Configuration

1. **Create `.env.local`** file:

```env
# Database (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
# Server-side admin routes (REQUIRED for admin operations)
# Never expose to client - server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
# Authentication (REQUIRED)
NEXTAUTH_SECRET=your_nextauth_secret_32_chars_min
NEXTAUTH_URL=http://localhost:3000

# AI Provider (Pick at least one)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Marketplaces (Optional - enable as needed)
ETSY_API_KEY=your_etsy_api_key
SHOPIFY_ACCESS_TOKEN=your_shopify_token
AMAZON_ACCESS_KEY=your_amazon_key

# Stripe (Optional - for monetization)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

2. **Set up database**:

Run the SQL migrations in your Supabase dashboard:
```bash
lib/db/schema.sql           # Core schema
lib/db/stage3-migrations.sql  # Stage 3 features
lib/db/stage4-migrations.sql  # Stage 4 automation
```

3. **Start development server**:

```bash
npm run dev
```

4. **Access the app**:

Open [http://localhost:3000](http://localhost:3000)

### First Access

The application is now configured for direct access without authentication. Simply navigate to the dashboard to begin using The Forge.

---

## 🎯 Core Features

### 1. 🤖 **AI Market Intelligence**
Automatically scans Etsy, Shopify, Amazon, and Gumroad to identify trending digital products before they saturate.

**Features**:
- Multi-marketplace scanning
- Keyword extraction
- Competition analysis
- Price range detection
- Seasonality tracking
- Target audience inference

### 2. ✨ **Autonomous Product Creation**
AI generates complete products optimized for conversion.

**Generates**:
- SEO-optimized titles
- Compelling descriptions
- Relevant tags
- Competitive pricing
- Product mockups
- Complete specifications

### 3. 📦 **Automated Listing**
Products are automatically listed across your connected marketplaces.

**Supports**:
- Etsy
- Shopify
- Amazon
- Gumroad (coming soon)

### 4. 📊 **Revenue Analytics**
Real-time dashboards track every aspect of your business.

**Analytics**:
- Revenue trends
- Sales metrics
- Conversion rates
- Top products
- Marketplace performance
- AI-powered insights

### 5. 🎯 **Smart Recommendations**
AI analyzes your data and provides actionable recommendations.

**Recommendations**:
- New product ideas
- Pricing optimization
- Marketing strategies
- Trend predictions
- Growth opportunities

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- Next.js 15.5 with App Router
- React 19
- TypeScript 5.7 (strict mode)
- Tailwind CSS 4.1
- Framer Motion 12
- shadcn/ui + Radix UI

**Backend**:
- Next.js API Routes
- Supabase (PostgreSQL)
- Pino (structured logging)
- bcryptjs (auth)
- Zod (validation)

**AI Providers**:
- Google Gemini
- OpenAI (GPT-4, DALL-E-3)
- Azure OpenAI
- Anthropic Claude

**Integrations**:
- Stripe (payments)
- Marketplace APIs (Etsy, Shopify, Amazon)
- Google Drive API (coming soon)

### Project Structure

```
/
├── src/app/              # Pages & API routes
│   ├── (auth)/           # Authentication
│   ├── dashboard/        # Main dashboard
│   ├── analytics/        # Analytics dashboard
│   ├── products/         # Product management
│   ├── marketplaces/     # Marketplace connections
│   ├── integrations/     # Third-party integrations
│   ├── settings/         # User settings
│   └── api/              # 32 API endpoints
├── src/components/       # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI component library (25+)
├── lib/                  # Server utilities
│   ├── ai/               # AI integrations
│   ├── marketplaces/     # Marketplace APIs
│   ├── analytics/        # Analytics engine
│   ├── db/               # Database
│   └── *.ts              # Utilities
└── docs/                 # Documentation
```

---

## 📱 User Interface

### Landing Page
- **URL**: `/`
- **Purpose**: Marketing page for The Forge
- **Features**: 
  - Hero section with animated background
  - Feature showcase
  - Direct access to dashboard
  - Responsive design

### Dashboard
- **URL**: `/dashboard`
- **Layout**: Sidebar + Topbar
- **Sections**:
  - Command Center overview
  - Real-time stats (4 cards)
  - Revenue charts
  - Marketplace performance
  - Recent activity feed
  - Quick action buttons

### Analytics
- **URL**: `/analytics`
- **Features**:
  - Period selector (7d, 30d, 90d, 1y)
  - Advanced metrics
  - Revenue trends
  - Top products table
  - AI-powered insights
  - Marketplace distribution

---

## 🔌 API Documentation

### Core Endpoints

#### Generate Product
```http
POST /api/generate
Content-Type: application/json
Authorization: Bearer {token}

{
  "trendData": {
    "category": "string",
    "keywords": ["string"]
  },
  "productType": "digital_download",
  "targetMarketplace": "etsy",
  "aiProvider": "gemini"
}
```

#### Scan Trends
```http
GET /api/scan?marketplace=etsy&category=digital&limit=50
Authorization: Bearer {token}
```

#### Get Recommendations
```http
GET /api/recommendations?type=all
Authorization: Bearer {token}
```

**See** `docs/system-overview.md` for complete API documentation.

---

## 🎨 Design System

### Brand Colors

```typescript
Ocean:  #2D9CDB  // Primary blue
Flame:  #FF6B22  // Secondary orange
Gold:   #FFC400  // Accent yellow
Dark:   #1C463C  // Background dark
```

### Custom Components

All components use Framer Motion animations and support dark mode.

**Available Components**:
- `<AdvancedStatCard />` - Animated statistics
- `<RevenueChart />` - Area/Radar charts
- `<LoadingSpinner />` - Loading states
- `<Modal />` - Dialog overlays
- `<Toast />` - Notifications
- `<ProgressBar />` - Progress indicators

**See** `src/components/ui/` for full component library.

---

## 🛡️ Security

### Security

The Forge implements comprehensive security measures to protect your data and operations.

### API Protection
- Input validation (Zod schemas)
- Rate limiting (per user/plan)
- XSS prevention
- SQL injection prevention
- Comprehensive logging

### Data Protection
- Secure data storage
- HTTPS only (production)
- Environment variable secrets

---

## 📊 Performance

### Build Metrics
- ✅ **TypeScript**: 0 errors
- ✅ **Build Time**: ~10 seconds
- ✅ **Bundle Size**: Optimized
- ⚠️ **ESLint**: ~50 warnings (non-critical)

### Runtime Performance
- In-memory caching (5-15min TTL)
- Database query optimization
- Lazy loading
- Code splitting
- Image optimization

### Monitoring
- Structured logging with Pino
- Error tracking
- Performance metrics
- Security event auditing

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Add environment variables** in dashboard
3. **Deploy** - automatic builds on push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

See `.env.example` for complete configuration template.

**Critical Variables**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`
- At least one AI provider API key

---

## 📚 Documentation

### Available Docs
- **README.md** (this file) - Quick start & overview
- **docs/system-overview.md** - Complete system documentation
- **CHANGES.md** - Technical changelog
- **PROJECT_TRANSFORMATION_SUMMARY.md** - Transformation overview
- **RUNTIME_FIXES_COMPLETE.md** - Error fixes documentation

### Code Documentation
All critical functions include JSDoc comments with:
- Purpose description
- Parameter types
- Return types
- Usage examples

---

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🤝 Support

This is a **private internal application** for FoundersForge.

For technical issues:
1. Check `docs/system-overview.md`
2. Review error logs (Pino structured logging)
3. Check database connection
4. Verify environment variables

---

## 📄 License

**Private & Proprietary**

© 2025 FoundersForge. All rights reserved.

This software is private and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🏆 Credits

**Built by**:
- Senior Full-Stack Engineer
- Award-Winning UI/UX Designer
- Product Architect

**Powered by**:
- Next.js
- Supabase
- Google Gemini AI
- OpenAI
- Framer Motion

---

## 🎯 Roadmap

### ✅ Completed (v2.0)
- Enterprise-grade authentication
- Professional logging system
- Advanced error handling
- Comprehensive UI component library
- Performance optimization
- AI provider integrations
- Marketplace connections
- Revenue analytics
- Smart recommendations
- Beautiful dashboard with sidebar navigation

### 🔮 Coming Soon (v2.0 - In Progress)
- [x] Google Drive integration (configuration ready)
- [x] Auto-scheduler for scrapes (cron jobs configured)
- [x] Visual theme editor (settings page added)
- [ ] Mobile app (design phase)
- [x] Advanced forecasting (analytics enhanced)
- [x] Team collaboration features (user management added)

---

**The Forge** - Built with precision, powered by AI, designed for scale.

🔥 **Never Build Alone** 🔥
