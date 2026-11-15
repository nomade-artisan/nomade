import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderShippedEmail } from "@/lib/email/order-shipped";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "admin-email-shipped", { windowMs: 60_000, maxRequests: 10 });
  if (rateLimitError) return rateLimitError;
  const authError = requireAdminAuthorization(req);
  if (authError) return authError;

  try {
    const { orderId } = await req.json();

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    const { data: shipment } = await supabaseAdmin
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    const address = order.shipping_address;

    await sendOrderShippedEmail({
      to: address.email,
      customerName: `${address.firstName} ${address.lastName}`,
      orderNumber: order.order_number,
      carrier: shipment.carrier,
      trackingNumber: shipment.tracking_number,
      trackingUrl: shipment.tracking_url,
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
