# Environment Variable Setup Guide

This guide explains how to properly configure environment variables for The Forge platform.

## Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required values** (see below for details)

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Required Environment Variables

### Database Configuration

The application requires a Supabase database:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side admin routes (REQUIRED for admin operations)
# Never expose this to the client - server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**How to get these values:**
1. Go to https://supabase.com
2. Create a new project (or use existing)
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. Copy the service_role key (for SUPABASE_SERVICE_ROLE_KEY)

### Authentication

```env
NEXTAUTH_SECRET=your-random-32-character-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### AI Provider (At least one required)

**Option 1: Google Gemini (Recommended)**
```env
GEMINI_API_KEY=your-gemini-api-key
```

Get your key at: https://makersuite.google.com/app/apikey

**Option 2: OpenAI**
```env
OPENAI_API_KEY=your-openai-api-key
```

Get your key at: https://platform.openai.com/api-keys

## Optional: Marketplace Integrations

### Etsy Integration

```env
ETSY_API_KEY=your-etsy-api-key
ETSY_API_SECRET=your-etsy-api-secret
ETSY_SHOP_ID=your-shop-id
```

### Shopify Integration

```env
SHOPIFY_ACCESS_TOKEN=your-shopify-token
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
```

### Amazon Integration

```env
AMAZON_ACCESS_KEY=your-amazon-access-key
AMAZON_SECRET_KEY=your-amazon-secret-key
```

## Feature Flags (Zigs)

Enable advanced features by setting these to `true`:

### Zig 3: AI Design Studio
Enables AI-powered product mockup generation
```env
NEXT_PUBLIC_ENABLE_ZIG3_STUDIO=true
```

### Zig 4: Stripe Payments
Enables payment processing with Stripe
```env
NEXT_PUBLIC_ENABLE_ZIG4_STRIPE=true
```

**Required Stripe variables when enabled:**
```env
STRIPE_SECRET_KEY=sk_test_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### Zig 5: Social Media Signals
Enables social media trend analysis
```env
NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL=true
```

### Zig 6: Auto-Branding
Enables automatic brand asset generation
```env
NEXT_PUBLIC_ENABLE_ZIG6_BRANDING=true
```

## Vercel Deployment

When deploying to Vercel, set environment variables in the Vercel dashboard:

1. Go to your project on Vercel
2. Click **Settings** > **Environment Variables**
3. Add each variable one by one
4. Important: Select the correct environment (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application

### Important Notes for Vercel:

- ✅ Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ✅ Other variables are server-side only
- ✅ After adding/changing variables, you must redeploy
- ✅ You can bulk import from `.env.local` using the Vercel CLI

## Troubleshooting

### Settings Not Saving

**Problem**: Settings page doesn't save or shows "User ID required" error

**Solution**: 
1. Make sure you're logged in
2. Clear browser localStorage
3. Log in again
4. Check that SUPABASE_URL is set correctly

### Feature Flags Not Appearing

**Problem**: Zig features show as disabled even though environment variables are set

**Possible causes:**
1. Variable name is misspelled (must be exact)
2. Value is not exactly `'true'` (lowercase, no quotes in .env)
3. Environment variables not set in Vercel
4. Application not restarted after setting variables

**Solution:**
```bash
# Check your variables
curl http://localhost:3000/api/debug/env

# Restart dev server
npm run dev
```

### Mock Data Still Showing

**Problem**: Pages show hardcoded data instead of database data

**Solution**:
1. Ensure Supabase is configured
2. Run database migrations
3. Verify user is logged in
4. Check browser console for API errors

## Debug Endpoint

Use the debug endpoint to check environment variable status:

**Local Development:**
```bash
curl http://localhost:3000/api/debug/env | jq
```

This will show:
- Which variables are set
- Feature flag status
- Environment information

**Note**: This endpoint is disabled in production by default for security.

## Security Best Practices

1. ❌ **Never commit** `.env.local` to git
2. ❌ **Never share** API keys publicly
3. ✅ **Use different keys** for development and production
4. ✅ **Rotate keys** regularly
5. ✅ **Use environment-specific** Vercel deployments

## Need Help?

If you're still having issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Verify your API keys are valid
3. Look at the browser console for errors
4. Check server logs in Vercel dashboard
5. Use the debug endpoint to verify variable loading

## Example: Minimal Working Setup

Here's a minimal `.env.local` that will get you started:

```env
# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# AI (choose one)
GEMINI_API_KEY=AIzaSy...

# Enable all features
NEXT_PUBLIC_ENABLE_ZIG3_STUDIO=true
NEXT_PUBLIC_ENABLE_ZIG4_STRIPE=true
NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL=true
NEXT_PUBLIC_ENABLE_ZIG6_BRANDING=true
```

This minimal setup will allow you to:
- ✅ Login and use the application
- ✅ Generate products with AI
- ✅ Save settings
- ✅ View all features (some will need additional setup)
