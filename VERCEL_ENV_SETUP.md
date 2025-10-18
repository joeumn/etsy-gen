# Vercel Environment Variable Configuration Guide

This document provides a comprehensive list of all environment variables needed for deploying Etsy-Gen to Vercel.

## ⚠️ Critical: Understanding Next.js Environment Variables

In Next.js, there are two types of environment variables:

1. **Server-Side Variables (Secrets)**: Available only in API Routes, Server Components, and Server Actions
   - These are NOT prefixed with `NEXT_PUBLIC_`
   - They remain secure and are never exposed to the browser
   - Examples: API keys, database credentials, secrets

2. **Client-Side Variables (Public)**: Exposed to the browser
   - MUST be prefixed with `NEXT_PUBLIC_`
   - Anyone can see these in the browser's network tab
   - Examples: Public API endpoints, feature flags, publishable keys

## 📋 Environment Variables List

### 1. Server-Side Variables (Secrets)

These variables should NEVER be prefixed with `NEXT_PUBLIC_` as they contain sensitive information.

#### Database & Authentication
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_PASSWORD=your-database-password-here
NEXTAUTH_SECRET=your-random-32-character-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### AI Providers (At least one required)
```
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
SAUNET_API_KEY=your-saunet-api-key
```

#### Marketplace Integrations
```
ETSY_API_KEY=your-etsy-api-key
ETSY_API_SECRET=your-etsy-api-secret
ETSY_SHARED_SECRET=your-etsy-shared-secret
ETSY_SHOP_ID=your-shop-id

SHOPIFY_ACCESS_TOKEN=your-shopify-token
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret

AMAZON_ACCESS_KEY=your-amazon-access-key
AMAZON_SECRET_KEY=your-amazon-secret-key
AMAZON_REGION=us-east-1
AMAZON_MARKETPLACE_ID=your-marketplace-id
AMAZON_SELLER_ID=your-seller-id
```

#### Payment Processing
```
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_pro_monthly
STRIPE_PRO_YEARLY_PRICE_ID=price_pro_yearly
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_enterprise_monthly
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_enterprise_yearly
```

#### Cloud Storage (Optional - for database backups)
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=etsy-gen-backups
```

#### Cron & Security
```
CRON_SECRET=your-cron-secret-key
```

#### Feature Flags (Optional - Server-side toggles)
```
ENABLE_GOOGLE_DRIVE=false
ENABLE_AUTO_SCHEDULER=false
ENABLE_STAGE4_AUTOCREATE=false
ENABLE_STAGE4_AUTOAFFILIATES=false
ENABLE_STAGE4_AUTOMARKET=false
ENABLE_STAGE4_AUTOPRICING=false
ENABLE_STAGE4_AUTOOPTIMIZE=false
ENABLE_STAGE4_AUTOCASHFLOW=false
ENABLE_STAGE3_AFFILIATES=false
ENABLE_ZIG6_BRANDING=false
```

### 2. Client-Side Variables (Public)

These variables MUST be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

#### Database Connection (Public keys only)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Payment Processing (Publishable key)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

#### Feature Flags (Client-side toggles)
```
NEXT_PUBLIC_ENABLE_ZIG3_STUDIO=true
NEXT_PUBLIC_ENABLE_ZIG4_STRIPE=true
NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL=true
NEXT_PUBLIC_ENABLE_ZIG6_BRANDING=true
```

#### API Configuration (Optional)
```
NEXT_PUBLIC_API_URL=/api
PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Development & Testing Variables (Optional)

```
NODE_ENV=production
VERCEL=1
ALLOW_DEBUG_ENDPOINTS=false
LOG_LEVEL=info
DEBUG=false
```

## 🚀 Setting Up in Vercel

### Method 1: Using Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable one by one
4. Choose the appropriate environment: Production, Preview, Development
5. Click **Save**

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... repeat for all variables
```

### Method 3: Using `.env` file import (Not Recommended for Secrets)

1. Create a `.env` file locally with all variables
2. In Vercel Dashboard, go to **Settings** → **Environment Variables**
3. Click **Import** and upload your `.env` file
4. **Important**: Delete the local `.env` file after import to prevent accidental commits

## ✅ Verification Checklist

After setting up environment variables in Vercel:

- [ ] All `NEXT_PUBLIC_*` variables are set correctly
- [ ] `NEXTAUTH_SECRET` is a strong random string (at least 32 characters)
- [ ] `NEXTAUTH_URL` matches your Vercel deployment URL
- [ ] Database credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are correct
- [ ] At least one AI provider key is configured (GEMINI or OPENAI)
- [ ] Stripe keys match (test vs production)
- [ ] All marketplace integrations you need are configured
- [ ] Redeploy your application after adding variables

## 🔍 Common Issues

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set with the `NEXT_PUBLIC_` prefix.

### Issue: "Unauthorized" errors on API routes
**Solution**: Check that `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correctly set.

### Issue: "Can't connect to Supabase"
**Solution**: Verify the Supabase URL and anon key are correct. Note that these should use the public variants with `NEXT_PUBLIC_` prefix.

### Issue: Environment variables not updating
**Solution**: After changing environment variables in Vercel, you must redeploy your application for changes to take effect.

## 📝 Security Best Practices

1. **Never commit** `.env.local` or `.env` files with real values to git
2. **Use different keys** for development and production
3. **Rotate secrets** regularly, especially after team member departures
4. **Limit access** to Vercel project settings to trusted team members only
5. **Use Vercel's secret management** instead of storing secrets in code
6. **Audit regularly** who has access to environment variables

## 🔗 Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Setup Guide](https://supabase.com/docs)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)
