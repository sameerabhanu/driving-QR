import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SHOP_SESSION_COOKIE,
  SUPER_SESSION_COOKIE,
  readSessionSubject,
} from "@/lib/session";

async function isValid(token: string | undefined, predicate: (subject: string) => boolean) {
  if (!token) return false;
  const subject = await readSessionSubject(token);
  return subject ? predicate(subject) : false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Super admin area
  if (pathname.startsWith("/superadmin")) {
    const token = request.cookies.get(SUPER_SESSION_COOKIE)?.value;
    const authed = await isValid(token, (s) => s === "super");

    if (pathname === "/superadmin/login") {
      return authed
        ? NextResponse.redirect(new URL("/superadmin", request.url))
        : NextResponse.next();
    }
    return authed
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/superadmin/login", request.url));
  }

  // Reseller (shop) area
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SHOP_SESSION_COOKIE)?.value;
    const authed = await isValid(token, (s) => s.startsWith("shop:"));

    if (pathname === "/admin/login") {
      return authed
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.next();
    }
    return authed
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/superadmin", "/superadmin/:path*"],
};
