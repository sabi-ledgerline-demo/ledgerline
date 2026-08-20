# Bug 1217: Invoice total rounds wrongly for 9% BTW lines

- Type: Bug
- State: Active
- Area Path: Ledgerline\Invoices
- Iteration: Ledgerline\Sprint 5

## Description

Lines at 9% BTW show a total that is one cent off when mixed with 21% lines.

## Acceptance criteria

- Totals equal the sum of the line amounts
- Regression test covers mixed BTW rates
