import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promotions";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = await enforceRateLimit(req, "promo-validate", {
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (rateLimitError) return rateLimitError;

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const rawBody = await req.text();
    if (rawBody.length > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const { promoCode, subtotal } = JSON.parse(rawBody);

    if (!promoCode || typeof promoCode !== "string" || promoCode.trim().length > 100) {
      return NextResponse.json(
        { valid: false, error: "Code promo manquant." },
        { status: 400 }
      );
    }

    const numericSubtotal = Number(subtotal);
    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0 || numericSubtotal > 1_000_000) {
      return NextResponse.json(
        { valid: false, error: "Sous-total invalide." },
        { status: 400 }
      );
    }

    const result = await validatePromoCode({
      promoCode,
      subtotal: numericSubtotal,
    });

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.message || "Code promo invalide." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.code,
      discountAmount: result.discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: error?.message || "Erreur lors de la validation du code promo.",
      },
      { status: 500 }
    );
  }
}
