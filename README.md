# BTC DCA Tracker

Personal web app for tracking Bitcoin DCA schedule execution and purchase history.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- React Query
- Vitest

## Setup

```bash
yarn install
cp .env.example .env
yarn db:up
yarn db:migrate
```

Optional: import data from a legacy SQLite `dev.db`:

```bash
yarn db:import-sqlite
```

## Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `yarn dev` — start development server
- `yarn build` — production build
- `yarn start` — apply migrations and start production server
- `yarn lint` — ESLint
- `yarn typecheck` — TypeScript check
- `yarn test` — Vitest unit tests
- `yarn db:up` — start local PostgreSQL via Docker Compose
- `yarn db:down` — stop local PostgreSQL
- `yarn db:migrate` — apply database migrations (development)
- `yarn db:migrate:deploy` — apply migrations (production/CI)
- `yarn db:import-sqlite` — import purchases from legacy SQLite `dev.db`

## API

Bot integration endpoint:

```http
POST /api/purchases
Content-Type: application/json

{
  "amountUsdt": 300,
  "btcPrice": 98000,
  "source": "dca"
}
```

Optional `date` field for manual backfills. When omitted, the server uses today's date.

## Deploy (Coolify)

Auto-deploy is configured on push to `master`.

### PostgreSQL in Coolify

1. **Create database:** Coolify → Resources → New → Database → PostgreSQL 16
2. **Get connection string:** copy the internal URL (`postgresql://user:pass@host:5432/dbname`)
3. **Link to app:** in dca-dashboard environment variables set `DATABASE_URL` to the internal Postgres URL
4. **Set app env:** `DAILY_AMOUNT_USD=20` (or your value)
5. **Deploy:** push to `master` — Nixpacks builds the app, `prisma migrate deploy` runs on start
6. **Import legacy data (optional):** Coolify app terminal → `yarn db:import-sqlite` with `SQLITE_DATABASE_URL` and `DATABASE_URL` set

Use the internal Postgres URL (not public) so traffic stays on the private network.

## Project docs

- [docs/PRD.md](docs/PRD.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/RULES.md](docs/RULES.md)
