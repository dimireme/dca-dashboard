# BTC DCA Tracker

Personal web app for tracking Bitcoin DCA schedule execution and purchase history.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- React Query
- Vitest

## Setup

```bash
yarn install
cp .env.example .env
yarn prisma migrate dev
```

## Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `yarn dev` — start development server
- `yarn build` — production build
- `yarn lint` — ESLint
- `yarn typecheck` — TypeScript check
- `yarn test` — Vitest unit tests
- `yarn prisma migrate dev` — apply database migrations

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

## Project docs

- [docs/PRD.md](docs/PRD.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/RULES.md](docs/RULES.md)
