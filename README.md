# Petty Cash

A minimalistic, mobile-first web app for office staff to record cash
disbursements and keep them updated. Built with Next.js (App Router,
TypeScript), Tailwind CSS, and shadcn/ui.

## Features

- **List** — every disbursement, newest first, with a summary strip
  (Total Disbursed, Total Spent, Outstanding) and status pills.
- **Add** — record a new disbursement (giver, recipient, amount, date, notes).
- **Detail / Edit** — update amount spent, mark the remainder returned to the
  giver, edit any field, or delete the record.

All money is shown in Indian Rupees (`₹`).

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
  page.tsx                     List + summary strip
  add/page.tsx                 Add disbursement form
  disbursement/[id]/page.tsx   Detail / edit / delete
lib/
  petty-cash-api.ts            Server-only backend client (attaches API key)
  client.ts                    Browser fetch helpers (call /api/* only)
  format.ts                    Money / date formatting, record normalisation
  types.ts                     Shared types
components/                    UI components + shadcn/ui primitives
```

## Tech

Next.js App Router · TypeScript · Tailwind CSS v4 · shadcn/ui · sonner (toasts).
