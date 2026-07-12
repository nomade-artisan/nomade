import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/security/admin-auth";
import { getAdminSessionSecret } from "@/lib/security/admin-session";

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  if (pathname === "/admin/login") {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin-login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const forwardedProto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1") || host.startsWith("::1");

  if (!isLocalHost && forwardedProto !== "https") {
    return new NextResponse("HTTPS requis", { status: 400 });
  }

  if (!getAdminSessionSecret()) {
    return new NextResponse("ADMIN_SESSION_SECRET ou ADMIN_PASSWORD non configuré", {
      status: 503,
    });
  }

  if (!isAdminAuthorized(req)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin-login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/refund",
    "/api/test-email",
  ],
};