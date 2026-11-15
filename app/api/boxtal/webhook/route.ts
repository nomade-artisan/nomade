import crypto, { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderPreparingEmail } from "@/lib/email/order-preparing";
import { sendOrderShippedEmail } from "@/lib/email/order-shipped";
import { sendOrderInTransitEmail } from "@/lib/email/order-in-transit";
import { sendOrderDeliveredEmail } from "@/lib/email/order-delivered";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.BOXTAL_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest();
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Génère un hash unique pour un événement de suivi
 * On utilise : shippingOrderId + status + trackingNumber + updatedAt (si présent)
 */
function generateTrackingEventHash(payload: any): string {
  const shippingOrderId = payload.shippingOrderId || "";
  const tracking = payload.payload?.trackings?.[0] || {};
  const status = tracking.status || "";
  const trackingNumber = tracking.trackingNumber || "";
  const updatedAt = tracking.updatedAt || tracking.updated_at || "";
  const raw = `${shippingOrderId}|${status}|${trackingNumber}|${updatedAt}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function generateDocumentEventHash(payload: any): string {
  const shippingOrderId = payload.shippingOrderId || "";
  const doc = payload.payload?.documents?.[0] || {};
  const docId = doc.id || doc.documentId || "";
  const raw = `${shippingOrderId}|${docId}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function mapBoxtalStatusToOrderStatus(status?: string): string | null {
  switch (status) {
    case "ANNOUNCED":
      return "preparing";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "shipped";
    case "DELIVERED":
      return "delivered";
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  console.log("🔥 BOXTAL WEBHOOK RECEIVED");

  if (!process.env.BOXTAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configurÃ©" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 262144) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const rawBody = await req.text();
  if (rawBody.length > 262144) {
    return NextResponse.json({ error: "RequÃªte trop volumineuse" }, { status: 413 });
  }
  const signature = req.headers.get("x-bxt-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Déterminer le type et générer un hash
  let eventType = payload.type;
  let eventHash: string;

  if (eventType === "DOCUMENT_CREATED") {
    if (typeof payload.shippingOrderId !== "string" || !payload.shippingOrderId) {
      return NextResponse.json({ error: "Invalid shipping order" }, { status: 400 });
    }
    eventHash = generateDocumentEventHash(payload);
  } else if (eventType === "TRACKING_CHANGED") {
    if (typeof payload.shippingOrderId !== "string" || !payload.shippingOrderId) {
      return NextResponse.json({ error: "Invalid shipping order" }, { status: 400 });
    }
    eventHash = generateTrackingEventHash(payload);
  } else {
    // Autre type non géré, on ignore
    return NextResponse.json({ received: true });
  }

  // Vérifier si cet événement a déjà été traité
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("webhook_events")
    .select("id")
    .eq("event_hash", eventHash)
    .maybeSingle();

  if (lookupError) {
    console.error("Boxtal event lookup failed:", lookupError.message);
    return NextResponse.json({ error: "Webhook temporairement indisponible" }, { status: 500 });
  }

  if (existing) {
    console.log(`🔄 Événement déjà traité (hash: ${eventHash}), ignoré.`);
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  const { error: insertError } = await supabaseAdmin
    .from("webhook_events")
    .insert({
      event_hash: eventHash,
      event_type: eventType,
      shipping_order_id: payload.shippingOrderId || null,
    });

  if (insertError && insertError.code !== "23505") {
    console.error("Boxtal event insert failed:", insertError.message);
    return NextResponse.json({ error: "Webhook temporarily unavailable" }, { status: 500 });
  }

  if (insertError) {
    // Si l'insertion échoue (conflit), on ignore (doublon détecté)
    if (insertError.code === "23505") { // unique violation
      console.log(`🔄 Événement déjà traité (doublon détecté à l'insertion).`);
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }
    console.error("❌ Erreur insertion webhook_events:", insertError);
    // On continue quand même, mais on pourrait renvoyer 500 pour que Boxtal réessaie
  }

  // Traiter l'événement
  try {
    switch (eventType) {
      case "DOCUMENT_CREATED":
        await handleDocumentCreated(payload);
        break;
      case "TRACKING_CHANGED":
        await handleTrackingChanged(payload);
        break;
    }
  } catch (err : any) {
    console.error("❌ Erreur lors du traitement:", err);
    // On renvoie 200 quand même pour éviter les nouvelles tentatives de Boxtal,
    // mais on log l'erreur. On pourrait aussi renvoyer 500 pour réessayer,
    // mais cela créerait des doublons si le problème est intermittent.
    // Ici on choisit de renvoyer 200 et de logger l'erreur.
    // On pourrait aussi supprimer l'entrée webhook_events pour permettre un retraitement ultérieur ? Non, car on ne sait pas si c'est une erreur temporaire.
    const { error: cleanupError } = await supabaseAdmin
      .from("webhook_events")
      .delete()
      .eq("event_hash", eventHash);
    if (cleanupError) console.error("Boxtal event retry cleanup failed:", cleanupError.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleDocumentCreated(payload: any) {
  const document = payload.payload?.documents?.[0];
  if (!document?.url) throw new Error("Boxtal document URL missing");
  const { data, error } = await supabaseAdmin
    .from("shipments")
    .update({
      label_url: document.url,
      updated_at: new Date(),
    })
    .eq("shipping_order_id", payload.shippingOrderId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Shipment not found for Boxtal document");
}

async function handleTrackingChanged(payload: any) {
  const tracking = payload.payload?.trackings?.[0];
  if (!tracking) throw new Error("Boxtal tracking data missing");

  const shippingOrderId = payload.shippingOrderId;
  console.log("Shipping Order:", shippingOrderId);

  // Récupérer le shipment
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .eq("shipping_order_id", shippingOrderId)
    .maybeSingle();

  if (shipmentError || !shipment) {
    throw shipmentError || new Error("Shipment not found");
  }

  const previousStatus = shipment.status;
  const newStatus = tracking.status;
  const trackingNumber =
    tracking.trackingNumber ||
    tracking.number ||
    tracking.tracking_number ||
    null;
  const trackingUrl =
    tracking.packageTrackingUrl ||
    tracking.trackingUrl ||
    tracking.url ||
    tracking.tracking_url ||
    null;

  // Mettre à jour le shipment
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("shipments")
    .update({
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      carrier: shipment.carrier || tracking.carrier || null,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("shipping_order_id", shippingOrderId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  console.log("Shipment mis à jour :", updated);

  // Récupérer la commande associée
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", shipment.order_id)
    .single();

  if (orderError || !order) {
    throw orderError || new Error("Order not found for shipment");
  }

  const mappedOrderStatus = mapBoxtalStatusToOrderStatus(newStatus);
  const shipmentStatusChanged = previousStatus !== newStatus;
  const orderStatusChanged = Boolean(mappedOrderStatus && order.status !== mappedOrderStatus);

  if (mappedOrderStatus && (shipmentStatusChanged || orderStatusChanged)) {
    if (orderStatusChanged) {
      const { error: orderStatusError } = await supabaseAdmin
        .from("orders")
        .update({
          status: mappedOrderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (orderStatusError) {
        throw orderStatusError;
      } else {
        console.log(
          `orders.status mis à jour : ${order.status} -> ${mappedOrderStatus}`
        );
      }
    }

    const { error: trackingInsertError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: order.id,
        status: mappedOrderStatus,
        comment: `Boxtal tracking: ${newStatus}`,
        created_at: new Date().toISOString(),
      });

    if (trackingInsertError) {
      throw trackingInsertError;
    }
  }

  const address = order.shipping_address;
  const customerName = `${address?.firstName || address?.first_name || ""} ${address?.lastName || address?.last_name || ""}`.trim();
  const orderNumber = order.order_number;

  // Si le statut shipment n'a pas changé, on ne réenvoie pas d'email
  if (!shipmentStatusChanged && !orderStatusChanged) {
    console.log("Statut shipment inchangé, pas d'email");
    return;
  }

  console.log(`Changement de statut : ${previousStatus} -> ${newStatus}`);

  // Envoyer l'email correspondant au nouveau statut
  try {
    switch (newStatus) {
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
          trackingNumber,
          trackingUrl,
        });
        break;
      case "IN_TRANSIT":
        await sendOrderInTransitEmail({
          to: address.email,
          customerName,
          orderNumber,
          trackingUrl,
        });
        break;
      case "DELIVERED":
        await sendOrderDeliveredEmail({
          to: address.email,
          customerName,
          orderNumber,
        });
        break;
      default:
        console.log("Statut non géré pour email:", newStatus);
    }
    console.log("Email de suivi envoyé pour le statut:", newStatus);
  } catch (err : any) {
    console.error("Erreur envoi email de suivi:", err);
    // On ne relance pas l'erreur pour ne pas bloquer le webhook
  }
}
