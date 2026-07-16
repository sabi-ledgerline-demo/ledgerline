import { NextResponse, type NextRequest } from "next/server";

// Edge-safe gate: only checks that a session cookie exists. Pages and API routes verify the signature.
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p === "/login" || p === "/api/login" || p.startsWith("/api/admin/")) return NextResponse.next();
  if (!req.cookies.get("ll_session")) {
    if (p.startsWith("/api/")) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };
