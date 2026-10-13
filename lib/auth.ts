import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type Role = "Owner" | "Bookkeeper" | "Accountant" | "Viewer";
export type Session = { email: string; name: string; role: Role; exp: number };

export const COOKIE = "ll_session";
const TTL_SECONDS = 60 * 60 * 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return s;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 32).toString("hex");
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");

export function signSession(s: Omit<Session, "exp">): string {
  const body = b64(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS }));
  return body + "." + createHmac("sha256", secret()).update(body).digest("base64url");
}

export function readSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig.length !== expect.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
  return s.exp > Math.floor(Date.now() / 1000) ? s : null;
}

export const canWrite = (r: Role) => r === "Owner" || r === "Bookkeeper";
export const canSee = (r: Role, screen: string) => {
  if (r === "Owner") return true;
  if (r === "Bookkeeper") return screen !== "settings";
  if (r === "Accountant") return screen === "reports" || screen === "invoices" || screen === "invoice";
  return screen !== "settings";
};
// push test for Sabi worker rollout, 9 Oct
