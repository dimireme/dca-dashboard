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
- SQLite for MVP
- React Query
- Zod

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
