import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Ledgerline, type InvoiceRow } from "@/components/ledgerline/Ledgerline";
import { COOKIE, canSee, canWrite, readSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { eur } from "@/components/ledgerline/data";

export const dynamic = "force-dynamic";

const nl = (d: Date) => d.toISOString().slice(0, 10).split("-").reverse().join("-");

export default async function Page() {
  const session = readSession((await cookies()).get(COOKIE)?.value);
  if (!session) redirect("/login");
  const { rows } = await db().query("select number, customer, issued, due, total_cents, status from invoice order by position");
  const invoices: InvoiceRow[] = rows.map((r) => ({
    number: r.number, customer: r.customer, issued: nl(r.issued), due: nl(r.due),
    total: eur(r.total_cents / 100), totalCents: r.total_cents, status: r.status
  }));
  const screens = ["invoices", "payments", "reconciliation", "contacts", "reports", "settings"].filter((s) => canSee(session.role, s));
  return (
    <div style={{ height: "100vh" }}>
      <Ledgerline screen={canSee(session.role, "invoices") ? "invoices" : "reports"} invoices={invoices}
        user={{ name: session.name, email: session.email, role: session.role, canWrite: canWrite(session.role), screens }} />
    </div>
  );
}
