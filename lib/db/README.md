# Database Migrations

This directory contains SQL migration files for the Etsy Gen database schema.

## Required Migrations

The following migrations must be run in your Supabase database in order:

1. **schema.sql** - Base schema with core tables (users, products, trends, etc.)
2. **stage3-migrations.sql** - Analytics, affiliate, and events tables
3. **stage4-migrations.sql** - Automation engine tables (pricing, traffic, reports)
4. **fix-user-settings-migration.sql** - Updates to user_settings table schema

## How to Run Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### Using Supabase CLI

```bash
# Run migrations in order
supabase db push --file lib/db/schema.sql
supabase db push --file lib/db/stage3-migrations.sql
supabase db push --file lib/db/stage4-migrations.sql
supabase db push --file lib/db/fix-user-settings-migration.sql
```

## Environment Variables

Make sure you have the following environment variables set:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (bypasses RLS)

The service role key is required for admin endpoints and should only be used server-side.

## Notes

- Migrations use `IF NOT EXISTS` clauses where appropriate to allow safe re-running
- The application will fail fast in production if Supabase is not configured
- Admin operations use the service role client to bypass Row Level Security (RLS)
- Development mode skips database checks to allow working with mock data
