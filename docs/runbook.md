# etsy-gen Runbook

## 1. Provisioning

1. Ensure PostgreSQL and Redis are reachable (local Docker or managed services).
2. Export environment variables (see `.env.example`) or create `.env.local` with:
   - `DATABASE_URL`, `REDIS_URL`, `APP_ENCRYPTION_KEY`
   - API secrets (`OPENAI_API_KEY`, `ETSY_API_KEY`, etc.)
   - `ADMIN_API_TOKEN` for authenticated admin calls
3. Install dependencies and run migrations/seed:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 2. Runtime processes

| Process | Command | Notes |
| --- | --- | --- |
| API | `npm run dev` | Express API on port `PORT` (default 3001) |
| Workers | `npm run queues` | BullMQ workers for scrape/analyze/generate/list |
| Scheduler | `npm run cron` | node-cron schedules every 6h with offsets |
| Frontend (optional) | `npm run web:dev` | Existing Next.js UI |

Order is flexible; workers and cron expect Redis to be available before they start.

## 3. Operational commands

- **Smoke test database**: `node scripts/db-smoke.ts`
- **Manual pipeline kick** (requires `x-admin-token` header):
  - `POST /api/admin/run/scrape`
  - `POST /api/admin/run/analyze`
  - `POST /api/admin/run/generate`
  - `POST /api/admin/run/list`
- **Store secrets**: `POST /api/admin/keys` with `{ name, value }`
- **Update settings**: `POST /api/admin/settings` with `{ key, value }`

## 4. Observability & troubleshooting

- Health: `GET /healthz`
- Readiness (checks DB + Redis): `GET /readyz`
- Metrics (Prometheus): `GET /metrics`
- Logs: all services emit structured JSON via `pino`
- Failed jobs: inspect BullMQ queues (`bull-board` or Redis CLI) and review `Job` table entries.

### Common issues

| Symptom | Checks |
| --- | --- |
| `DB smoke test failed` | Verify `DATABASE_URL`, run `npm run db:migrate` |
| Workers stuck in `retrying` | Confirm external APIs reachable, check API keys in `/api/admin/keys/meta` |
| Duplicate listings | Ensure Redis is reachable (job dedupe uses BullMQ jobId); check for manual repeated triggers |
| Missing generated files | Confirm `GENERATED_ROOT` write permissions; inspect worker logs |

## 5. Backup & data hygiene

- Daily scrape snapshots stored under `data/scrape/*.ndjson` for offline analysis.
- Generated product assets live under `generated/` grouped by product id.
- Configure external backups at the database level (PostgreSQL) and Redis snapshots as needed.
- Consider weekly cleanup job (future work) to prune stale raw scrape blobs.

## 6. Testing & releases

- Run `npm test` before deploy. Backend tests mock Prisma and create temporary data directories.
- CI should run `npm run build` (tsc emit) and `npm test`.
- For deployments, run migrations via `npm run db:migrate` before starting workers/cron/api.
