import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { resetAndSeed } from "@/lib/seed";

// Protected fixture route for the test harness. There is no button for this anywhere in the UI.
export async function POST(req: Request) {
  const expected = process.env.ADMIN_TOKEN || "";
  const given = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const ok = expected.length >= 24 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const missing = ["OWNER", "BOOKKEEPER", "ACCOUNTANT", "VIEWER"].filter((k) => !process.env["LEDGERLINE_PASSWORD_" + k]);
  if (missing.length) {
    return NextResponse.json({ error: "Set LEDGERLINE_PASSWORD_" + missing.join(", LEDGERLINE_PASSWORD_") + " on the host first, otherwise the reset would create passwords nobody can read." }, { status: 409 });
  }
  const creds = await resetAndSeed(db());
  // Passwords are never returned; they come from LEDGERLINE_PASSWORD_* env vars or the seed script output.
  return NextResponse.json({ ok: true, message: "Test data was reset and seeded again.", accountCount: creds.length, accounts: creds.map((c) => c.email) });
}
