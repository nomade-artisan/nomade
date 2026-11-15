import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "nomade_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function signSessionExpiry(expiry: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`nomade-admin:v1:${expiry}`)
    .digest("base64url");
}

export function createAdminSessionToken(now = Date.now()): string {
  const secret = getAdminSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET non configurÃ©");

  const expiry = String(Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS);
  return `${expiry}.${signSessionExpiry(expiry, secret)}`;
}

export function isAdminSessionTokenValid(
  token: string | undefined,
  now = Date.now()
): boolean {
  const secret = getAdminSessionSecret();
  if (!secret || !token) return false;

  const [expiry, signature, ...extra] = token.split(".");
  if (extra.length > 0 || !/^\d{10}$/.test(expiry) || !signature) return false;

  const expirySeconds = Number(expiry);
  const nowSeconds = Math.floor(now / 1000);
  if (expirySeconds <= nowSeconds || expirySeconds > nowSeconds + ADMIN_SESSION_MAX_AGE_SECONDS + 60) {
    return false;
  }

  const expected = Buffer.from(signSessionExpiry(expiry, secret));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isAdminSessionValid(request: NextRequest): boolean {
  return isAdminSessionTokenValid(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
