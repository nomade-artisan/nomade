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
    if (typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json({ error: "Identifiant de commande invalide" }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, customer:customers(email, first_name, last_name), order_lines:order_items(*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    const address = order.shipping_address || {};
    const recipient = address.email || order.customer?.email;
    if (!recipient) {
      return NextResponse.json({ error: "Adresse email client introuvable" }, { status: 422 });
    }

    const items = (order.order_lines || []).map((item: any) => ({
      name: item.product_name || "Produit",
      quantity: Number(item.quantity) || 1,
      price: Number(item.product_price) || 0,
    }));
    if (items.length === 0) {
      return NextResponse.json({ error: "Articles de la commande introuvables" }, { status: 422 });
    }

    const result = await sendOrderConfirmedEmail({
      to: recipient,
      customerName:
        `${address.firstName || order.customer?.first_name || ""} ${
          address.lastName || order.customer?.last_name || ""
        }`.trim() || "Client",
      orderNumber: order.order_number,
      items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discountAmount: Number(order.discount_amount) || 0,
      total: order.total,
      invoicePdfUrl: order.invoice_pdf_url,
      idempotencyKey: `admin-resend-order-confirmed:${order.id}`,
    });
    if (result.error) {
      console.error("Resend a refusé la relance de confirmation", {
        orderId: order.id,
        code: result.error.name,
        statusCode: result.error.statusCode,
        message: result.error.message,
      });
      return NextResponse.json(
        { error: "Le fournisseur email a refusé l'envoi", code: result.error.name },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, id: result.data.id });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
