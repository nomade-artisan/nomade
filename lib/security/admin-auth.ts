import { NextRequest, NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/security/admin-session";

export function isAdminAuthorized(request: NextRequest): boolean {
  return isAdminSessionValid(request);
}

export function requireAdminAuthorization(
  request: NextRequest
): NextResponse | null {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD non configuré" },
      { status: 503 }
    );
  }

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  return null;
}
