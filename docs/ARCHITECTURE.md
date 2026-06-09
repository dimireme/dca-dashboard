# Architecture

## Overview

BTC DCA Tracker is a single-user web application.

Architecture follows:

- UI Layer
- API Layer
- Service Layer
- Persistence Layer

Business logic must be isolated inside services.

React components must remain presentation-focused.

---

# Project Structure

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

lib/
prisma.ts

types/

prisma/

---

# Layers

## UI Layer

Location:

src/components
src/app

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

src/app/api

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

src/services/
dca.service.ts
calendar.service.ts
purchase.service.ts

Responsibilities:

- DCA calculations
- calendar generation
- statistics calculations
- purchase processing

All business logic belongs here.

---

## Repository Layer

Location:

src/repositories

Responsibilities:

- database access
- Prisma queries

Repositories hide Prisma from services.

---

## Persistence Layer

Prisma + SQLite.

Only repositories may access Prisma directly.

---

# Core Domain

## Purchase

Represents a Bitcoin purchase.

Fields:

- id
- date
- amountUsdt
- btcPrice
- btcAmount
- source
- notes
- createdAt

---

## DCA Plan Configuration

Environment variables and derived values:

- `DAILY_AMOUNT_USD` in `.env` (default `20`), read via `src/lib/dca-config.ts`
- `dcaStartDate` derived from the earliest `Purchase.date` via `findEarliestPurchaseDate()`

When there are no purchases yet, the calendar shows all days as neutral and schedule metrics are zero.

---

# DCA Calculations

All calculations belong to:

services/dca.service.ts

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

services/calendar.service.ts

Responsibilities:

- generate day states
- determine covered days
- determine missed days
- determine purchase markers

UI receives already prepared calendar data.

---

# Future Integrations

Future DCA bot will use:

POST /api/purchases

Application architecture must allow automatic purchase insertion without changing existing business logic.

Bot should interact only with API layer.

---

# Design Principles

Prefer:

- simple code
- explicit code
- small files
- predictable structure

Avoid:

- premature abstractions
- complex patterns
- dependency injection frameworks
- event sourcing
- CQRS
- microservices

This project should remain maintainable by a single developer.
