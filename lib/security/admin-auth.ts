import { NextRequest, NextResponse } from "next/server";

function encodeBase64(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value).toString("base64");
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return false;
  }

  const auth = request.headers.get("authorization");
  const expected = `Basic ${encodeBase64(`admin:${adminPassword}`)}`;
  return auth === expected;
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
