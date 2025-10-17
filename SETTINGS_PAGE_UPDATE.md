# Settings Page Update - User Settings & Vercel Environment Variables

## Overview
This update addresses the issue where user settings were not properly loading Vercel environment variables and provides a complete redesign of the settings page with improved UI/UX.

## Changes Made

### 1. New API Routes

#### `/api/settings/feature-flags` (NEW)
- **Purpose**: Fetch feature flags and system configuration from server-side environment variables
- **Returns**: 
  - Feature flags (Zig 3-6 status)
  - System configuration status (which API keys and services are configured)
  - Timestamp of the check

**Example Response:**
```json
{
  "features": {
    "zig3Studio": true,
    "zig4Stripe": true,
    "zig5Social": true,
    "zig6Branding": false
  },
  "systemConfig": {
    "hasGeminiKey": true,
    "hasOpenAIKey": true,
    "hasAnthropicKey": false,
    "hasAzureOpenAIKey": false,
    "hasEtsyConfig": true,
    "hasShopifyConfig": false,
    "hasAmazonConfig": false,
    "hasStripeConfig": false,
    "hasSupabaseConfig": true
  },
  "timestamp": "2025-10-17T05:22:21.622Z"
}
```

#### `/api/settings/load` (UPDATED)
- **Changes**: Now properly loads feature flags and system configuration from server-side environment variables
- **New Fields**:
  - `features`: Feature flag status from Vercel environment variables
  - `systemConfig`: System-level configuration status

### 2. Settings Page Redesign

#### New Features:

1. **Password Visibility Toggles**
   - Eye/EyeOff icons on all API key input fields
   - Users can toggle between showing and hiding sensitive keys

2. **System Configuration Status Indicators**
   - Shows which services are configured at the system level (Vercel environment variables)
   - Green checkmarks and "System configured" badges for configured services
   - Clear indication of user-level vs system-level settings

3. **Refresh Button**
   - New refresh button in the navigation bar
   - Allows users to reload settings from the server without page refresh
   - Shows spinning animation during refresh

4. **Enhanced Feature Status Card**
   - Better visual design with rounded boxes for each feature
   - "Active" badges for enabled features
   - Glowing green indicators for active features
   - Gray indicators for inactive features
   - Clear explanation that features are controlled by Vercel environment variables

5. **New System Configuration Card**
   - Shows real-time status of Vercel environment variables
   - Displays counts for configured AI providers (X/4)
   - Displays counts for configured marketplaces (X/3)
   - Shows database connection status
   - Shows Stripe payment configuration status
   - Clear note that system configuration cannot be changed from this page

6. **Improved Card Descriptions**
   - All cards now have descriptive subtitles (CardDescription)
   - Better explanatory text throughout
   - Icons added to all section headers

7. **Better Visual Hierarchy**
   - Consistent spacing and padding
   - Better use of color to indicate status
   - Improved dark mode support

### 3. User-Level vs System-Level Settings

The redesign clearly distinguishes between:

- **User-Level Settings**: API keys and preferences that users can configure themselves
- **System-Level Settings**: Environment variables configured in Vercel that apply to all users

**Visual Indicators:**
- System-configured services show a "System configured" badge in green
- The System Configuration card shows which environment variables are set
- Help text explains where settings are managed

### 4. Environment Variable Integration

The settings page now properly reads and displays the following Vercel environment variables:

**Feature Flags:**
- `NEXT_PUBLIC_ENABLE_ZIG3_STUDIO` - AI Design Studio
- `NEXT_PUBLIC_ENABLE_ZIG4_STRIPE` - Payment Processing
- `NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL` - Social Media Signals
- `NEXT_PUBLIC_ENABLE_ZIG6_BRANDING` - Auto-Branding Engine

**System Configuration:**
- `GEMINI_API_KEY` - Google Gemini API
- `OPENAI_API_KEY` - OpenAI API
- `ANTHROPIC_API_KEY` - Anthropic API
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API
- `ETSY_API_KEY` + `ETSY_API_SECRET` - Etsy integration
- `SHOPIFY_ACCESS_TOKEN` + `SHOPIFY_SHOP_DOMAIN` - Shopify integration
- `AMAZON_ACCESS_KEY` + `AMAZON_SECRET_KEY` - Amazon integration
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe integration
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` - Database connection

## Testing

The changes have been tested with:
1. Build verification (successful production build)
2. API endpoint testing (feature-flags and load endpoints)
3. Visual testing with different environment variable configurations
4. UI/UX testing with screenshot verification

## Deployment Notes

When deploying to Vercel:

1. **Set Environment Variables**: Configure all required environment variables in Vercel dashboard
2. **Rebuild**: After adding/changing environment variables, rebuild the application
3. **Verify**: Check the Settings page to see the system configuration status
4. **User Keys**: Users can still add their own API keys even if system-level keys are configured

## Benefits

1. **Transparency**: Users can now see which services are configured at the system level
2. **Better UX**: Clear visual feedback and improved organization
3. **Security**: Password fields with show/hide toggles
4. **Flexibility**: Supports both user-level and system-level configuration
5. **Maintainability**: Centralized environment variable handling
6. **Vercel Integration**: Properly reads and displays Vercel environment variables

## Future Enhancements

Potential future improvements:
- Add environment variable validation
- Add connection testing for each service
- Add bulk import/export of settings
- Add settings history/versioning
- Add multi-user settings management
