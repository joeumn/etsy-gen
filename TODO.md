# TODO: Make App Fully Functional

## 1. Set Up Default Admin User
- [x] Create script to insert default admin user (joeinduluth@gmail.com, Two1Eight) into Supabase
- [x] Hash password using bcryptjs
- [x] Ensure user has super_admin role

## 2. Create Onboarding Flow
- [x] Create new page `/onboarding` for first-time users
- [x] Check database connection and run migrations
- [x] Prompt for Gemini API key setup
- [x] Guide through marketplace API key setup (Etsy, Amazon, Shopify)
- [x] Test scanner functionality
- [x] Allow customization of feature flags and settings
- [x] Mark onboarding complete in user profile

## 3. Make Scrapers Functional
- [x] Implement real Google Trends scraping (use unofficial API or puppeteer)
- [x] Implement real social media scraping (Twitter, Instagram, etc.) using APIs or puppeteer
- [x] Add data compilation logic to aggregate and analyze scraped data
- [x] Store scraped data in database

## 4. Make Marketplaces Functional
- [x] Update Etsy integration to use real OAuth flow
- [ ] Implement Amazon MWS/SP-API integration
- [ ] Set up Shopify API with proper authentication
- [ ] Ensure all marketplace operations (list, update, delete, earnings) work with real APIs

## 5. Update Settings to Save to Database
- [x] Create user_settings table if needed
- [x] Modify settings page to save API keys, connections, preferences to database
- [ ] Load settings from database on page load

## 6. Ensure All Pages Work with Real Data
- [x] Update dashboard to fetch real data from database and APIs
- [x] Update analytics to use real earnings, trends, etc.
- [ ] Make product generation use real AI and store in database
- [ ] Ensure all API routes work with real data

## 7. Database Migrations and Setup
- [ ] Run all stage migrations on Supabase
- [ ] Ensure database is up to date
- [ ] Add any missing tables (user_settings, onboarding_status)

## 8. Testing and Deployment
- [ ] Test login with admin user
- [ ] Test onboarding flow
- [ ] Test scanning and data compilation
- [ ] Test product generation and listing
- [ ] Ensure Vercel deployment works with real env vars
