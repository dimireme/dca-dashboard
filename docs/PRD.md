# BTC DCA Tracker - PRD

## Goal

Personal web application for tracking Bitcoin accumulation progress using a DCA strategy.

The application is intended for a single user only.

Main objective is not portfolio tracking but tracking DCA schedule execution and visualizing progress against a target accumulation plan.

A background worker automates recurring USDC → WBTC swaps on Arbitrum and records purchases in the same database.

---

## User Story

As a Bitcoin investor, I want to:

- record Bitcoin purchases manually;
- receive purchases automatically from my DCA bot;
- see how much money I have invested;
- see my average Bitcoin purchase price;
- see how many DCA days are covered by my purchases;
- see how many days I am ahead or behind schedule;
- visualize all historical activity on a calendar.

---

## Core Configuration

### Dashboard schedule (compression logic)

The DCA plan for covered-days calculation is configured via environment variables:

- Daily amount: `DAILY_AMOUNT_USD` in `.env` (default **20 USD**, see `.env.example`)
- Start date: date of the **first purchase** in the database

Example:

First purchase: 2026-01-01

Daily amount: 20 USD (`DAILY_AMOUNT_USD=20`)

### DCA bot execution

Bot swap schedules are stored in the database (`DcaStrategy` table). Multiple strategies are supported.

Each strategy has:

- `enabled` — on/off switch
- `amountUsdc` — USDC spent per swap
- `intervalHours` — hours between swaps (e.g. `4`)
- `lastExecutionAt` — last successful run
- `nextExecutionAt` — when the next swap should run

Example — two active strategies:

| amountUsdc | intervalHours | swaps/day |
|------------|---------------|-----------|
| 5 | 4 | 6 |
| 10 | 24 | 1 |

Total via bot: 6×5 + 10 = 40 USDC/day (independent of `DAILY_AMOUNT_USD` on dashboard).

`DAILY_AMOUNT_USD` (dashboard) and bot strategies are independent settings.

---

## Purchase Record

Stored fields:

- date
- amount_usdt (stablecoin amount in USD; on-chain token is USDC)
- btc_price
- source
- strategy_id (optional; set for `dca` purchases, FK to `DcaStrategy`)
- notes (optional)

Derived (not stored):

- btc_amount = amount_usdt / btc_price

Keeping only `btc_price` simplifies manual and historical data entry. For bot purchases, store the **effective execution price** (`amountUsdc / actual WBTC received`), not a quoted spot price.

Source:

- `manual` — entered via dashboard
- `dca` — created by worker after on-chain swap

Example (manual):

2026-02-15
300 USDT
BTC price 98,000 USD
source = manual

Example (bot):

2026-03-01 08:00
5 USDC spent, effective price 97,656 USD/BTC
source = dca

---

## Dashboard

Display:

- total invested USDT
- total accumulated BTC
- average entry price
- DCA start date
- daily amount
- covered days
- expected days
- days behind schedule
- days ahead schedule
- amount behind schedule
- amount ahead schedule

---

## Calendar View

Calendar is the primary screen.

Support:

- year navigation
- month navigation

Each day can have:

Green:
covered by DCA progress

Red:
not covered by DCA progress

Today:
special highlight

Manual purchase:
special icon

Automatic DCA purchase:
special icon

Clicking a day opens purchase details.

---

## DCA Compression Logic

Covered days are calculated from total invested amount.

Formula:

coveredDays =
floor(totalInvested / dailyAmount)

Example:

dailyAmount = 20

totalInvested = 920

coveredDays = 46

If 58 days elapsed since start date:

46 days are green

12 days are red

This is independent from actual purchase dates.

---

## Average Entry Price

averagePrice =
totalInvested /
totalAccumulatedBTC

---

## DCA Bot

### Purpose

Automatically swap USDC → WBTC on Arbitrum at a fixed interval and record each execution as a `Purchase` with `source = dca`.

### Architecture

One repository, one PostgreSQL database, two processes:

- **Dashboard** — Next.js web app (existing)
- **Worker** — Node.js background process (`src/worker/`)

Both share Prisma schema, services, and repositories. No separate repo, no HTTP call between bot and dashboard.

### Swap provider

**Odos** — primary DEX aggregator for Arbitrum.

Flow per strategy execution:

1. Query all strategies where `enabled = true` AND `nextExecutionAt <= now()`
2. For each due strategy (sequentially — same wallet, avoid nonce conflicts):
   - Request quote from Odos (`USDC → WBTC`)
   - Assemble transaction via Odos API
   - Sign and broadcast with worker wallet
   - Wait for confirmation
   - Create `Purchase` via `purchase.service.ts` (`amountUsdt`, `btcPrice` = effective price, `source = dca`, `strategyId`)
   - Update `lastExecutionAt` and `nextExecutionAt` for this strategy

### Scheduling

No cron. Worker polls every minute:

```sql
SELECT * FROM DcaStrategy
WHERE enabled = true AND nextExecutionAt <= now()
```

For each row returned → execute swap cycle above.

After success per strategy: `nextExecutionAt = now() + intervalHours`.

Survives VPS restarts, deploys, and container crashes.

### Wallet

- Dedicated DCA wallet (not the main cold wallet)
- Funded periodically with a limited USDC balance
- Private key stored only in worker container env (`WALLET_PRIVATE_KEY`)
- Dashboard process must not have access to the private key

### On-chain scope

- Chain: Arbitrum
- Pair: USDC → WBTC
- No smart contracts
- No Gelato / on-chain automation
- Server-side signing only

---

## Non Goals

No portfolio valuation.

No CEX integration (Binance, Coinbase, etc.).

No smart contracts for DCA logic.

No multi-user support.

No social features.

No notifications in MVP.

No mobile app in MVP.

Responsive web interface only.
