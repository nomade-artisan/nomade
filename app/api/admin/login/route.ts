import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getAdminSessionSecret,
} from "@/lib/security/admin-session";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { createHash, timingSafeEqual } from "node:crypto";

export async function POST(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-login", {
    windowMs: 15 * 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = getAdminSessionSecret();

    if (!adminPassword || !sessionSecret) {
      return NextResponse.json(
        { error: "Configuration admin manquante" },
        { status: 503 }
      );
    }

    const providedPasswordHash = createHash("sha256").update(String(password || "")).digest();
    const configuredPasswordHash = createHash("sha256").update(adminPassword).digest();
    if (!password || !timingSafeEqual(providedPasswordHash, configuredPasswordHash)) {
      return NextResponse.json(
        { error: "Mot de passe invalide" },
        { status: 401 }
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    const sessionToken = createAdminSessionToken();

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Requete invalide" },
      { status: 400 }
    );
  }
}
