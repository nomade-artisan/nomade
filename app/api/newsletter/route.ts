import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "newsletter", {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const rawBody = await req.text();
    if (rawBody.length > 4096) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const { email: rawEmail } = JSON.parse(rawBody);
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
      return NextResponse.json({ error: "Newsletter temporairement indisponible" }, { status: 503 });
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
