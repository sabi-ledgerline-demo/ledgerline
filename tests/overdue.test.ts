// Test-first spec for backlog item 1209. Fails until components/ledgerline/overdue.ts exists.

import { test } from "node:test";
import assert from "node:assert/strict";
import { daysOverdue, resolveStatus } from "../components/ledgerline/overdue.ts";

test("daysOverdue is 0 on the due date itself", () => {
  assert.equal(daysOverdue("2026-10-03", "2026-10-03"), 0);
});

test("daysOverdue counts whole days past the due date", () => {
  assert.equal(daysOverdue("2026-09-25", "2026-10-03"), 8);
});

test("daysOverdue is 0 (never negative) before the due date", () => {
  assert.equal(daysOverdue("2026-10-10", "2026-10-03"), 0);
});

test("resolveStatus flips an unpaid Open invoice to Overdue once past due", () => {
  assert.equal(resolveStatus("Open", "2026-09-25", "2026-10-03"), "Overdue");
});

test("resolveStatus leaves an Open invoice alone before the due date", () => {
  assert.equal(resolveStatus("Open", "2026-10-10", "2026-10-03"), "Open");
});

test("resolveStatus never changes Paid, Credited or Draft invoices", () => {
  for (const status of ["Paid", "Credited", "Draft"]) {
    assert.equal(resolveStatus(status, "2026-01-01", "2026-10-03"), status);
  }
});
