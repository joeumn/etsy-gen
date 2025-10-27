# etsy-gen Stack Overview

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | Node.js 20 LTS | Aligns with Vercel/Next.js defaults and latest TS features |
| Frontend | Next.js 15 (existing) | Retained for dashboard/UI already built in repo |
| Backend | Express 5 + TypeScript | Lightweight HTTP API for health, admin endpoints, metrics |
| Database ORM | Prisma 6 | Schema-first migrations, type-safe client, PostgreSQL support |
| Database | PostgreSQL (Supabase compatible) | Matches prior Supabase schema, works locally via Docker |
| Queue | BullMQ + Redis | Durable job queues with retries/backoff for each pipeline stage |
| Scheduler | node-cron | Simple in-process cron orchestrator (6h cadence + offsets) |
| Workers | ts-node workers per stage | Dedicated worker processes for scrape/analyze/generate/list |
| AI | OpenAI (fallback stubs) | Text generation for analysis + product assets, pluggable providers |
| Observability | prom-client + pino | Structured logs, metrics endpoint, health/readiness probes |
| Tests | Vitest | Node env unit tests + pipeline E2E with fake Prisma |

## Why these choices

- **Prisma + Postgres** provide transactional persistence, unique constraints for idempotent jobs, and simple migrations that can run anywhere (including Supabase).
- **BullMQ/Redis** keeps the automation pipeline durable with retries/backoff and supports cross-process workers without introducing another service.
- **Express** keeps the backend small, fits the existing Next.js repo, and runs alongside workers/cron without a separate framework.
- **node-cron** is sufficient for the deterministic 6-hour cadence. The orchestrator still allows manual kicks and chaining.
- **Vitest** integrates with existing tooling and runs quickly in CI; fake Prisma keeps tests hermetic.

## Upstream integrations detected

- Residual Supabase SQL migrations remain for the legacy dashboard; they are untouched but replaced by Prisma migrations for the automation backend.
- Frontend continues to run via `next dev`/`web:*` scripts, while backend API/queues/cron are separate npm scripts documented in the README.
