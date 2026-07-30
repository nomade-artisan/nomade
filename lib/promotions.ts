import { supabaseAdmin } from "@/lib/supabase/admin";

interface PromoValidationInput {
  promoCode: string;
  subtotal: number;
}

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message?: string;
  stripePromotionCodeId?: string;
  promoId?: number;
}

interface PromoCodeRow {
  id: number;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_subtotal: number;
  stripe_promotion_code_id: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
}

export async function validatePromoCode({
  promoCode,
  subtotal,
}: PromoValidationInput): Promise<PromoValidationResult> {
  const normalizedCode = promoCode.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "Code promo vide.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select(
      "id, code, discount_type, discount_value, min_subtotal, stripe_promotion_code_id, is_active, starts_at, ends_at, max_uses, used_count"
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Erreur de validation du code promo.",
    };
  }

  const promo = data as PromoCodeRow | null;
  if (!promo) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Code promo invalide.",
    };
  }

  if (!promo.is_active) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Ce code promo est desactive.",
    };
  }

  const now = new Date();
  if (promo.starts_at && new Date(promo.starts_at) > now) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Ce code promo n'est pas encore actif.",
    };
  }

  if (promo.ends_at && new Date(promo.ends_at) < now) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Ce code promo a expire.",
    };
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Ce code promo a atteint sa limite d'utilisation.",
    };
  }

  if (subtotal < promo.min_subtotal) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: `Code valide a partir de ${promo.min_subtotal.toFixed(2)} EUR de sous-total.`,
    };
  }

  const discountAmount =
    promo.discount_type === "percent"
      ? Math.max(0, Math.min((subtotal * promo.discount_value) / 100, subtotal))
      : Math.max(0, Math.min(promo.discount_value, subtotal));

  return {
    valid: true,
    code: normalizedCode,
    discountAmount,
    stripePromotionCodeId: promo.stripe_promotion_code_id || undefined,
    promoId: promo.id,
  };
}
