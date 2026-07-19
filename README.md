# BTC DCA Tracker

Personal web app for tracking Bitcoin DCA schedule execution and purchase history.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- React Query
- Vitest
- viem (worker)

## Setup

```bash
yarn install
cp .env.example .env
yarn db:up
yarn db:migrate
```

## Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

In a second terminal (after filling worker env vars in `.env`):

```bash
yarn worker
```

## Scripts

- `yarn dev` — start development server
- `yarn worker` — start DCA swap worker
- `yarn build` — production build
- `yarn start` — apply migrations and start production server
- `yarn lint` — ESLint
- `yarn typecheck` — TypeScript check
- `yarn test` — Vitest unit tests
- `yarn db:up` — start local PostgreSQL via Docker Compose
- `yarn db:down` — stop local PostgreSQL
- `yarn db:migrate` — apply database migrations (development)
- `yarn db:migrate:deploy` — apply migrations (production/CI)

## Processes

Two processes share one PostgreSQL database:

- **Dashboard** — `yarn dev` / `yarn start` (manual purchases, calendar, strategies)
- **Worker** — `yarn worker` (USDC → WBTC swaps on Arbitrum via Odos, then writes `Purchase` with `source = dca`)

The worker does **not** call the dashboard HTTP API. It uses the same `services/` and `repositories/` as the app and writes to the DB directly.

`POST /api/purchases` is for the dashboard UI (manual / backfill purchases), not for the bot.

## Project docs

- [docs/PRD.md](docs/PRD.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/RULES.md](docs/RULES.md)
