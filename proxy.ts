import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/security/admin-auth";

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.next();
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