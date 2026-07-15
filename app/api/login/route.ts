import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COOKIE, signSession, verifyPassword, type Role } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const { rows } = await db().query("select name, role, password_hash from app_user where email = $1", [email]);
  const u = rows[0];
  if (!u || !verifyPassword(password, u.password_hash)) {
    return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
  }
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(COOKIE, signSession({ email, name: u.name, role: u.role as Role }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
