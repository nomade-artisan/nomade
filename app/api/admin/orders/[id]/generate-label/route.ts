// app/api/admin/orders/[id]/generate-label/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BOXTAL } from "@/lib/boxtal/constants";
import { Boxtal } from "@/lib/boxtal";

function normalizeShippingAddress(value: any) {
  const address = value || {};

  return {
    line1: String(address.line1 || address.street || "").trim(),
    city: String(address.city || "").trim(),
    postalCode: String(address.postal_code || address.postalCode || "").trim(),
    country: String(address.country || "FR").trim(),
  };
}

function mapBoxtalValidation(details: any): string[] {
  const groups = details?.errors;
  if (!Array.isArray(groups)) return [];

  const messages: string[] = [];
  for (const group of groups) {
    const parameters = group?.parameters;
    if (!Array.isArray(parameters)) continue;

    for (const parameter of parameters) {
      const field = String(parameter?.field || "").trim();
      const message = String(parameter?.message || "valeur invalide").trim();
      if (!field) continue;
      messages.push(`${field}: ${message}`);
    }
  }

  return messages;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Récupérer la commande
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 }
    );
  }

  if (order.status !== "confirmed") {
    return NextResponse.json(
      { error: "La commande doit être confirmée." },
      { status: 400 }
    );
  }

  const shippingAddress = normalizeShippingAddress(order.shipping_address);
  const missingFields: string[] = [];

  if (!shippingAddress.line1) missingFields.push("line1/street");
  if (!shippingAddress.city) missingFields.push("city");
  if (!shippingAddress.postalCode) missingFields.push("postal_code");

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error:
          "Adresse de livraison incomplète. Complète les informations manquantes avant de générer l'étiquette.",
        details: {
          missingFields,
          address: shippingAddress,
        },
      },
      { status: 422 }
    );
  }

  // 2. Appeler Boxtal pour générer l'étiquette
  let response;
  try {
    response = await Boxtal.generateLabel(order);
  } catch (error: any) {
    const boxtalStatus = error?.response?.status;
    const boxtalDetails = error?.response?.data || null;
    console.log(JSON.stringify(boxtalDetails, null, 2));

    if (boxtalStatus === 422) {
      return NextResponse.json(
        {
          error:
            "Boxtal refuse l'adresse d'expédition. Vérifie rue, ville et code postal.",
          details: {
            validation: mapBoxtalValidation(boxtalDetails),
            boxtal: boxtalDetails,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: "Échec de la création du label Boxtal.",
        details: boxtalDetails || error?.message || null,
      },
      { status: 500 }
    );
  }

  const content = response?.content;
  if (!content) {
    return NextResponse.json(
      { error: "Réponse Boxtal invalide : contenu manquant." },
      { status: 500 }
    );
  }

  const shippingOrderId = content.id;
  if (!shippingOrderId) {
    return NextResponse.json(
      { error: "Impossible de créer la commande d'expédition Boxtal." },
      { status: 500 }
    );
  }

  // 3. Récupérer les informations d'expédition
  const labelUrl = content.labelUrl || null;
  const trackingNumber = content.trackingNumber || null;
  const trackingUrl = content.trackingUrl || null;
  const statusShipment = content.status || "ANNOUNCED";

  // 4. Vérifier si un shipment existe déjà
  const { data: existingShipment, error: existingError } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingError) {
    console.error("Erreur lecture shipment existant:", existingError);
  }

  // 5. Insérer ou mettre à jour le shipment
  const shipmentPayload = {
    order_id: order.id,
    shipping_order_id: shippingOrderId,
    carrier: "colissimo", // ou récupérer dynamiquement si besoin
    shipping_offer_code: BOXTAL.DEFAULT_SHIPPING_OFFER,
    label_url: labelUrl,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    status: statusShipment,
    updated_at: new Date().toISOString(),
  };

  if (existingShipment) {
    const { error: updateError } = await supabaseAdmin
      .from("shipments")
      .update(shipmentPayload)
      .eq("id", existingShipment.id);

    if (updateError) {
      console.error("Erreur mise à jour shipment:", updateError);
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour du shipment.",
          details: updateError,
        },
        { status: 500 }
      );
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("shipments")
      .insert({
        ...shipmentPayload,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Erreur insertion shipment:", insertError);
      return NextResponse.json(
        {
          error: "Erreur lors de la création du shipment.",
          details: insertError,
        },
        { status: 500 }
      );
    }
  }

  // 6. Mettre à jour le statut de la commande en "preparing"
  if (order.status === "confirmed") {
    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "preparing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("Erreur mise à jour statut commande:", updateOrderError);
      // On ne bloque pas la réponse, mais on log l'erreur
    }
  }

  // 7. Ajouter un historique
  const { error: trackingError } = await supabaseAdmin
    .from("order_tracking")
    .insert({
      order_id: order.id,
      status: "preparing",
      comment: "Étiquette générée, en attente de dépôt transporteur",
      created_at: new Date().toISOString(),
    });

  if (trackingError) {
    console.error("Erreur ajout historique :", trackingError);
  }

  // 8. Retourner les données au frontend (pour labelData)
  return NextResponse.json({
    shippingOrderId,
    labelUrl,
    trackingNumber,
    trackingUrl,
    status: statusShipment,
  });
}