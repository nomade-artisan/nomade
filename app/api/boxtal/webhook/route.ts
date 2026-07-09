import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderPreparingEmail } from "@/lib/email/order-preparing";
import { sendOrderShippedEmail } from "@/lib/email/order-shipped";
import { sendOrderInTransitEmail } from "@/lib/email/order-in-transit";
import { sendOrderDeliveredEmail } from "@/lib/email/order-delivered";

function verifySignature(
    body: string,
    signature: string
) {

    const secret = process.env.BOXTAL_WEBHOOK_SECRET!;
    
    const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    return expected === signature;

}

export async function POST(req: NextRequest) {

    console.log("🔥 BOXTAL WEBHOOK RECEIVED");

    const rawBody = await req.text();

    console.log(rawBody);
    const signature = req.headers.get("x-bxt-signature");

    if (!signature) {

        return NextResponse.json(
            { error: "Missing signature" },
            { status: 401 }
        );

    }

    if (!verifySignature(rawBody, signature)) {

        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );

    }

    const payload = JSON.parse(rawBody);

    switch (payload.type) {

        case "DOCUMENT_CREATED":

            await handleDocumentCreated(
                supabaseAdmin,
                payload
            );

            break;

        case "TRACKING_CHANGED":

            await handleTrackingChanged(
                payload
            );

            break;

    }

    return NextResponse.json({
        received: true
    });

}

async function handleDocumentCreated(
    supabase: any,
    payload: any
) {

    const document =
        payload.payload.documents[0];

    await supabase
        .from("shipments")
        .update({

            label_url: document.url,

            updated_at: new Date()

        })
        .eq(
            "shipping_order_id",
            payload.shippingOrderId
        );

}

async function handleTrackingChanged(payload: any) {
  const tracking = payload.payload?.trackings?.[0];

  if (!tracking) {
    console.log("Aucun tracking reçu");
    return;
  }

  console.log("Shipping Order:", payload.shippingOrderId);

  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .eq("shipping_order_id", payload.shippingOrderId)
    .maybeSingle();

  if (shipmentError) {
    console.error(shipmentError);
    return;
  }

  if (!shipment) {
    console.log("Shipment introuvable");
    return;
  }

  const previousStatus = shipment.status;

  const { data, error } = await supabaseAdmin
    .from("shipments")
    .update({
      tracking_number: tracking.trackingNumber,
      tracking_url: tracking.packageTrackingUrl,
      status: tracking.status,
      updated_at: new Date().toISOString(),
    })
    .eq("shipping_order_id", payload.shippingOrderId)
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  console.log("Shipment mis à jour :", data);

  // Rien n'a changé → aucun mail
  if (previousStatus === tracking.status) {
    console.log("Statut inchangé");
    return;
  }

  console.log(
    `Changement de statut : ${previousStatus} -> ${tracking.status}`
  );

  const order = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", shipment.order_id)
    .single();

  if (order.error || !order.data) {
    console.error("Commande introuvable pour envoi email", order.error);
    return;
  }

  const address = order.data.shipping_address;
  const customerName = `${address.firstName} ${address.lastName}`;
  const orderNumber = order.data.order_number;

  try {
    switch (tracking.status) {
      case "ANNOUNCED":
        await sendOrderPreparingEmail({
          to: address.email,
          customerName,
          orderNumber,
        });
        break;
      case "SHIPPED":
        await sendOrderShippedEmail({
          to: address.email,
          customerName,
          orderNumber,
          carrier: shipment.carrier,
          trackingNumber: tracking.trackingNumber,
          trackingUrl: tracking.packageTrackingUrl,
        });
        break;
      case "IN_TRANSIT":
        await sendOrderInTransitEmail({
          to: address.email,
          customerName,
          orderNumber,
          trackingUrl: tracking.packageTrackingUrl,
        });
        break;
      case "DELIVERED":
        await sendOrderDeliveredEmail({
          to: address.email,
          customerName,
          orderNumber,
        });
        break;
    }

    console.log("Email de suivi envoyé pour le statut :", tracking.status);
  } catch (err) {
    console.error("Erreur envoi email de suivi :", err);
  }
}