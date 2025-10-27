# Changelog

## Unreleased

- add typed environment validation (`src/config/env.ts`) with fail-fast secrets enforcement
- replace Supabase SQL migrations with Prisma schema, migrations, seed + smoke scripts
- implement Express backend (`src/server.ts`) with admin + health/metrics routes
- add BullMQ queues, workers, and cron scheduler for scrape → analyze → generate → list pipeline
- build scraping, analysis, generation, and listing modules with file outputs + Prisma persistence
- secure API key storage with encryption + admin endpoints for settings/keys
- wire Prometheus metrics, readiness probes, structured logging
- add Vitest unit tests + pipeline E2E test harness using fake Prisma
- document stack (`docs/stack.md`), operations (`docs/runbook.md`), updated README quickstart
