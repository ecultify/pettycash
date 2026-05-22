# Petty Cash

A minimalistic, mobile-first web app for office staff to record cash
disbursements and keep them updated. Built with Next.js (App Router,
TypeScript), Tailwind CSS, and shadcn/ui.

## The 3-role flow

Each record tracks cash moving through three people:

```
ALLOCATOR --amount_allocated--> GIVER --amount_given--> RECIPIENT
```

The recipient spends `amount_spent` and returns the remainder to the giver.

## Screens

- **Overview** (`/`) — headline totals across all records (Allocated, Handed
  Off, Spent, Outstanding) followed by one card per allocator with their own
  totals and disbursement count. Tap a card to drill in.
- **Allocator detail** (`/allocator/[name]`) — that allocator's totals, with
  their disbursements grouped by month (newest first). Each collapsible month
  group shows subtotals; each row shows giver → recipient, amounts, and a
  status pill.
- **All disbursements** (`/all`) — every record grouped by month, with
  allocator + status filters and a search box. Totals reflect the filters.
- **Add** (`/add`) — record a disbursement. Allocator and Giver offer
  suggestions from existing records but accept free text.
- **Detail / edit** (`/disbursement/[id]`) — view every field and the computed
  remainder, edit anything, update amount spent, toggle "remainder returned",
  or delete (with confirmation).

All totals are derived on the client from the records list — no extra
endpoints. All money is shown in Indian Rupees (`₹`).

## How it talks to the backend

The PHP backend at `https://cultform.ecultify.com/api/petty-cash` requires an
`X-API-Key` header. **The browser never calls it directly and never sees the
key.**

- The React UI only ever calls this app's own routes under `/api/*`.
- The Route Handler in [`app/api/disbursements/route.ts`](app/api/disbursements/route.ts)
  runs on the server, attaches `X-API-Key` from `PETTY_CASH_API_KEY`, and
  proxies to the PHP API.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (copy from `.env.example`) and set the API key:

   ```bash
   cp .env.example .env.local
   ```

   ```
   PETTY_CASH_API_KEY=your-real-key-here
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>. Use a phone-sized viewport (or your phone on
   the same network) for the intended experience.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New… → Project** and import the repo. Next.js is detected
   automatically — no build settings to change.
3. Under **Settings → Environment Variables**, add:

   | Name                 | Value         | Environments                      |
   | -------------------- | ------------- | --------------------------------- |
   | `PETTY_CASH_API_KEY` | your real key | Production, Preview, Development  |

   Do **not** prefix it with `NEXT_PUBLIC_` — it must stay server-side only.
4. Deploy. Re-deploy after changing environment variables so they take effect.

## Project structure

```
app/
  api/disbursements/route.ts   Server proxy (GET / POST / PATCH / DELETE)
  page.tsx                     Overview dashboard (totals + allocator cards)
  all/page.tsx                 All disbursements (month groups, filters, search)
  allocator/[name]/page.tsx    One allocator's totals + monthly disbursements
  add/page.tsx                 Add disbursement form
  disbursement/[id]/page.tsx   Detail / edit / delete
lib/
  petty-cash-api.ts            Server-only backend client (attaches API key)
  client.ts                    Browser fetch helpers (call /api/* only)
  use-disbursements.ts         Client hook: fetch + normalise the records list
  aggregate.ts                 Totals, allocator grouping, month grouping
  format.ts                    Money / date formatting, record normalisation
  types.ts                     Shared types
components/                    UI components + shadcn/ui primitives
```

## Tech

Next.js App Router · TypeScript · Tailwind CSS v4 · shadcn/ui · sonner (toasts).
