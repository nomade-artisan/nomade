import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { sendOrderRefundedEmail } from "@/lib/email/order-refunded";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "refund", {
    windowMs: 60_000,
    maxRequests: 10,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(req);
  if (authError) return authError;

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const paymentIntentId = order.payment_intent_id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Aucun Payment Intent trouvé pour cette commande" },
        { status: 400 }
      );
    }

    let refundId = order.stripe_refund_id as string | null;
    if (!refundId) {
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntentId },
        { idempotencyKey: `nomade-refund-${order.id}` }
      );
      refundId = refund.id;

      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          stripe_refund_id: refundId,
          refunded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) throw updateError;
    }

    const shippingAddress = order.shipping_address || {};
    const customerEmail =
      order.customer_email || shippingAddress.email || null;
    const customerName =
      order.customer_name ||
      `${shippingAddress.firstName || shippingAddress.first_name || ""} ${
        shippingAddress.lastName || shippingAddress.last_name || ""
      }`.trim() ||
      "Client";

    if (customerEmail) {
      await sendOrderRefundedEmail({
        to: customerEmail,
        customerName,
        orderNumber: order.order_number || String(order.id).slice(0, 8),
        total: Number(order.total || 0),
      });
    }

    return NextResponse.json({ success: true, refundId });

  } catch (error: unknown) {
    console.error("Erreur refund:", error);
    return NextResponse.json({ error: "Erreur lors du remboursement" }, { status: 500 });
  }
}
