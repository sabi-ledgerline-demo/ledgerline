import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE, canWrite, readSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = readSession((await cookies()).get(COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canWrite(session.role)) return NextResponse.json({ error: "Your role cannot record payments" }, { status: 403 });
  const { invoice, method, amountCents } = await req.json();
  const client = await db().connect();
  try {
    await client.query("begin");
    const { rows } = await client.query("select total_cents, status, (select coalesce(sum(amount_cents), 0)::int from payment where invoice_number = $1) as paid from invoice where number = $1 for update", [invoice]);
    if (!rows[0]) { await client.query("rollback"); return NextResponse.json({ error: "Invoice not found" }, { status: 404 }); }
    const remaining = rows[0].total_cents - rows[0].paid;
    if (remaining <= 0) { await client.query("rollback"); return NextResponse.json({ error: "Invoice is already paid" }, { status: 409 }); }
    const amount = Number.isInteger(amountCents) ? amountCents : remaining;
    if (amount <= 0 || amount > remaining) { await client.query("rollback"); return NextResponse.json({ error: "The amount must be above zero and at most the remaining balance" }, { status: 422 }); }
    await client.query("insert into payment (invoice_number, amount_cents, paid_on, method, recorded_by) values ($1,$2,current_date,$3,$4)", [invoice, amount, String(method || "SEPA bank transfer"), session.email]);
    await client.query("update invoice set status = $2 where number = $1", [invoice, amount === remaining ? "Paid" : "Partially paid"]);
    await client.query("commit");
    return NextResponse.json({ ok: true });
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
