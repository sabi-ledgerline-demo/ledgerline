import { randomBytes } from "node:crypto";
import type { Pool } from "pg";
import { ACCOUNTS } from "../config/accounts";
import { CUSTOMERS, STATUSES } from "../components/ledgerline/data";
import { hashPassword } from "./auth";

const SCHEMA = `
create table if not exists app_user (
  email text primary key, name text not null, role text not null, password_hash text not null
);
create table if not exists invoice (
  position integer not null, number text primary key, customer text not null, issued date not null, due date not null,
  total_cents integer not null, status text not null
);
create table if not exists payment (
  id serial primary key, invoice_number text not null references invoice(number),
  amount_cents integer not null, paid_on date not null, method text not null,
  recorded_by text not null, created_at timestamptz not null default now()
);`;

export function seedInvoices() {
  const out: { number: string; customer: string; issued: string; due: string; total_cents: number; status: string }[] = [];
  for (let i = 0; i < 40; i++) {
    const d = String(13 - (i % 12)).padStart(2, "0");
    out.push({
      number: "INV-2026-0" + (451 - i),
      customer: CUSTOMERS[i % CUSTOMERS.length],
      issued: "2026-08-" + d,
      due: "2026-09-" + d,
      total_cents: Math.round((480 + ((i * 733) % 6400) + (i % 7) * 12.5) * 100),
      status: STATUSES[i % STATUSES.length]
    });
  }
  out[39].number = "INV-2026-0449"; // swapped with the 0412 row so numbers stay unique
  out[2] = { number: "INV-2026-0412", customer: "Bakkerij De Korenhalm B.V.", issued: "2026-08-14", due: "2026-09-13", total_cents: 281250, status: "Overdue" };
  return out;
}

// Wipes all Ledgerline data and puts the database into the known staging state.
// Passwords: LEDGERLINE_PASSWORD_<ROLE> if set, otherwise generated. Generated
// ones are returned so the person running the script can store them.
export async function resetAndSeed(pool: Pool): Promise<{ email: string; role: string; password: string; generated: boolean }[]> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("drop table if exists payment, invoice, app_user");
    await client.query(SCHEMA);
    const creds = [];
    for (const a of ACCOUNTS) {
      const fromEnv = process.env["LEDGERLINE_PASSWORD_" + a.key];
      const password = fromEnv || randomBytes(12).toString("base64url");
      await client.query("insert into app_user (email, name, role, password_hash) values ($1,$2,$3,$4)", [a.email, a.name, a.role, hashPassword(password)]);
      creds.push({ email: a.email, role: a.role, password, generated: !fromEnv });
    }
    for (const [pos, inv] of seedInvoices().entries()) {
      await client.query("insert into invoice (position, number, customer, issued, due, total_cents, status) values ($7,$1,$2,$3,$4,$5,$6)", [inv.number, inv.customer, inv.issued, inv.due, inv.total_cents, inv.status, pos]);
    }
    await client.query("commit");
    return creds;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
