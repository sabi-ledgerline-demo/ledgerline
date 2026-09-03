import { test } from "node:test";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword, signSession, readSession, canWrite, canSee } from "../lib/auth";
import { seedInvoices } from "../lib/seed";

// read lazily by lib/auth, so setting it after the imports is fine
process.env.SESSION_SECRET = randomBytes(24).toString("hex");

test("password hashes verify and differ per call", () => {
  const a = hashPassword("correct horse");
  assert.ok(verifyPassword("correct horse", a));
  assert.ok(!verifyPassword("wrong", a));
  assert.notEqual(a, hashPassword("correct horse"));
});

test("sessions round-trip and reject tampering", () => {
  const t = signSession({ email: "a@b.nl", name: "A", role: "Viewer" });
  assert.equal(readSession(t)?.role, "Viewer");
  assert.equal(readSession(t.slice(0, -2) + "xx"), null);
  assert.equal(readSession(undefined), null);
});

test("roles limit writes and screens", () => {
  assert.ok(canWrite("Owner") && canWrite("Bookkeeper"));
  assert.ok(!canWrite("Accountant") && !canWrite("Viewer"));
  assert.ok(canSee("Owner", "settings") && !canSee("Bookkeeper", "settings"));
  assert.ok(canSee("Accountant", "reports") && !canSee("Accountant", "payments"));
});

test("seed invoices are 40 unique numbers and include INV-2026-0412 as Overdue", () => {
  const inv = seedInvoices();
  assert.equal(inv.length, 40);
  assert.equal(new Set(inv.map((i) => i.number)).size, 40);
  assert.equal(inv.find((i) => i.number === "INV-2026-0412")?.status, "Overdue");
});
