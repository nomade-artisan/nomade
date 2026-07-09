import { NextResponse } from "next/server";

import { supabaseAdmin  } from "@/lib/supabase/admin";

import { BOXTAL } from "@/lib/boxtal/constants";
import { Boxtal } from "@/lib/boxtal";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    // récupérer la commande
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

    let response;
    try {
      response = await Boxtal.generateLabel(order);
    } catch (error: any) {
      console.error("Boxtal generateLabel error:", error?.response?.data || error?.message || error);
      return NextResponse.json(
        {
          error: "Échec de la création du label Boxtal.",
          details: error?.response?.data || error?.message || null,
        },
        { status: 500 }
      );
    }

    const shippingOrderId = response?.content?.id;

    if (!shippingOrderId) {
      return NextResponse.json(
        { error: "Impossible de créer la commande d'expédition Boxtal." },
        { status: 500 }
      );
    }

    const { data: existingShipment, error: existingError } = await supabaseAdmin
      .from("shipments")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingError) {
      console.error("Erreur lecture shipment existant:", existingError);
    }

    if (existingShipment) {
      const { data: updatedShipment, error: updateError } = await supabaseAdmin
        .from("shipments")
        .update({
          shipping_order_id: shippingOrderId,
          status: response.content.status,
          updated_at: new Date().toISOString(),
        })
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
      const { data: insertedShipment, error: insertError } = await supabaseAdmin
        .from("shipments")
        .insert({
          order_id: order.id,
          shipping_order_id: shippingOrderId,
          carrier: "colissimo",
          shipping_offer_code: BOXTAL.DEFAULT_SHIPPING_OFFER,
          label_url: response.content.labelUrl,
          status: response.content.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

    return NextResponse.json(response);

}