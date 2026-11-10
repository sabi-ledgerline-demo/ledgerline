import { test } from "node:test";
import assert from "node:assert/strict";
import { invoicesToCsv, exportFileName } from "../components/ledgerline/data";

test("CSV export has a header, one line per invoice and quotes awkward names", () => {
  const csv = invoicesToCsv([
    { number: "INV-2026-0001", customer: 'Brouwerij "t Zandpad, B.V.', issued: "01-07-2026", due: "31-07-2026", totalCents: 123456, status: "Open" }
  ]);
  const lines = csv.replace("\ufeff", "").trim().split("\r\n");
  assert.equal(lines.length, 2);
  assert.equal(lines[1], 'INV-2026-0001,"Brouwerij ""t Zandpad, B.V.",01-07-2026,31-07-2026,1234.56,Open');
});

test("export file name includes the period and the status filter", () => {
  assert.equal(exportFileName("Overdue"), "ledgerline-invoices-2026-07-to-2026-09-overdue.csv");
});
