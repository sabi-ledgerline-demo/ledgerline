"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { NAV, chip, eur } from "./data";
import { cssToObj } from "./cssToObj";
import type { LedgerlineProps } from "./types";
export type { LedgerlineProps, LedgerlineScreen } from "./types";

export type InvoiceRow = { number: string; customer: string; issued: string; due: string; total: string; totalCents: number; status: string };

type User = { name: string; email: string; role: string; canWrite: boolean; screens: string[] };

export function Ledgerline(props: LedgerlineProps & { invoices: InvoiceRow[]; user: User }) {
  const [screen, setScreen] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [payError, setPayError] = useState("");
  const router = useRouter();
  const [selectedTxn, setSelectedTxn] = useState("txn-exception");
  const [filter, setFilter] = useState<string | undefined>(undefined);

  // componentDidUpdate(prev) { if (prev.screen !== this.props.screen) reset }
  useEffect(() => {
    setScreen(null);
    setPayOpen(false);
  }, [props.screen]);

  const curScreen = screen || props.screen || "invoices";
  const go = (s: string) => () => { setScreen(s); setPayOpen(false); };
  const invoices = props.invoices;
  const cur = invoices.find((r) => r.number === selected) || invoices[0];
  const valid = ["All", "Open", "Paid", "Overdue", "Draft", "Credited"];
  const active = valid.indexOf(filter || "") >= 0 ? (filter as string) : "All";
  const matching = active === "All" ? invoices : invoices.filter((r) => r.status === active);
  const shown = matching.slice(0, 12);

  const navActive = ({ invoices: "invoices", invoice: "invoices", payments: "payments", reconciliation: "reconciliation", contacts: "contacts", reports: "reports", settings: "settings" } as Record<string, string>)[curScreen] || curScreen;
  const nav = NAV.filter(([, key]) => props.user.screens.includes(key)).map(([label, key, testid]) => {
    const on = navActive === key;
    return {
      label, testid, go: go(key === "invoices" ? "invoices" : key),
      style: cssToObj("display:block;width:100%;text-align:left;padding:5px 10px;background:" + (on ? "#dde5ec" : "transparent") +
        ";border:0;border-left:2px solid " + (on ? "#1a6091" : "transparent") +
        ";font:inherit;font-size:12.5px;font-weight:" + (on ? "600" : "400") + ";color:#1f2933;cursor:pointer")
    };
  });

  const filters = valid.map((label) => {
    const on = label === active;
    const count = label === "All" ? invoices.length : invoices.filter((r) => r.status === label).length;
    return {
      label: label === "All" ? label : label + " " + count,
      testid: "filter-status-" + label.toLowerCase().replace(/ /g, "-"),
      go: () => setFilter(label),
      style: cssToObj("height:24px;padding:0 9px;border-radius:3px;font:inherit;font-size:11.5px;cursor:pointer;background:" +
        (on ? "#1f2933" : "#fff") + ";border:1px solid " + (on ? "#1f2933" : "#d8dee6") + ";color:" + (on ? "#fff" : "#4c5a68") +
        (label === "Partially paid" ? ";font-weight:600" : ""))
    };
  });

  const txnRows = [
    { date: "12-09", party: "Hoekstra Installatietechniek", ref: "SEPA · NL21 ABNA 0417 1643 00", amount: "€ 1 815,00", match: "Matched" },
    { date: "11-09", party: "Kaashandel Wouters NV", ref: "iDEAL · order 88213", amount: "€ 642,50", match: "Matched" },
    { date: "09-09", party: "Bakkerij De Korenhalm B.V.", ref: "SEPA · ref INV-2026-0412", amount: "€ 1 250,00", match: "No match" },
    { date: "08-09", party: "Belastingdienst", ref: "BTW Q2 2026", amount: "− € 5 402,00", match: "Matched" },
    { date: "05-09", party: "De Groene Gracht VOF", ref: "SEPA · ref INV-2026-0388", amount: "€ 3 025,00", match: "Matched" },
    { date: "04-09", party: "Unknown payer", ref: "SEPA · no reference", amount: "€ 210,00", match: "No match" },
    { date: "02-09", party: "Drukkerij Veldkamp", ref: "SEPA · ref INV-2026-0361", amount: "€ 1 447,90", match: "Matched" }
  ];
  const txns = txnRows.map((t, i) => {
    const testid = i === 2 ? "txn-exception" : "txn-" + t.date.replace("-", "");
    const sel = selectedTxn === testid;
    const mchip: Record<string, [string, string, string]> = {
      Matched: ["#e7f4ec", "#c3e0cd", "#1f6b3f"],
      "Partial match": ["#fff5e4", "#ecd5a6", "#8a5a12"],
      "No match": ["#fdeceb", "#f0cdc9", "#a32b25"]
    };
    const mc = mchip[t.match];
    return {
      ...t, testid,
      select: () => setSelectedTxn(testid),
      rowStyle: cssToObj("display:grid;grid-template-columns:70px minmax(150px,1fr) 96px 132px;min-width:460px;padding:6px 12px;align-items:center;border-bottom:1px solid #edf1f4;cursor:pointer;background:" + (sel ? "#f3f7fa" : "transparent") + ";box-shadow:" + (sel ? "inset 2px 0 0 #1a6091" : "none")),
      chipStyle: cssToObj("display:inline-flex;align-items:center;height:19px;padding:0 7px;border-radius:3px;font-size:11px;font-weight:600;background:" + mc[0] + ";border:1px solid " + mc[1] + ";color:" + mc[2])
    };
  });

  const shallow = ({
    payments: {
      title: "Incoming payments", sub: "Payments / Incoming · last 30 days", col: "Payer",
      rows: [
        { date: "12-09-2026", name: "Hoekstra Installatietechniek", amount: "€ 1 815,00", method: "SEPA" },
        { date: "11-09-2026", name: "Kaashandel Wouters NV", amount: "€ 642,50", method: "iDEAL" },
        { date: "09-09-2026", name: "Bakkerij De Korenhalm B.V.", amount: "€ 1 250,00", method: "SEPA" },
        { date: "05-09-2026", name: "De Groene Gracht VOF", amount: "€ 3 025,00", method: "SEPA" },
        { date: "02-09-2026", name: "Drukkerij Veldkamp", amount: "€ 1 447,90", method: "SEPA" },
        { date: "29-08-2026", name: "Studio Beeldtaal", amount: "€ 890,00", method: "iDEAL" }
      ]
    }
  } as Record<string, { title: string; sub: string; col: string; rows: { date: string; name: string; amount: string; method: string }[] }>)[curScreen] || { title: "", sub: "", col: "", rows: [] };

  const users = [
    { name: "Nadia Koster", email: "nadia@vandijkzonen.nl", role: "Owner", scope: "Full access", active: "Today, 08:04", testid: "user-edit-nadia" },
    { name: "Ruben Aalders", email: "ruben@vandijkzonen.nl", role: "Bookkeeper", scope: "Invoices, payments", active: "Today, 07:41", testid: "user-edit-ruben" },
    { name: "Marieke Smits", email: "m.smits@smitsaccountants.nl", role: "Accountant (external)", scope: "Reports, VAT", active: "11 Sep 2026", testid: "user-edit-marieke" },
    { name: "Joost de Wit", email: "joost@vandijkzonen.nl", role: "Viewer", scope: "Read only", active: "3 Sep 2026", testid: "user-edit-joost" },
    { name: "Els Bakema", email: "els@vandijkzonen.nl", role: "Bookkeeper", scope: "Invoices, payments", active: "28 Aug 2026", testid: "user-edit-els" }
  ];

  const rows = shown.map((r) => ({ ...r, testid: "invoice-row-" + r.number, open: () => { setSelected(r.number); setScreen("invoice"); }, chipStyle: cssToObj(chip(r.status)) }));
  const net = Math.round(cur.totalCents / 1.21);
  const lines = cur.number === "INV-2026-0412"
    ? [
        { desc: "Sourdough delivery — week 32", qty: "1", vat: "9%", amount: "€ 1 184,38" },
        { desc: "Packaging and labels", qty: "6", vat: "21%", amount: "€ 690,00" },
        { desc: "Delivery surcharge", qty: "1", vat: "21%", amount: "€ 450,00" }
      ]
    : [{ desc: "Services — " + cur.customer, qty: "1", vat: "21%", amount: eur(net / 100) }];
  const noRows = shown.length === 0;
  const emptyHint = "Clear the status filter to see all 40 invoices.";
  const invoiceCountLabel = active === "All"
    ? invoices.length + " invoices · " + invoices.filter((r) => r.status === "Overdue").length + " overdue"
    : matching.length + " of 40 invoices · filtered by " + active.toLowerCase();
  const pagerLabel = matching.length === 0 ? "No results" : "Showing 1–" + shown.length + " of " + matching.length;

  const showInvoices = curScreen === "invoices";
  const showInvoice = curScreen === "invoice";
  const showRecon = curScreen === "reconciliation";
  const showReports = curScreen === "reports";
  const showSettings = curScreen === "settings";
  const showEmpty = curScreen === "contacts";
  const showShallow = curScreen === "payments";

  const headStatus = cur.status;
  const headChipStyle: CSSProperties = { ...cssToObj(chip(cur.status)), marginLeft: 6, verticalAlign: "2px" };
  const exceptionCopy = "The amount received does not equal any open invoice. Ledgerline cannot match a transaction to part of an invoice.";
  const matchActionLabel = "Match to invoice";
  const matchActionTestid = "match-full";

  const effectivePayOpen = payOpen;
  const payTitle = "Mark as paid";
  const payConfirmLabel = "Confirm payment";
  const payAmount = cur.total.replace("€ ", "");
  const openPay = () => { setPayError(""); setPayOpen(true); };
  const closePay = () => setPayOpen(false);
  const confirmPay = async () => {
    const method = (document.querySelector('[data-testid="pay-method-select"]') as HTMLSelectElement | null)?.value;
    const res = await fetch("/api/payments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invoice: cur.number, method }) });
    if (!res.ok) { setPayError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Payment could not be recorded. Try again."); return; }
    setPayOpen(false);
    router.refresh();
  };

  return (
    <div className="lg-root" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px', background: '#f4f6f8', color: '#1f2933', fontFamily: "'Source Sans 3',system-ui,sans-serif", fontSize: '13px', lineHeight: '1.45', overflow: 'hidden' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '44px', flex: 'none', padding: '0 14px', background: '#ffffff', borderBottom: '1px solid #d8dee6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #1a6091', borderRadius: '2px', position: 'relative' }}><div style={{ position: 'absolute', left: '2px', top: '5px', width: '8px', height: '2px', background: '#1a6091' }}></div></div>
          <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.1px' }}>Ledgerline</span>
        </div>
        <button className="lg-btn" data-testid="company-switcher" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 8px', background: '#f4f6f8', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', color: '#1f2933', cursor: 'pointer' }}>Van Dijk &amp; Zonen B.V. <span style={{ color: '#8795a3' }}>▾</span></button>
        <div style={{ flex: 1 }}></div>
        <input data-testid="global-search" placeholder="Search invoices, contacts…" style={{ width: '210px', height: '26px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', color: '#1f2933' }} />
        <span style={{ fontSize: '11px', color: '#6b7a89', border: '1px solid #dfe5eb', borderRadius: '3px', padding: '2px 6px' }}>Business plan</span>
        <button className="lg-btn" data-testid="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 6px 0 2px', background: 'transparent', border: '1px solid transparent', borderRadius: '3px', font: 'inherit', fontSize: '12px', color: '#1f2933', cursor: 'pointer' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#dce6ee', color: '#1a6091', fontSize: '10px', fontWeight: 600 }}>{props.user.name.split(' ').map((p) => p[0]).join('')}</span>{props.user.name} <span style={{ color: '#8795a3' }}>▾</span></button>
        <form method="post" action="/api/logout"><button className="lg-btn" data-testid="sign-out" type="submit" style={{ height: '26px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Sign out</button></form>
      </div>

      <div className="lg-shell" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div className="lg-side" style={{ width: '186px', flex: 'none', background: '#eef1f4', borderRight: '1px solid #d8dee6', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
          <div className="lg-sidehide" style={{ padding: '0 10px 6px', fontSize: '10px', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#8795a3' }}>Bookkeeping</div>
          {nav.map((item, i) => (
            <button key={item.testid} className="lg-nav" data-testid={item.testid} onClick={item.go} style={item.style}>{item.label}</button>
          ))}
          <div className="lg-sidehide" style={{ flex: 1 }}></div>
          <div className="lg-sidehide" style={{ padding: '8px 10px', borderTop: '1px solid #dfe4e9', fontSize: '11px', color: '#8795a3', lineHeight: '1.4' }}>VAT period<br /><span style={{ color: '#4c5a68' }}>Q3 2026 · due 31 Oct</span></div>
        </div>

        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>

          {showInvoices && (
            <div style={{ padding: '16px 20px 24px' }} data-testid="screen-invoices">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>Invoices</h1>
                  <div style={{ color: '#6b7a89', fontSize: '12px', marginTop: '2px' }}>{invoiceCountLabel}</div>
                </div>
                <div style={{ flex: 1 }}></div>
                <button className="lg-btn" data-testid="invoice-export" style={{ height: '28px', padding: '0 12px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Export</button>
                <button className="lg-btn" data-testid="invoice-new" style={{ height: '28px', padding: '0 12px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>New invoice</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: '#8795a3', marginRight: '2px' }}>Status</span>
                {filters.map((f) => (
                  <button key={f.testid} className="lg-btn" data-testid={f.testid} onClick={f.go} style={f.style}>{f.label}</button>
                ))}
                <div style={{ width: '1px', height: '18px', background: '#d8dee6', margin: '0 4px' }}></div>
                <button className="lg-btn" data-testid="filter-period" style={{ height: '24px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '11.5px', color: '#4c5a68', cursor: 'pointer' }}>Jul–Sep 2026 ▾</button>
                <button className="lg-btn" data-testid="filter-customer" style={{ height: '24px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '11.5px', color: '#4c5a68', cursor: 'pointer' }}>All customers ▾</button>
              </div>

              <div style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', overflow: 'hidden', overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px minmax(150px,1fr) 82px 82px 104px 124px', minWidth: '680px', gap: 0, padding: '0 12px', height: '30px', alignItems: 'center', background: '#f7f9fb', borderBottom: '1px solid #d8dee6', fontSize: '11px', fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase', color: '#6b7a89' }}>
                  <div>Number</div><div>Customer</div><div>Issued</div><div>Due</div><div style={{ textAlign: 'right' }}>Total incl. BTW</div><div style={{ paddingLeft: '14px' }}>Status</div>
                </div>
                {rows.map((r) => (
                  <div key={r.testid} className="lg-row" data-testid={r.testid} onClick={r.open} style={{ display: 'grid', gridTemplateColumns: '110px minmax(150px,1fr) 82px 82px 104px 124px', minWidth: '680px', padding: '0 12px', height: '34px', alignItems: 'center', borderBottom: '1px solid #edf1f4', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ color: '#1a6091', fontWeight: 600 }}>{r.number}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }}>{r.customer}</div>
                    <div style={{ color: '#5b6b7a', fontSize: '12px' }}>{r.issued}</div>
                    <div style={{ color: '#5b6b7a', fontSize: '12px' }}>{r.due}</div>
                    <div style={{ textAlign: 'right' }}>{r.total}</div>
                    <div style={{ paddingLeft: '14px' }}><span style={r.chipStyle}>{r.status}</span></div>
                  </div>
                ))}
                {noRows && (
                  <div data-testid="invoices-empty" style={{ padding: '26px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#1f2933' }}>No invoices with this status</div>
                    <div style={{ fontSize: '12px', color: '#6b7a89', marginTop: '3px' }}>{emptyHint}</div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 12px', background: '#fafbfc', fontSize: '11.5px', color: '#6b7a89' }}>
                  <span>{pagerLabel}</span><div style={{ flex: 1 }}></div>
                  <button className="lg-btn" data-testid="pager-prev" style={{ height: '22px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '11px', color: '#8795a3', cursor: 'pointer' }}>Previous</button>
                  <button className="lg-btn" data-testid="pager-next" style={{ height: '22px', padding: '0 8px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '11px', cursor: 'pointer' }}>Next</button>
                </div>
              </div>
            </div>
          )}

          {showInvoice && (
            <div style={{ padding: '16px 20px 28px' }} data-testid="screen-invoice-detail">
              <div style={{ fontSize: '11.5px', color: '#8795a3', marginBottom: '6px' }}>Invoices / <span style={{ color: '#4c5a68' }}>{cur.number}</span></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <h1 data-testid="invoice-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>{cur.number} <span data-testid="invoice-status-chip" style={headChipStyle}>{headStatus}</span></h1>
                  <div style={{ color: '#6b7a89', fontSize: '12px', marginTop: '3px' }}>{cur.customer} · issued {cur.issued} · due {cur.due}</div>
                </div>
                <div style={{ flex: 1 }}></div>
                <button className="lg-btn" data-testid="invoice-send-reminder" style={{ height: '28px', padding: '0 12px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Send reminder</button>
                <button className="lg-btn" data-testid="invoice-credit-note" style={{ height: '28px', padding: '0 12px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Credit note</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(260px,1fr)', gap: '16px', alignItems: 'start' }}>
                <div style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px,1fr) 60px 74px 92px', padding: '0 12px', height: '28px', alignItems: 'center', background: '#f7f9fb', borderBottom: '1px solid #d8dee6', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em', color: '#6b7a89' }}>
                    <div>Description</div><div style={{ textAlign: 'right' }}>Qty</div><div style={{ textAlign: 'right' }}>BTW</div><div style={{ textAlign: 'right' }}>Amount</div>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px,1fr) 60px 74px 92px', padding: '8px 12px', alignItems: 'center', borderBottom: '1px solid #edf1f4', fontVariantNumeric: 'tabular-nums' }}>
                      <div style={{ paddingRight: '10px' }}>{l.desc}</div>
                      <div style={{ textAlign: 'right', color: '#5b6b7a' }}>{l.qty}</div>
                      <div style={{ textAlign: 'right', color: '#5b6b7a' }}>{l.vat}</div>
                      <div style={{ textAlign: 'right' }}>{l.amount}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5b6b7a' }}><span>Subtotal</span><span>{eur(Math.round(cur.totalCents / 1.21) / 100)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5b6b7a' }}><span>BTW 21%</span><span>{eur((cur.totalCents - Math.round(cur.totalCents / 1.21)) / 100)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '14px', paddingTop: '5px', borderTop: '1px solid #e4e9ee' }}><span>Total</span><span>{cur.total}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div data-testid="payment-section" style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: '#6b7a89', marginBottom: '9px' }}>Payment</div>

                    {cur.status !== "Paid" && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}><span style={{ color: '#5b6b7a' }}>Amount due</span><span style={{ fontWeight: 600 }}>€ 2 812,50</span></div>
                        <div style={{ color: '#6b7a89', fontSize: '12px', marginBottom: '10px' }}>{cur.status === "Overdue" ? "Past the due date. No payments recorded." : "Due " + cur.due + ". No payments recorded."}</div>
                        <button className="lg-btn" data-testid="mark-as-paid" disabled={!props.user.canWrite} onClick={openPay} style={{ width: '100%', height: '30px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Mark as paid</button>
                      </div>
                    )}

                  </div>

                  <div style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', padding: '12px', fontSize: '12px', color: '#5b6b7a', lineHeight: '1.5' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: '#6b7a89', marginBottom: '8px' }}>Customer</div>
                    {cur.customer}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRecon && (
            <div style={{ padding: '16px 20px 24px' }} data-testid="screen-reconciliation">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>Reconciliation</h1>
                  <div style={{ color: '#6b7a89', fontSize: '12px', marginTop: '2px' }}>ING Business · NL91 INGB 0002 4455 88 · synced 08:12 today</div>
                </div>
                <div style={{ flex: 1 }}></div>
                <button className="lg-btn" data-testid="matching-rules" style={{ height: '28px', padding: '0 12px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Matching rules</button>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: '24px', padding: '0 9px', borderRadius: '3px', background: '#fff5e4', border: '1px solid #ecd5a6', color: '#8a5a12', fontSize: '11.5px', fontWeight: 600 }}>3 exceptions</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: '24px', padding: '0 9px', borderRadius: '3px', background: '#fff', border: '1px solid #d8dee6', color: '#4c5a68', fontSize: '11.5px' }}>62 matched this month</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(250px,1fr)', gap: '16px', alignItems: 'start' }}>
                <div style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', overflow: 'hidden', overflowX: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px minmax(150px,1fr) 96px 132px', minWidth: '460px', padding: '0 12px', height: '28px', alignItems: 'center', background: '#f7f9fb', borderBottom: '1px solid #d8dee6', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em', color: '#6b7a89' }}>
                    <div>Date</div><div>Counterparty</div><div style={{ textAlign: 'right' }}>Amount</div><div style={{ paddingLeft: '12px' }}>Match</div>
                  </div>
                  {txns.map((t) => (
                    <div key={t.testid} className="lg-row" data-testid={t.testid} onClick={t.select} style={t.rowStyle}>
                      <div style={{ color: '#5b6b7a', fontSize: '12px' }}>{t.date}</div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }}>{t.party}<div style={{ fontSize: '11px', color: '#8795a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.ref}</div></div>
                      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{t.amount}</div>
                      <div style={{ paddingLeft: '12px' }}><span style={t.chipStyle}>{t.match}</span></div>
                    </div>
                  ))}
                </div>

                <div data-testid="match-panel" style={{ background: '#fff', border: '1px solid #d8dee6', borderTop: '2px solid #c88a1e', borderRadius: '3px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: '#8a5a12', marginBottom: '8px' }}>Exception · partial match</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>€ 1 250,00 from Bakkerij De Korenhalm B.V.</div>
                  <p style={{ margin: '5px 0 10px', color: '#5b6b7a', fontSize: '12px', lineHeight: '1.5' }}>{exceptionCopy}</p>
                  <div style={{ border: '1px solid #e4e9ee', borderRadius: '3px', padding: '8px 9px', fontSize: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#1a6091', fontWeight: 600 }}>INV-2026-0412</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>€ 2 812,50</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7a89', marginTop: '2px' }}><span>Covers 44%</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>shortfall € 1 562,50</span></div>
                  </div>
                  <button className="lg-btn" data-testid={matchActionTestid} style={{ width: '100%', height: '30px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>{matchActionLabel}</button>
                  <button className="lg-btn" data-testid="match-leave-unmatched" style={{ width: '100%', height: '28px', marginTop: '6px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Leave unmatched</button>
                </div>
              </div>
            </div>
          )}

          {showReports && (
            <div style={{ padding: '16px 20px 24px' }} data-testid="screen-reports">
              <h1 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>Reports</h1>
              <div style={{ color: '#6b7a89', fontSize: '12px', marginBottom: '14px' }}>Financial year 2026 · accrual basis</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(232px,1fr))', gap: '12px' }}>
                <div data-testid="report-vat" style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: '13px', fontWeight: 600 }}>VAT return (BTW)</span><span style={{ fontSize: '11px', color: '#8a5a12', background: '#fff5e4', border: '1px solid #ecd5a6', borderRadius: '3px', padding: '1px 6px' }}>Open</span></div>
                  <div style={{ color: '#6b7a89', fontSize: '12px', margin: '3px 0 9px' }}>Q3 2026 · 1 Jul – 30 Sep · due 31 Oct</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontVariantNumeric: 'tabular-nums', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>BTW charged (21%)</span><span>€ 9 442,18</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>BTW charged (9%)</span><span>€ 612,40</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>Input BTW deductible</span><span>− € 3 118,07</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, paddingTop: '4px', borderTop: '1px solid #e4e9ee' }}><span>Payable</span><span>€ 6 936,51</span></div>
                  </div>
                  <button className="lg-btn" data-testid="vat-review" style={{ width: '100%', height: '28px', marginTop: '10px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Review return</button>
                </div>
                <div data-testid="report-pl" style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', padding: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Profit &amp; loss</span>
                  <div style={{ color: '#6b7a89', fontSize: '12px', margin: '3px 0 9px' }}>Year to date</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontVariantNumeric: 'tabular-nums', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>Revenue</span><span>€ 214 880,00</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>Costs</span><span>− € 151 204,60</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, paddingTop: '4px', borderTop: '1px solid #e4e9ee' }}><span>Result</span><span>€ 63 675,40</span></div>
                  </div>
                  <button className="lg-btn" data-testid="pl-open" style={{ width: '100%', height: '28px', marginTop: '10px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Open report</button>
                </div>
                <div data-testid="report-ar" style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', padding: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Aged receivables</span>
                  <div style={{ color: '#6b7a89', fontSize: '12px', margin: '3px 0 9px' }}>As at 13 Sep 2026</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontVariantNumeric: 'tabular-nums', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>Not yet due</span><span>€ 28 410,00</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>1–30 days</span><span>€ 9 122,50</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>31–60 days</span><span>€ 3 940,00</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5b6b7a' }}>60+ days</span><span>€ 1 205,00</span></div>
                  </div>
                  <button className="lg-btn" data-testid="ar-open" style={{ width: '100%', height: '28px', marginTop: '10px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Open report</button>
                </div>
              </div>
            </div>
          )}

          {showEmpty && (
            <div style={{ padding: '16px 20px' }} data-testid="screen-contacts">
              <h1 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>Suppliers</h1>
              <div style={{ color: '#6b7a89', fontSize: '12px', marginBottom: '14px' }}>Contacts / Suppliers</div>
              <div data-testid="state-empty" style={{ background: '#fff', border: '1px dashed #cdd6de', borderRadius: '3px', padding: '34px 20px', textAlign: 'center', maxWidth: '520px' }}>
                <div style={{ width: '34px', height: '34px', margin: '0 auto 10px', border: '1px solid #d8dee6', borderRadius: '3px' }}></div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>No suppliers yet</div>
                <p style={{ margin: '5px auto 12px', maxWidth: '330px', color: '#6b7a89', fontSize: '12px', lineHeight: '1.5' }}>Suppliers appear here once you add them or import a purchase invoice. Customers are unaffected.</p>
                <button className="lg-btn" data-testid="supplier-add" style={{ height: '28px', padding: '0 12px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add supplier</button>
              </div>
            </div>
          )}

          {showShallow && (
            <div style={{ padding: '16px 20px' }} data-testid="screen-shallow">
              <h1 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.2px' }}>{shallow.title}</h1>
              <div style={{ color: '#6b7a89', fontSize: '12px', marginBottom: '14px' }}>{shallow.sub}</div>
              <div style={{ background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', overflow: 'hidden', overflowX: 'auto', maxWidth: '760px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '92px minmax(150px,1fr) 104px 96px', minWidth: '460px', padding: '0 12px', height: '28px', alignItems: 'center', background: '#f7f9fb', borderBottom: '1px solid #d8dee6', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em', color: '#6b7a89' }}>
                  <div>Date</div><div>{shallow.col}</div><div style={{ textAlign: 'right' }}>Amount</div><div style={{ paddingLeft: '12px' }}>Method</div>
                </div>
                {shallow.rows.map((s, i) => (
                  <div key={i} className="lg-row" style={{ display: 'grid', gridTemplateColumns: '92px minmax(150px,1fr) 104px 96px', minWidth: '460px', padding: '0 12px', height: '32px', alignItems: 'center', borderBottom: '1px solid #edf1f4', fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ color: '#5b6b7a', fontSize: '12px' }}>{s.date}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }}>{s.name}</div>
                    <div style={{ textAlign: 'right' }}>{s.amount}</div>
                    <div style={{ paddingLeft: '12px', color: '#5b6b7a', fontSize: '12px' }}>{s.method}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {effectivePayOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,51,.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div data-testid="record-payment-dialog" style={{ width: '380px', maxWidth: '100%', background: '#fff', border: '1px solid #c6cfd8', borderRadius: '4px', boxShadow: '0 8px 28px rgba(31,41,51,.22)', fontFamily: "'Source Sans 3',system-ui,sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid #e4e9ee' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{payTitle}</span>
              <button className="lg-btn" data-testid="dialog-close" onClick={closePay} style={{ width: '22px', height: '22px', background: 'transparent', border: '1px solid transparent', borderRadius: '3px', color: '#6b7a89', font: 'inherit', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <div style={{ fontSize: '12px', color: '#5b6b7a' }}>{cur.number} · {cur.customer} · total {cur.total}</div>
              {payError && <div data-testid="pay-error" role="alert" style={{ background: '#fdeceb', border: '1px solid #f0cdc9', borderRadius: '3px', padding: '7px 9px', fontSize: '12px', color: '#a32b25' }}>{payError}</div>}
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: '#6b7a89', marginBottom: '4px' }}>Amount received</span>
                <input data-testid="pay-amount-input" value={payAmount} readOnly style={{ width: '100%', height: '30px', padding: '0 8px', boxSizing: 'border-box', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontVariantNumeric: 'tabular-nums' }} />
              </label>
              <div style={{ display: 'flex', gap: '9px' }}>
                <label style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: '#6b7a89', marginBottom: '4px' }}>Date</span>
                  <input data-testid="pay-date-input" defaultValue={new Date().toLocaleDateString("nl-NL").replace(/\//g, "-")} style={{ width: '100%', height: '30px', padding: '0 8px', boxSizing: 'border-box', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit' }} />
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: '#6b7a89', marginBottom: '4px' }}>Method</span>
                  <select data-testid="pay-method-select" style={{ width: '100%', height: '30px', padding: '0 6px', boxSizing: 'border-box', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', background: '#fff' }}><option>SEPA bank transfer</option><option>iDEAL</option><option>Cash</option></select>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '11px 14px', background: '#fafbfc', borderTop: '1px solid #e4e9ee' }}>
              <button className="lg-btn" data-testid="pay-cancel" onClick={closePay} style={{ height: '29px', padding: '0 12px', background: '#fff', border: '1px solid #d8dee6', borderRadius: '3px', font: 'inherit', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              <button className="lg-btn" data-testid="pay-confirm" onClick={confirmPay} style={{ height: '29px', padding: '0 14px', background: '#1a6091', border: '1px solid #1a6091', borderRadius: '3px', color: '#fff', font: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{payConfirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ledgerline;
