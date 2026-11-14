import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderConfirmedEmail } from "@/lib/email/order-confirmed";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "admin-email-confirmed", { windowMs: 60_000, maxRequests: 10 });
  if (rateLimitError) return rateLimitError;
  const authError = requireAdminAuthorization(req);
  if (authError) return authError;

  try {
    const { orderId } = await req.json();

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    const address = order.shipping_address;

    await sendOrderConfirmedEmail({
      to: address.email,
      customerName: `${address.firstName} ${address.lastName}`,
      orderNumber: order.order_number,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        invoicePdfUrl: order.invoice_pdf_url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
