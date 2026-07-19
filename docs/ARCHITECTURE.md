# Architecture

## Overview

BTC DCA Tracker is a single-user application with two runtime processes:

```
Next.js Dashboard  ──►  PostgreSQL  ◄──  Node Worker
                                              │
                                              ▼
                                           Odos API
                                              │
                                              ▼
                                          Arbitrum
```

- **Dashboard** — web UI and API for manual purchases and metrics
- **Worker** — background process for automated USDC → WBTC swaps

One repository, one database, shared services and repositories.

Architecture layers:

- UI Layer
- API Layer
- Service Layer
- Repository Layer
- Worker Layer (uses Service + Repository, no UI/API)

Business logic must be isolated inside services.

React components must remain presentation-focused.

---

# Project Structure

```
src/
  app/
    api/
    dashboard/
  components/
    calendar/
    dashboard/
    purchases/
    ui/
  services/
    dca.service.ts
    purchase.service.ts
    calendar.service.ts
  repositories/
    purchase.repository.ts
    dca-strategy.repository.ts
  worker/
    index.ts
    scheduler.ts
    swap/
      odos.client.ts
      swap.service.ts
  lib/
    prisma.ts
  types/
prisma/
```

MVP stays in a flat `src/` layout. No monorepo (`apps/`, `packages/`) until complexity justifies it.

---

# Layers

## UI Layer

Location:

`src/components`
`src/app`

Responsibilities:

- rendering
- user interactions
- forms

Must NOT:

- calculate DCA metrics
- perform database access

---

## API Layer

Location:

`src/app/api`

Responsibilities:

- request validation
- response formatting
- calling services

Must NOT:

- contain business logic
- contain Prisma queries

API routes should remain thin.

---

## Service Layer

Location:

`src/services/`

| File | Responsibility |
|------|----------------|
| `dca.service.ts` | DCA metrics, covered days, schedule progress |
| `calendar.service.ts` | day states, purchase markers |
| `purchase.service.ts` | create/list purchases (manual and dca) |

All business logic belongs here. Worker calls the same services as API routes.

---

## Repository Layer

Location:

`src/repositories/`

Responsibilities:

- database access
- Prisma queries

Repositories hide Prisma from services.

---

## Worker Layer

Location:

`src/worker/`

Responsibilities:

- poll all `DcaStrategy` rows where `enabled` and `nextExecutionAt <= now()`
- execute due strategies sequentially (one wallet)
- execute swap via Odos per strategy
- sign and send transaction (viem/ethers)
- record purchase via `purchase.service.ts`
- update timestamps for the executed strategy

Must NOT:

- duplicate purchase or DCA business logic
- access Prisma directly — only through repositories via services
- expose HTTP endpoints

Worker entry: `yarn worker` → `src/worker/index.ts`

---

## Persistence Layer

Prisma + PostgreSQL.

Only repositories may access Prisma directly.

---

# Deployment

Production runs on Coolify with Nixpacks.

Two services, one shared PostgreSQL database.

## Database

- PostgreSQL 16 (managed Postgres resource in Coolify)
- `DATABASE_URL` — internal Postgres connection string
- Migrations applied on dashboard start via `prisma migrate deploy`

## Service 1: Dashboard

| Setting | Value |
|---------|-------|
| Name | `btc-dca-dashboard` |
| Type | Next.js |
| Start command | `yarn start` |

Environment:

- `DATABASE_URL`
- `DAILY_AMOUNT_USD` (default `20`)

Must NOT include `WALLET_PRIVATE_KEY`.

## Service 2: Worker

| Setting | Value |
|---------|-------|
| Name | `btc-dca-worker` |
| Type | Node.js |
| Start command | `yarn worker` |

Environment:

- `DATABASE_URL`
- `ARBITRUM_RPC_URL`
- `WALLET_PRIVATE_KEY`
- `ODOS_API_KEY` (optional — public `https://api.odos.xyz` works without it)

## Local Development

- `docker compose up -d` — local PostgreSQL
- `yarn db:migrate` — apply migrations in development
- `yarn dev` — dashboard
- `yarn worker` — worker (separate terminal; needs worker env vars in `.env`)

## Coolify Setup

1. Create PostgreSQL 16 resource
2. Create dashboard service, link DB, set `DATABASE_URL` and `DAILY_AMOUNT_USD`
3. Create worker service from same repo, link same DB, set worker env vars
4. Push to `master` — both services build via Nixpacks
5. Dashboard runs `prisma migrate deploy` on start

---

# Core Domain

## Purchase

Represents a Bitcoin purchase (manual or automated).

Stored fields:

- id
- date
- amountUsdt (stablecoin amount; on-chain token is USDC)
- btcPrice
- source (`manual` | `dca`)
- strategyId (optional FK to `DcaStrategy`; set for `dca` purchases)
- txHash (optional; on-chain swap hash for `dca` purchases)
- createdAt

Derived at read time (not in DB):

- btcAmount = amountUsdt / btcPrice

Used by `dca.service.ts` for total BTC and average entry price.

---

## DcaStrategy

Bot execution configuration. **Multiple rows** — one per independent swap schedule.

Fields:

- id
- enabled
- amountUsdc (USDC per swap)
- intervalHours
- lastExecutionAt
- nextExecutionAt

Scheduling rule (per strategy):

```
enabled AND nextExecutionAt <= now() → execute swap for this strategy
```

Worker fetches all matching rows each poll cycle and processes them **sequentially** (shared wallet, nonce safety).

After success:

```
lastExecutionAt = now()
nextExecutionAt = now() + intervalHours
```

Purchases from bot link back via optional `strategyId` FK on `Purchase`.

---

## DCA Plan Configuration (dashboard)

Environment variables and derived values:

- `DAILY_AMOUNT_USD` in `.env` (default `20`), read via `src/lib/dca-config.ts`
- `dcaStartDate` derived from the earliest `Purchase.date` via `findEarliestPurchaseDate()`

When there are no purchases yet, the calendar shows all days as neutral and schedule metrics are zero.

---

# DCA Bot Execution Cycle

```
┌─────────────┐
│   Worker    │  every 60s
│   poll DB   │
└──────┬──────┘
       │ all strategies: enabled AND nextExecutionAt <= now()
       ▼
┌─────────────┐
│ For each    │  sequential (nonce safety)
│ due strategy│◄──┐
└──────┬──────┘   │
       ▼          │
┌─────────────┐   │
│ Odos quote  │   │
│ + assemble  │   │
└──────┬──────┘   │
       ▼          │
┌─────────────┐   │
│ Sign & send │   │
│ transaction │   │
└──────┬──────┘   │
       ▼          │
┌─────────────┐   │
│ Wait for    │   │
│ confirmation│   │
└──────┬──────┘   │
       ▼          │
┌─────────────┐   │
│ purchase    │   │
│ .service    │   │
└──────┬──────┘   │
       ▼          │
┌─────────────┐   │
│ Update      │   │
│ DcaStrategy │───┘ next strategy
└─────────────┘
```

Calendar and dashboard metrics update automatically from new `Purchase` rows.

---

# Swap Integration (Odos)

Provider: **Odos** (primary, Arbitrum).

Two-step API flow:

1. `POST /sor/quote/v3` — get route and `pathId`
2. `POST /sor/assemble` — get `transaction` (`to`, `data`, `value`, gas)

Worker signs assembled transaction and broadcasts via Arbitrum RPC.

Abstraction: `src/worker/swap/odos.client.ts` wraps HTTP calls; `swap.service.ts` orchestrates quote → sign → send. Swap provider interface allows future fallback without changing purchase logic.

`pathId` must be assembled promptly after quote (do not cache quotes).

---

# DCA Calculations

All calculations belong to:

`services/dca.service.ts`

Examples:

- total invested
- total BTC accumulated
- average entry price
- covered days
- expected days
- days behind
- amount behind

No React component may implement these formulas.

---

# Calendar Logic

All calendar generation belongs to:

`services/calendar.service.ts`

Responsibilities:

- generate day states
- determine covered days
- determine missed days
- determine purchase markers

UI receives already prepared calendar data.

---

# Design Principles

Prefer:

- simple code
- explicit code
- small files
- predictable structure
- shared services between dashboard and worker

Avoid:

- premature abstractions
- complex patterns
- dependency injection frameworks
- event sourcing
- CQRS
- microservices
- separate bot repository
- smart contracts for personal DCA

This project should remain maintainable by a single developer.
