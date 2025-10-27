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

## ðŸ”¥ What is The Forge?

**The Forge** is an autonomous AI-powered platform that builds digital product empires while you sleep.

Our AI:
- ðŸ” **Scrapes** Etsy, Shopify, Amazon, Gumroad for trending products
- ðŸ§  **Analyzes** market data to identify high-profit opportunities
- âœ¨ **Creates** complete products (titles, descriptions, mockups, pricing)
- ðŸ“¦ **Lists** products automatically across all your marketplaces
- ðŸ“Š **Tracks** revenue, conversions, and performance in real-time

**Version**: 2.0.0  
**Status**: Private Beta  
**Updated**: October 15, 2025

---

## Backend Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** (or `pnpm` if you prefer)
- **PostgreSQL** 13+ reachable at the `DATABASE_URL`
- **Redis** 6+ for BullMQ job queues
- **AI provider keys** (`OPENAI_API_KEY` required, `STABILITY_API_KEY` optional)

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client & migrate schema (DATABASE_URL must be set)
npm run db:generate
npm run db:migrate

# Seed baseline data
npm run db:seed
```

Copy `.env.example` to `.env.local` (or export variables for production) and fill in:

- `DATABASE_URL`, `REDIS_URL`, `APP_ENCRYPTION_KEY`
- Marketplace + AI keys (`ETSY_API_KEY`, `ETSY_SHOP_ID`, `OPENAI_API_KEY`, ...)
- `ADMIN_API_TOKEN` for securing `/api/admin/*`

### Running the platform

```bash
# Start API (http://localhost:3001 by default)
npm run dev

# In separate shells start background workers & cron scheduler
npm run queues
npm run cron
```

Kick an end-to-end run manually:

```bash
curl -X POST -H "x-admin-token: $ADMIN_API_TOKEN" http://localhost:3001/api/admin/run/scrape
curl -X POST -H "x-admin-token: $ADMIN_API_TOKEN" http://localhost:3001/api/admin/run/analyze
curl -X POST -H "x-admin-token: $ADMIN_API_TOKEN" http://localhost:3001/api/admin/run/generate
curl -X POST -H "x-admin-token: $ADMIN_API_TOKEN" http://localhost:3001/api/admin/run/list
```

Health and readiness probes: `GET /healthz`, `GET /readyz`. Prometheus metrics at `GET /metrics`.

### Verification

```bash
# Smoke check DB connectivity
npm run db:seed
node ./scripts/db-smoke.ts

# Run Vitest suite (backend + existing FE tests)
npm test
```



### Authentication

The application uses NextAuth with Supabase for secure authentication:

1. **Sign Up**: Create an account at `/signup`
2. **Sign In**: Access at `/login`
3. **Protected Routes**: Dashboard and features require authentication

ðŸ“– **See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** for detailed authentication documentation.

---

## ðŸŽ¯ Core Features

### 1. ðŸ¤– **AI Market Intelligence**
Automatically scans Etsy, Shopify, Amazon, and Gumroad to identify trending digital products before they saturate.

**Features**:
- Multi-marketplace scanning
- Keyword extraction
- Competition analysis
- Price range detection
- Seasonality tracking
- Target audience inference

### 2. âœ¨ **Autonomous Product Creation**
AI generates complete products optimized for conversion.

**Generates**:
- SEO-optimized titles
- Compelling descriptions
- Relevant tags
- Competitive pricing
- Product mockups
- Complete specifications

### 3. ðŸ“¦ **Automated Listing**
Products are automatically listed across your connected marketplaces.

**Supports**:
- Etsy
- Shopify
- Amazon
- Gumroad (coming soon)

### 4. ðŸ“Š **Revenue Analytics**
Real-time dashboards track every aspect of your business.

**Analytics**:
- Revenue trends
- Sales metrics
- Conversion rates
- Top products
- Marketplace performance
- AI-powered insights

### 5. ðŸŽ¯ **Smart Recommendations**
AI analyzes your data and provides actionable recommendations.

**Recommendations**:
- New product ideas
- Pricing optimization
- Marketing strategies
- Trend predictions
- Growth opportunities

---

## ðŸ—ï¸ Architecture

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
â”œâ”€â”€ src/app/              # Pages & API routes
â”‚   â”œâ”€â”€ (auth)/           # Authentication
â”‚   â”œâ”€â”€ dashboard/        # Main dashboard
â”‚   â”œâ”€â”€ analytics/        # Analytics dashboard
â”‚   â”œâ”€â”€ products/         # Product management
â”‚   â”œâ”€â”€ marketplaces/     # Marketplace connections
â”‚   â”œâ”€â”€ integrations/     # Third-party integrations
â”‚   â”œâ”€â”€ settings/         # User settings
â”‚   â””â”€â”€ api/              # 32 API endpoints
â”œâ”€â”€ src/components/       # React components
â”‚   â”œâ”€â”€ layout/           # Layout components
â”‚   â””â”€â”€ ui/               # UI component library (25+)
â”œâ”€â”€ lib/                  # Server utilities
â”‚   â”œâ”€â”€ ai/               # AI integrations
â”‚   â”œâ”€â”€ marketplaces/     # Marketplace APIs
â”‚   â”œâ”€â”€ analytics/        # Analytics engine
â”‚   â”œâ”€â”€ db/               # Database
â”‚   â””â”€â”€ *.ts              # Utilities
â””â”€â”€ docs/                 # Documentation
```

---

## ðŸ“± User Interface

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

## ðŸ”Œ API Documentation

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

## ðŸŽ¨ Design System

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

## ðŸ›¡ï¸ Security

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

## ðŸ“Š Performance

### Build Metrics
- âœ... **TypeScript**: 0 errors
- âœ... **Build Time**: ~10 seconds
- âœ... **Bundle Size**: Optimized
- âš ï¸ **ESLint**: ~50 warnings (non-critical)

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

## ðŸš€ Deployment

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

## ðŸ“š Documentation

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

## ðŸ§ª Testing

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## ðŸ¤ Support

This is a **private internal application** for FoundersForge.

For technical issues:
1. Check `docs/system-overview.md`
2. Review error logs (Pino structured logging)
3. Check database connection
4. Verify environment variables

---

## ðŸ“„ License

**Private & Proprietary**

Â© 2025 FoundersForge. All rights reserved.

This software is private and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## ðŸ† Credits

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

## ðŸŽ¯ Roadmap

### âœ... Completed (v2.0)
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

### ðŸ”® Coming Soon (v2.0 - In Progress)
- [x] Google Drive integration (configuration ready)
- [x] Auto-scheduler for scrapes (cron jobs configured)
- [x] Visual theme editor (settings page added)
- [ ] Mobile app (design phase)
- [x] Advanced forecasting (analytics enhanced)
- [x] Team collaboration features (user management added)

---

**The Forge** - Built with precision, powered by AI, designed for scale.

ðŸ”¥ **Never Build Alone** ðŸ”¥

