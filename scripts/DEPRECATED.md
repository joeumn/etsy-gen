# Deprecated Scripts

The following scripts in this directory use Prisma and need to be updated to use Supabase:

- `seed.ts` - Database seeding script
- `db-smoke.ts` - Database smoke test

These scripts are currently non-functional after the migration from Prisma to Supabase.

## TODO

These scripts should be rewritten to use Supabase client directly or removed if no longer needed.

For now, use the Supabase dashboard or SQL migrations for database operations.