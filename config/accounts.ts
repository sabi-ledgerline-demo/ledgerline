import type { Role } from "@/lib/auth";

// Test accounts, one per role. Passwords are never stored in the repo:
// the seed script reads them from LEDGERLINE_PASSWORD_<ROLE> or generates them.
export const ACCOUNTS: { key: string; name: string; email: string; role: Role }[] = [
  { key: "OWNER", name: "Nadia Koster", email: "nadia@vandijkzonen.nl", role: "Owner" },
  { key: "BOOKKEEPER", name: "Ruben Aalders", email: "ruben@vandijkzonen.nl", role: "Bookkeeper" },
  { key: "ACCOUNTANT", name: "Marieke Smits", email: "m.smits@smitsaccountants.nl", role: "Accountant" },
  { key: "VIEWER", name: "Joost de Wit", email: "joost@vandijkzonen.nl", role: "Viewer" }
];
