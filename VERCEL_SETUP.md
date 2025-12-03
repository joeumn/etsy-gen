# Vercel Deployment Setup Guide

## Environment Variables Configuration

To ensure your app works correctly on Vercel, you need to set up the following environment variables in your Vercel dashboard.

### Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

#### Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### AI Services
```
OPENAI_API_KEY=sk-your-openai-key
```

#### Marketplaces
```
# Shopify
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com

# Etsy (Optional)
ETSY_API_KEY=your-etsy-api-key
ETSY_ACCESS_TOKEN=your-etsy-token
ETSY_SHOP_ID=your-shop-id

# Amazon (Optional)
AMAZON_ACCESS_KEY=your-amazon-key
AMAZON_SECRET_KEY=your-amazon-secret
```

#### Security
```
APP_ENCRYPTION_KEY=generate-32-byte-random-string
ADMIN_API_TOKEN=generate-secure-random-token
```

### Important Notes

1. **All environment variables must be set for ALL environments** (Production, Preview, Development)
2. Click "Add" for each variable and check all three environment checkboxes
3. After adding variables, redeploy your application
4. Use the Vercel CLI to verify: `vercel env pull`

### Generate Secure Keys

For `APP_ENCRYPTION_KEY`, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For `ADMIN_API_TOKEN`, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Vercel Build Settings

Ensure your Vercel project has these build settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

### Troubleshooting

If AI features don't work after deployment:

1. Check Vercel deployment logs for environment variable errors
2. Verify all required variables are set in Vercel dashboard
3. Ensure variables are enabled for the correct environment (Production/Preview)
4. Redeploy after adding/updating variables
5. Check the Function logs in Vercel dashboard for runtime errors

### Testing Environment Variables

After deployment, you can test if variables are loaded by checking the Vercel Function logs or by adding a test API route temporarily.
