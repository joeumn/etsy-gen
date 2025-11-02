# The Forge - AI-Powered Digital Product Automation Platform

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

**Autonomous digital product discovery, creation & listing across multiple marketplaces**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [API Documentation](#api-documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Forge is an enterprise-grade SaaS platform that automates the entire digital product lifecycle:
- **Scrapes** trending products from Etsy, Shopify, and Amazon
- **Analyzes** market data using AI-powered scoring algorithms
- **Generates** optimized digital products with AI
- **Lists** products automatically across multiple marketplaces

## ✨ Features

### Core Capabilities
- ✅ **4-Stage AI Pipeline**: Scrape → Analyze → Generate → List
- ✅ **Multi-Marketplace Support**: Etsy, Shopify, Amazon, Creative Market
- ✅ **Advanced Analytics**: Real-time trend analysis with confidence scoring
- ✅ **Smart Caching**: Redis-backed performance optimization
- ✅ **Circuit Breaker**: Automatic failure recovery
- ✅ **Dead Letter Queue**: Failed job tracking and recovery
- ✅ **Rate Limiting**: Intelligent API protection
- ✅ **Real-Time Updates**: Live pipeline status monitoring
- ✅ **Comprehensive Metrics**: Prometheus-compatible monitoring

### Security Features
- 🔒 NextAuth.js authentication
- 🔒 JWT token validation
- 🔒 Rate limiting per endpoint
- 🔒 Security headers (HSTS, CSP, etc.)
- 🔒 Encrypted API key storage
- 🔒 Request validation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + TailwindCSS 4
- **Components**: Radix UI + shadcn/ui
- **State**: React Hooks + Context API
- **Animation**: Framer Motion

### Backend
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis 7+
- **Queue**: BullMQ for job processing
- **Auth**: NextAuth.js v5

### AI & ML
- **Providers**: OpenAI, Anthropic, Google AI, Azure OpenAI
- **Image Gen**: Stability AI, Replicate
- **Text Analysis**: Custom scoring algorithms

### DevOps
- **Monitoring**: Prometheus + Grafana
- **Logging**: Pino with structured logging
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14
Redis >= 7.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/etsy-gen.git
cd etsy-gen
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.template .env.local
# Edit .env.local with your configuration
```

4. **Initialize database**
```bash
npx prisma migrate deploy
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Metrics: http://localhost:3000/api/metrics

## ⚙️ Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Encryption
APP_ENCRYPTION_KEY="your-256-bit-key"

# AI Provider (at least one required)
OPENAI_API_KEY="sk-..."

# Marketplace (at least one required)
ETSY_API_KEY="..."
ETSY_SHOP_ID="..."
```

See [.env.template](.env.template) for complete configuration options.

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │   Analytics  │  │   Settings   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   API Layer (Next.js)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Middleware: Auth, Rate Limit, Security         │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Orchestration Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ BullMQ   │  │  Redis   │  │  Prisma  │             │
│  │ Workers  │  │  Cache   │  │  Client  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                AI Pipeline (4 Stages)                   │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐│
│  │  Scrape  │→│  Analyze  │→│ Generate │→│   List   ││
│  └──────────┘ └───────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────────┘
```

### Pipeline Stages

1. **Scrape**: Fetches product data from marketplaces
2. **Analyze**: Scores trends using enhanced AI algorithms
3. **Generate**: Creates optimized digital products
4. **List**: Publishes products to marketplaces

## 💻 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## 🧪 Testing

### Test Structure

```
test/
├── backend/           # Backend unit tests
│   ├── apikey.service.test.ts
│   ├── pipeline.e2e.test.ts
│   └── settings.service.test.ts
├── utils/            # Test utilities
│   └── fakePrisma.ts
└── setup.ts          # Test configuration
```

### Running Specific Tests

```bash
# Run specific test file
npm test -- pipeline.e2e.test.ts

# Run tests matching pattern
npm test -- --grep "pipeline"
```

## 🚢 Deployment

### Production Build

```bash
# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t etsy-gen:latest .

# Run container
docker-compose up -d
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up Redis cluster
4. Configure monitoring tools
5. Set up reverse proxy (nginx)

## 📊 Monitoring

### Metrics Endpoint

Access Prometheus metrics at `/api/metrics`:

- Pipeline job duration
- AI provider latency
- Cache hit/miss rates
- Database query performance
- Marketplace API health
- Business metrics (products, listings, revenue)

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Logging

Logs are structured JSON format via Pino:

```javascript
{
  "level": "info",
  "time": "2025-11-02T08:00:00.000Z",
  "stage": "analyze",
  "jobId": "abc123",
  "msg": "Analyze stage completed"
}
```

## 🔧 Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Verify DATABASE_URL in .env
```

**Redis connection errors**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**Worker not processing jobs**
```bash
# Check worker logs
npm run dev

# Verify REDIS_URL is correct
# Check job queue status in dashboard
```

### Debug Mode

Enable debug logging:
```env
LOGGER_LEVEL=debug
DEBUG=true
```

## 📚 API Documentation

### Authentication

All API routes (except public ones) require authentication:

```typescript
Headers: {
  Authorization: "Bearer <token>"
}
```

### Key Endpoints

- `POST /api/pipeline/trigger` - Manually trigger pipeline
- `GET /api/jobs/:id/status` - Get job status
- `GET /api/trends` - Get trending niches
- `GET /api/products` - List generated products
- `GET /api/listings` - List marketplace listings
- `GET /api/metrics` - Prometheus metrics

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original design system from [Figma](https://www.figma.com/design/35xZhfoRDJ8qwov9TqwmP4/AI-SaaS-App-Design-System)
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📞 Support

- 📧 Email: support@etsy-gen.com
- 💬 Discord: [Join our community](https://discord.gg/etsygen)
- 📖 Documentation: [docs.etsy-gen.com](https://docs.etsy-gen.com)

---

<div align="center">
  <p>Made with ❤️ by The Forge Team</p>
  <p>⭐ Star us on GitHub if you find this helpful!</p>
</div>