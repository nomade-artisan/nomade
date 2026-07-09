//app/api/shipping/send-shipping-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { sendShippingEmail } from "@/lib/email/shipping";

const noreplyEmail = process.env.NOREPLY_EMAIL;
const carrierNames: Record<string, string> = {
  laposte: "La Poste",
  chronopost: "Chronopost",
  colissimo: "Colissimo",
  mondialrelay: "Mondial Relay",
  ups: "UPS",
  dhl: "DHL",
};

export async function POST(req: NextRequest) {
  try {
    const { orderId, trackingNumber: requestTrackingNumber, trackingUrl: requestTrackingUrl, carrier: requestCarrier } = await req.json();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    let trackingNumber = requestTrackingNumber;
    let trackingUrl = requestTrackingUrl;
    let carrier = requestCarrier;

    if (!trackingNumber || !trackingUrl || !carrier) {
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select("tracking_number, tracking_url, carrier")
        .eq("order_id", orderId)
        .single();

      if (shipment && !shipmentError) {
        trackingNumber = trackingNumber || shipment.tracking_number;
        trackingUrl = trackingUrl || shipment.tracking_url;
        carrier = carrier || shipment.carrier;
      }
    }

    if (!trackingNumber || !trackingUrl || !carrier) {
      return NextResponse.json(
        { error: "Informations de suivi manquantes" },
        { status: 400 }
      );
    }

    const carrierName = carrierNames[carrier] || carrier;

    await sendShippingEmail({
      to: order.customer_email,
      customerName: order.customer_name || "Client",
      orderNumber: order.order_number || order.id,
      trackingNumber,
      trackingUrl,
      carrier: carrierName,
    });

    await supabase
      .from("orders")
      .update({
        status: "expédiée",
        tracking_number: trackingNumber,
        carrier: carrier,
      })
      .eq("id", orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}