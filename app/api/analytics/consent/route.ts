import { NextRequest, NextResponse } from "next/server";

const CONSENT_COOKIE = "analytics_consent";
const CONSENT_CHOICES = new Set(["accepted", "essential"]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 1024) {
      return NextResponse.json({ error: "Choix de consentement invalide" }, { status: 400 });
    }
    const rawBody = await request.text();
    if (rawBody.length > 1024) {
      return NextResponse.json({ error: "Choix de consentement invalide" }, { status: 400 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Choix de consentement invalide" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Choix de consentement invalide" }, { status: 400 });
  }

  const consent = (body as Record<string, unknown>).consent;
  if (typeof consent !== "string" || !CONSENT_CHOICES.has(consent)) {
    return NextResponse.json({ error: "Choix de consentement invalide" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: CONSENT_COOKIE,
    value: consent,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
