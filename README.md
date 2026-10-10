# Ledgerline

Ledgerline is a small bookkeeping app for Dutch small businesses: invoices, payments, reconciliation, contacts, reports and settings. It has four roles (Owner, Bookkeeper, Accountant, Viewer) and a login.

All data is fictional test data. Do not enter real customer or financial data.

## Run it

You need Node 20+ and a Postgres database.

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, SESSION_SECRET, ADMIN_TOKEN
npm run seed                 # creates tables, invoices and one account per role
npm run dev                  # http://localhost:3000
npm run build                # production build
```

## Layout

- `app/`: pages (`/`, `/login`) and API routes (`/api/login`, `/api/logout`, `/api/payments`, `/api/admin/reset`)
- `components/ledgerline/`: the product UI
- `lib/`: database, sessions and roles, seed data
- `config/accounts.ts`: the role accounts (names and emails only, never passwords)
- `scripts/`: `seed.ts` (also the reset), `scan.mjs` (secret and content scan)
- `backlog/`: work items
- `docs/v2/ledgerline.md`: deploy, seed and reset, connect to Sabí

## Tests

`data-testid` attributes are on every interactive element. Renaming one breaks automated checks.

See `docs/v2/ledgerline.md` for details.

<!-- staging smoke test 2026-10-06 -->
<!-- production check 2026-10-06 -->

Staging smoke check, 10 Oct 2026.
