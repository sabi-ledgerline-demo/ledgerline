// Extracted verbatim from ledgerline/Ledgerline.dc.html (lines 388-423).

export const NAV: [string, string, string][] = [
  ["Invoices", "invoices", "nav-invoices"],
  ["Payments", "payments", "nav-payments"],
  ["Reconciliation", "reconciliation", "nav-reconciliation"],
  ["Contacts", "contacts", "nav-contacts"],
  ["Reports", "reports", "nav-reports"],
  ["Settings", "settings", "nav-settings"]
];

export const CUSTOMERS: string[] = [
  "Bakkerij De Korenhalm B.V.", "Van Dijk & Zonen B.V.", "Hoekstra Installatietechniek",
  "De Groene Gracht VOF", "Meubelmakerij Lamberts", "Brouwerij 't Zandpad",
  "Claessens Advies BVBA", "Drukkerij Veldkamp", "Tuincentrum Eikenhorst",
  "Praktijk Verhoeven", "Kaashandel Wouters NV", "Studio Beeldtaal"
];

export const STATUSES: string[] = ["Paid", "Open", "Overdue", "Draft", "Paid", "Open", "Paid", "Credited"];

// Returns a CSS *text* string, same as the original — call sites that bind
// it to a React style prop wrap it with cssToObj(); call sites that append
// more declarations (e.g. chip(status) + ";margin-left:6px") do so exactly
// as the original did, as a string, before the final cssToObj() wrap.
export function chip(status: string): string {
  const map: Record<string, [string, string, string]> = {
    Paid: ["#e7f4ec", "#c3e0cd", "#1f6b3f"],
    Open: ["#eef2f6", "#dde4ec", "#41536b"],
    Overdue: ["#fdeceb", "#f0cdc9", "#a32b25"],
    Draft: ["#f5f6f8", "#e2e6ea", "#6b7a89"],
    Credited: ["#f2f0f8", "#ded9ee", "#544a7a"],
    "Partially paid": ["#fff5e4", "#ecd5a6", "#8a5a12"]
  };
  const c = map[status] || map.Open;
  return "display:inline-flex;align-items:center;height:19px;padding:0 7px;border-radius:3px;font-size:11px;font-weight:600;background:" +
    c[0] + ";border:1px solid " + c[1] + ";color:" + c[2];
}

export function eur(n: number): string {
  const s = n.toFixed(2).replace(".", ",");
  return "€ " + s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
