# Deployment Checklist for Vercel

## ✅ Pre-Deployment Steps

### 1. Environment Variables Setup
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **ALL environments** (Production, Preview, Development):

#### Required Database Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

#### Required AI Variables
- [ ] `OPENAI_API_KEY` - Your OpenAI API key for AI features

#### Required Marketplace Variables (at least one)
- [ ] `SHOPIFY_API_KEY` - Shopify API key
- [ ] `SHOPIFY_ACCESS_TOKEN` - Shopify access token
- [ ] `SHOPIFY_SHOP_DOMAIN` - Your Shopify store domain (e.g., mystore.myshopify.com)

#### Security Variables
- [ ] `APP_ENCRYPTION_KEY` - 32-byte random string for encrypting API keys
- [ ] `ADMIN_API_TOKEN` - Secure random token for admin endpoints

### 2. Verify Build Configuration
- [ ] Framework Preset: Next.js
- [ ] Node.js Version: 18.x or higher
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Database Setup
- [ ] Supabase project created
- [ ] Database tables created (run migrations from `lib/db/schema.sql`)
- [ ] Service role key obtained from Supabase dashboard

### 4. Marketplace Integrations
- [ ] Shopify app created and access token obtained
- [ ] Etsy API credentials (if using Etsy)
- [ ] Amazon credentials (if using Amazon)

## 🚀 Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Fix: CSS fonts and database connection for Vercel"
   git push origin main
   ```

2. **Trigger Deployment**
   - Vercel will auto-deploy on push
   - Or manually trigger from Vercel dashboard

3. **Monitor Build Logs**
   - Check for any environment variable warnings
   - Verify no build errors

4. **Test Deployment**
   - Visit your deployed URL
   - Check landing page fonts (should be Inter, not Times New Roman)
   - Test login/signup
   - Test dashboard access
   - Test AI features (scan, analyze, create)

## 🔍 Post-Deployment Verification

### Landing Page
- [ ] Modern Inter font loads correctly
- [ ] Gradient backgrounds display properly
- [ ] Animations work smoothly
- [ ] Responsive design works on mobile

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Font is Inter (not Times New Roman)
- [ ] Manual control buttons work
- [ ] Data loads from database

### AI Features
- [ ] "Scan Marketplaces" button works
- [ ] "Analyze Trends" button works
- [ ] "Create Products" button works
- [ ] Shopify integration works
- [ ] Web scraping works

### Database Connection
- [ ] No "Missing SUPABASE_URL" errors in logs
- [ ] Data persists correctly
- [ ] Queries execute successfully

## 🐛 Troubleshooting

### Fonts Still Look Wrong
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if Google Fonts is blocked by ad blocker
3. Verify Inter font loads in Network tab

### Database Connection Fails
1. Check Vercel Function logs for specific errors
2. Verify environment variables are set for correct environment
3. Test Supabase connection from Supabase dashboard
4. Ensure service role key has correct permissions

### AI Features Don't Work
1. Check Function logs for API key errors
2. Verify OpenAI API key is valid and has credits
3. Check Shopify credentials are correct
4. Test API endpoints individually: `/api/trends`, `/api/products`

### Build Fails
1. Check build logs for specific error
2. Verify all dependencies are in package.json
3. Run `npm run build` locally to reproduce
4. Check TypeScript errors with `npm run type-check`

## 📊 Monitoring

After deployment, monitor:
- [ ] Vercel Function logs for errors
- [ ] Vercel Analytics for performance
- [ ] Supabase dashboard for database queries
- [ ] OpenAI usage dashboard for API calls

## 🔄 Redeployment

If you need to redeploy after fixing issues:
1. Update environment variables in Vercel
2. Go to Deployments tab
3. Click "..." on latest deployment
4. Click "Redeploy"
5. Select "Use existing Build Cache" (faster) or rebuild from scratch

## 📝 Notes

- Environment variables are cached during build
- Changes to env vars require redeployment
- Preview deployments use Preview environment variables
- Production uses Production environment variables
