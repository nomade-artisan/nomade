// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth !== `Basic ${btoa(`admin:${process.env.ADMIN_PASSWORD || "nomade2024"}`)}`) {
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
  matcher: "/admin/:path*",
};