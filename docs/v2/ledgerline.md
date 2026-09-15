# Ledgerline

## What it is

Ledgerline is a fictional bookkeeping product for Dutch small businesses. It is an ordinary Next.js app with a Postgres database, a login and four roles. It is the standing live test company for Sabí: a separate customer with its own GitHub account, its own hosting and its own staging data.

**Ledgerline holds test data only.** Never put real customer, company or financial data in it, and never reuse a real password for a test account.

Nothing in this repository belongs to Sabí. There are no Sabí prompts, templates or source files here, and the scan (`npm run scan`) checks for that.

## Roles and test accounts

| Role | Account | Can do |
| --- | --- | --- |
| Owner | nadia@vandijkzonen.nl | everything, including Settings |
| Bookkeeper | ruben@vandijkzonen.nl | invoices, payments, reconciliation, contacts, reports |
| Accountant | m.smits@smitsaccountants.nl | read invoices and reports |
| Viewer | joost@vandijkzonen.nl | read only |

Passwords are not in this repository. They are set with the `LEDGERLINE_PASSWORD_OWNER`, `_BOOKKEEPER`, `_ACCOUNTANT` and `_VIEWER` environment variables when seeding, or generated and printed once by `npm run seed`. Store them in the Sabí workspace settings and with the founder, nowhere else.

## Deploy

1. Create a Postgres database for Ledgerline (its own project, not shared with Sabí).
2. Create a hosting project from this repository. Set these environment variables: `DATABASE_URL`, `SESSION_SECRET` (32+ random characters), `ADMIN_TOKEN` (24+ random characters), and the four `LEDGERLINE_PASSWORD_*` variables.
3. Deploy. Then run the seed once (below).

Feature flags live in `config/`, never in the interface. The interface has no test or scripting controls; fixtures are loaded from the command line or the protected reset route.

## Seed and reset

Both put the database into the known staging state: 40 invoices, no payments, one account per role. Reset deletes everything first.

From a terminal, with the production variables in your shell:

```bash
npm run seed     # first time
npm run reset    # back to the known state (same script)
```

From the test harness, with the admin token (there is no button in the interface):

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" https://<staging-host>/api/admin/reset
```

The route returns 403 without the token. It returns 409 if the four password variables are not set on the host, so a reset can never create passwords nobody can read.

## Connect it to Sabí

Connect it exactly as a real customer would:

1. Sign up for Sabí as the Ledgerline company (a new client workspace). Do not use or seed any existing workspace.
2. Install the Sabí GitHub App from the **Ledgerline GitHub account** (`sabi-ledgerline-demo`), not from the account that owns the Sabí app, and give it this repository.
3. In Sabí, connect the repository, map the app areas (Invoices, Payments, Reconciliation, Contacts, Reports, Settings) and write the first docs.
4. Save the staging address and the test account credentials in the workspace settings.

Changes are shown by pushing real code or merging a real pull request in this repository. The `feature/partial-payments` branch is ready to merge. Sabí reacts through its normal webhook and worker; nothing is triggered by hand.

## Work items

`backlog/` holds about 20 work items in the style of an Azure DevOps board. Item 1208 (partial payments) is the open pull request; 1209 (automatic overdue detection) is the next change and has a failing test-first spec on `feature/overdue-invoice-detection`.

## Scan

```bash
npm run scan
```

Checks the working tree, every commit and every commit message for secrets, env files, keys, references to Sabí internals and leftover scripted-demo code. Run it before every release; it exits with an error on any finding.
