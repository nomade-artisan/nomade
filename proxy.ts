import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/security/admin-auth";

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const forwardedProto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1") || host.startsWith("::1");

  if (!isLocalHost && forwardedProto !== "https") {
    return new NextResponse("HTTPS requis", { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return new NextResponse("ADMIN_PASSWORD non configuré", {
      status: 503,
    });
  }

  if (!isAdminAuthorized(req)) {
    return new NextResponse("Accès refusé", {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic",
      },
    });
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