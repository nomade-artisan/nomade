import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promotions";

export async function POST(req: NextRequest) {
  try {
    const { promoCode, subtotal } = await req.json();

    if (!promoCode || typeof promoCode !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code promo manquant." },
        { status: 400 }
      );
    }

    const numericSubtotal = Number(subtotal);
    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
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
