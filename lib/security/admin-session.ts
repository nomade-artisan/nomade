import { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "nomade_admin_session";

export function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function isAdminSessionValid(request: NextRequest): boolean {
  const secret = getAdminSessionSecret();
  if (!secret) return false;

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return cookieValue === secret;
}
