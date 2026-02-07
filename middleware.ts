import { NextRequest, NextResponse } from "next/server";

/** Decode JWT payload and return exp (seconds since epoch), or null if invalid/missing. */
function getTokenExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const data = JSON.parse(json) as { exp?: number };
    return typeof data.exp === "number" ? data.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return true;
  return exp * 1000 <= Date.now();
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/restaurants", request.url));
    }
    if (token && isTokenExpired(token)) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.set("token", "", { path: "/", maxAge: 0 });
      return res;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (token && isTokenExpired(token)) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|svg|woff2?)$).*)"],
};
