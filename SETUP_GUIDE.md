# Production Setup Guide for Etsy-Gen

## Prerequisites

- Supabase account with a project created
- Node.js 18+ installed
- Environment variables configured in Vercel

## Database Setup

### Step 1: Run Supabase Migrations

1. Log in to your Supabase dashboard: https://app.supabase.com
2. Navigate to the SQL Editor
3. Copy the contents of `lib/db/prisma-to-supabase-migration.sql`
4. Paste and execute the SQL in the SQL Editor

This will create all necessary tables with:
- Row Level Security (RLS) enabled
- Proper indexes for performance
- Triggers for `updated_at` columns
- Foreign key constraints

### Step 2: Verify Tables

After running the migration, verify that the following tables exist:
- `settings`
- `api_keys`
- `jobs`
- `scrape_results`
- `trends`
- `products`
- `listings`

## Environment Variables

The following environment variables are required in Vercel:

### Database (Supabase)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional - for backward compatibility
DATABASE_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

### AI Providers
```
GOOGLE_AI_API_KEY=your-google-ai-key
PERPLEXITY_API_KEY=your-perplexity-key
OPENAI_API_KEY=your-openai-key
AI_PROVIDER=gemini
```

### Marketplace APIs
```
ETSY_API_KEY=your-etsy-key
ETSY_SHARED_SECRET=your-etsy-secret
SHOPIFY_ACCESS_TOKEN=your-shopify-token
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
```

### Next Auth
```
NEXTAUTH_URL=https://your-app.vercel.app/
NEXTAUTH_SECRET=your-secret-key
```

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel project settings
3. Deploy the application
4. Verify the deployment at your Vercel URL

## Key Changes Made

### 1. Removed Prisma Dependencies
- Removed `@prisma/client` package
- Removed Prisma schema and migration files
- Updated all imports to use Supabase

### 2. Database Client
- All database operations now use Supabase (`src/config/db.ts`)
- Prisma-compatible API maintained for easy migration
- Row Level Security (RLS) enabled on all tables

### 3. Field Naming Convention
All database fields use `snake_case` (Supabase standard):
- `jobKey` → `job_key`
- `startedAt` → `started_at`
- `completedAt` → `completed_at`
- `durationMs` → `duration_ms`
- etc.

### 4. Type System
- Replaced `Prisma.JsonValue` with `any` or `Record<string, any>`
- Replaced `Prisma.Decimal` with `number`
- Enum types now use string literals instead of Prisma enums

### 5. Build Configuration
- Excluded Express server files from Next.js build
- Fixed Google Fonts loading for build environment
- Made Redis and BullMQ imports optional

## Testing

### Test Database Connection

Create a test API endpoint or check the health endpoint:
```
GET /api/health/db
```

This should return a successful response if the database connection is working.

### Test Core Features

1. **Trends**: Visit `/dashboard` to see trend data
2. **Products**: Navigate to `/products` to view generated products
3. **Listings**: Check `/marketplaces` for marketplace listings
4. **AI Integration**: Test product generation features

## Troubleshooting

### Database Connection Errors

If you see "Missing SUPABASE_URL" errors:
1. Verify environment variables are set in Vercel
2. Redeploy the application after setting variables
3. Check that variable names match exactly

### RLS Policy Errors

If you get permission denied errors:
1. Verify RLS policies are created in Supabase
2. Check that `auth.uid()` is properly set in your authentication flow
3. For testing, you can temporarily disable RLS (not recommended for production)

### Type Errors

If you encounter TypeScript errors:
1. Run `npm run type-check` locally
2. Ensure all Prisma references have been removed
3. Check that snake_case field names are used consistently

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the PRISMA_REMOVAL_SUMMARY.md file
3. Open an issue on GitHub

## Next Steps

1. **Authentication**: Set up proper authentication with Supabase Auth or Next-Auth
2. **User Management**: Create user accounts and test multi-tenant data isolation
3. **API Integration**: Test Etsy and Shopify API integrations
4. **AI Features**: Verify AI-powered trend discovery and product generation
5. **Monitoring**: Set up error tracking and performance monitoring
