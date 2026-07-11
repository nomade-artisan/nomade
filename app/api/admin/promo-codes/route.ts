import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

type DiscountType = "fixed" | "percent";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code = normalizeCode(String(body.code || ""));
    const discountType = String(body.discount_type || "") as DiscountType;
    const discountValue = Number(body.discount_value);
    const minSubtotal = Number(body.min_subtotal ?? 0);
    const isActive = body.is_active !== false;
    const startsAt = toNullableDate(body.starts_at);
    const endsAt = toNullableDate(body.ends_at);
    const maxUses = toNullableNumber(body.max_uses);
    const stripePromotionCodeId =
      body.stripe_promotion_code_id && String(body.stripe_promotion_code_id).trim()
        ? String(body.stripe_promotion_code_id).trim()
        : null;

    if (!code) {
      return NextResponse.json({ error: "Code promo requis." }, { status: 400 });
    }

    if (!["fixed", "percent"].includes(discountType)) {
      return NextResponse.json(
        { error: "Type de remise invalide." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { error: "Valeur de remise invalide." },
        { status: 400 }
      );
    }

    if (discountType === "percent" && discountValue > 100) {
      return NextResponse.json(
        { error: "Une remise en pourcentage doit etre <= 100." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
      return NextResponse.json(
        { error: "Sous-total minimum invalide." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .insert({
        code,
        discount_type: discountType,
        discount_value: discountValue,
        min_subtotal: minSubtotal,
        stripe_promotion_code_id: stripePromotionCodeId,
        is_active: isActive,
        starts_at: startsAt,
        ends_at: endsAt,
        max_uses: maxUses,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/admin/promo-codes");
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erreur creation code promo." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.code !== undefined) {
      const code = normalizeCode(String(body.code));
      if (!code) {
        return NextResponse.json({ error: "Code promo requis." }, { status: 400 });
      }
      updateData.code = code;
    }

    if (body.discount_type !== undefined) {
      const discountType = String(body.discount_type);
      if (!["fixed", "percent"].includes(discountType)) {
        return NextResponse.json(
          { error: "Type de remise invalide." },
          { status: 400 }
        );
      }
      updateData.discount_type = discountType;
    }

    if (body.discount_value !== undefined) {
      const discountValue = Number(body.discount_value);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return NextResponse.json(
          { error: "Valeur de remise invalide." },
          { status: 400 }
        );
      }
      updateData.discount_value = discountValue;
    }

    if (body.min_subtotal !== undefined) {
      const minSubtotal = Number(body.min_subtotal);
      if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
        return NextResponse.json(
          { error: "Sous-total minimum invalide." },
          { status: 400 }
        );
      }
      updateData.min_subtotal = minSubtotal;
    }

    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active);
    }

    if (body.starts_at !== undefined) {
      const startsAt = toNullableDate(body.starts_at);
      if (body.starts_at && !startsAt) {
        return NextResponse.json(
          { error: "Date de debut invalide." },
          { status: 400 }
        );
      }
      updateData.starts_at = startsAt;
    }

    if (body.ends_at !== undefined) {
      const endsAt = toNullableDate(body.ends_at);
      if (body.ends_at && !endsAt) {
        return NextResponse.json(
          { error: "Date de fin invalide." },
          { status: 400 }
        );
      }
      updateData.ends_at = endsAt;
    }

    if (body.max_uses !== undefined) {
      const maxUses = toNullableNumber(body.max_uses);
      if (body.max_uses !== null && body.max_uses !== "" && maxUses === null) {
        return NextResponse.json(
          { error: "Maximum d'utilisations invalide." },
          { status: 400 }
        );
      }
      updateData.max_uses = maxUses;
    }

    if (body.stripe_promotion_code_id !== undefined) {
      updateData.stripe_promotion_code_id =
        body.stripe_promotion_code_id &&
        String(body.stripe_promotion_code_id).trim()
          ? String(body.stripe_promotion_code_id).trim()
          : null;
    }

    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/admin/promo-codes");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erreur mise a jour code promo." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("promo_codes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/admin/promo-codes");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erreur suppression code promo." },
      { status: 500 }
    );
  }
}
