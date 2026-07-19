# Project Rules

## General

This is a personal project.

Always choose the simplest solution that satisfies requirements.

Avoid overengineering.

Prefer readability over abstraction.

---

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- React Query
- Zod
- Vitest
- viem (worker)

---

## Database

Use Prisma ORM.

All schema changes must be represented through Prisma migrations.

Never write raw SQL unless explicitly required.

---

## API

Use Route Handlers.

All API input must be validated with Zod.

Return typed responses.

---

## State Management

Prefer React Query.

Avoid Redux.

Avoid global state unless necessary.

---

## UI

Mobile-first.

Responsive design required.

Calendar is the primary screen.

Dashboard statistics are secondary.

---

## Components

Create reusable components.

Avoid files larger than 300 lines.

Prefer composition over inheritance.

---

## Architecture

Keep business logic separate from UI.

Create services for calculations.

Never place DCA calculations directly inside React components.

---

## Testing

Write unit tests for:

- average price calculation
- covered days calculation
- schedule progress calculation

Use Vitest.

---

## Security

Application is intended to be protected by Cloudflare Zero Trust.

No internal authentication system is required.

No user accounts are required.

Single-user application.

### DCA Worker

- `WALLET_PRIVATE_KEY` — only in worker process env, never in dashboard
- Use a dedicated DCA wallet with limited USDC balance, not the main cold wallet
- Never log private keys, RPC URLs with embedded secrets, or full transaction payloads in production
- Odos API key — optional for public API; required only for enterprise endpoint

---

## Worker

Worker code lives in `src/worker/`.

Rules:

- Reuse `services/` and `repositories/` — no duplicated business logic
- No Prisma calls outside repositories
- No HTTP API calls to the dashboard — write to DB directly via services
- Swap logic isolated in `src/worker/swap/`
- Scheduling via `DcaStrategy.nextExecutionAt` per strategy in DB, not cron
