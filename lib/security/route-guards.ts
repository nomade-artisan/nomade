import { NextResponse } from "next/server";

export function blockInProductionUnlessEnabled(flagName: string): NextResponse | null {
  const isProd = process.env.NODE_ENV === "production";
  const isEnabled = process.env[flagName] === "true";

  if (isProd && !isEnabled) {
    // Return 404 to avoid exposing endpoint existence in production.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return null;
}
