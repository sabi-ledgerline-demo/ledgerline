export type LedgerlineScreen =
  | "invoices"
  | "invoice"
  | "reconciliation"
  | "reports"
  | "settings"
  | "contacts"
  | "payments";

export type LedgerlineProps = {
  screen: LedgerlineScreen;
};
