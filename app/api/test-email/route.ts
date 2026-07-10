import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmedEmail } from "@/lib/email/order-confirmed";
import { sendOrderPreparingEmail } from "@/lib/email/order-preparing";
import { sendOrderShippedEmail } from "@/lib/email/order-shipped";
import { sendOrderInTransitEmail } from "@/lib/email/order-in-transit";
import { sendOrderDeliveredEmail } from "@/lib/email/order-delivered";
import { sendOrderCancelledEmail } from "@/lib/email/order-cancelled";
import { sendOrderRefundedEmail } from "@/lib/email/order-refunded";
import { sendShippingEmail, sendDeliveryEmail } from "@/lib/email/shipping";

type SendResult = {
  step: string;
  id: string | null;
};

function getRecipient(req: NextRequest): string {
  return (
    req.nextUrl.searchParams.get("to") ||
    process.env.TEST_EMAIL_TO ||
    "merveilleskatabisomwe@gmail.com"
  );
}

export async function GET(req: NextRequest) {
  try {
    const to = getRecipient(req);
    const runAll = req.nextUrl.searchParams.get("all") === "1";

    if (!runAll) {
      const result = await sendOrderPreparingEmail({
        to,
        customerName: "Client Test",
        orderNumber: "NOM-TEST-0001",
      });

      return NextResponse.json({
        success: true,
        mode: "single",
        to,
        step: "order-preparing",
        id: result.data?.id ?? null,
        hint: "Ajoute ?all=1 pour envoyer tous les emails dans l'ordre",
      });
    }

    const orderNumber = "NOM-TEST-0001";
    const customerName = "Client Test";
    const trackingUrl = "https://www.laposte.fr/outils/suivre-vos-envois?code=TEST123456789";
    const trackingNumber = "TEST123456789";
    const carrier = "Colissimo";

    const results: SendResult[] = [];

    const confirmed = await sendOrderConfirmedEmail({
      to,
      customerName,
      orderNumber,
      items: [
        { name: "Produit test A", quantity: 1, price: 24.9 },
        { name: "Produit test B", quantity: 2, price: 14.5 },
      ],
      subtotal: 53.9,
      shipping: 4.9,
      total: 58.8,
      invoicePdfUrl: null,
    });
    results.push({ step: "order-confirmed", id: confirmed.data?.id ?? null });

    const preparing = await sendOrderPreparingEmail({
      to,
      customerName,
      orderNumber,
    });
    results.push({ step: "order-preparing", id: preparing.data?.id ?? null });

    const shipped = await sendOrderShippedEmail({
      to,
      customerName,
      orderNumber,
      carrier,
      trackingNumber,
      trackingUrl,
    });
    results.push({ step: "order-shipped", id: shipped.data?.id ?? null });

    const inTransit = await sendOrderInTransitEmail({
      to,
      customerName,
      orderNumber,
      trackingUrl,
    });
    results.push({ step: "order-in-transit", id: inTransit.data?.id ?? null });

    const delivered = await sendOrderDeliveredEmail({
      to,
      customerName,
      orderNumber,
    });
    results.push({ step: "order-delivered", id: delivered.data?.id ?? null });

    const cancelled = await sendOrderCancelledEmail({
      to,
      customerName,
      orderNumber,
    });
    results.push({ step: "order-cancelled", id: cancelled.data?.id ?? null });

    const refunded = await sendOrderRefundedEmail({
      to,
      customerName,
      orderNumber,
      total: 58.8,
    });
    results.push({ step: "order-refunded", id: refunded.data?.id ?? null });

    const shipping = await sendShippingEmail({
      to,
      customerName,
      orderNumber,
      carrier,
      trackingNumber,
      trackingUrl,
    });
    results.push({ step: "shipping-shipped", id: shipping.data?.id ?? null });

    const shippingDelivered = await sendDeliveryEmail({
      to,
      customerName,
      orderNumber,
    });
    results.push({ step: "shipping-delivered", id: shippingDelivered.data?.id ?? null });

    return NextResponse.json({
      success: true,
      mode: "all",
      to,
      count: results.length,
      results,
      usage: "/api/test-email?all=1&to=votre@email.com",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}