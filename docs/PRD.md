# BTC DCA Tracker - PRD

## Goal

Personal web application for tracking Bitcoin accumulation progress using a DCA strategy.

The application is intended for a single user only.

Main objective is not portfolio tracking but tracking DCA schedule execution and visualizing progress against a target accumulation plan.

---

## User Story

As a Bitcoin investor, I want to:

- record Bitcoin purchases manually;
- later receive purchases automatically from my DCA bot;
- see how much money I have invested;
- see my average Bitcoin purchase price;
- see how many DCA days are covered by my purchases;
- see how many days I am ahead or behind schedule;
- visualize all historical activity on a calendar.

---

## Core Configuration

The DCA plan is fixed in application code:

- Daily amount: **20 USD** (`DAILY_AMOUNT_USD` in `src/lib/dca-config.ts`)
- Start date: date of the **first purchase** in the database

Example:

First purchase: 2026-01-01

Daily amount: 20 USD

---

## Purchase Record

Purchase consists of:

- date
- amount_usdt
- btc_price
- source

Source:

- manual
- dca

Example:

2026-02-15
300 USDT
BTC price 98,000 USD
source = manual

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

## Future Integrations

Application must expose internal API for future DCA bot integration.

Example:

POST /api/purchases

Payload:

{
amountUsdt: number,
btcPrice: number,
source: "dca"
}

---

## Non Goals

No portfolio valuation.

No exchange integration.

No multi-user support.

No social features.

No notifications in MVP.

No mobile app in MVP.

Responsive web interface only.
