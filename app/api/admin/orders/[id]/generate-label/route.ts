import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";

import { Boxtal } from "@/lib/boxtal";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    // récupérer la commande
    const { data: order, error } = await supabase
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

    const response = await Boxtal.generateLabel(order);

    const shippingOrderId = response?.content?.id;
    const shipmentId = response?.content?.shipmentId;

    if (!shippingOrderId) {
      return NextResponse.json(
        { error: "Impossible de créer la commande d'expédition Boxtal." },
        { status: 500 }
      );
    }

    const { data: existingShipment, error: existingError } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingError) {
      console.error("Erreur lecture shipment existant:", existingError);
    }

    if (existingShipment) {
      await supabase
        .from("shipments")
        .update({
          shipping_order_id: shippingOrderId,
          shipment_id: shipmentId,
          status: response.content.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingShipment.id);
    } else {
      await supabase.from("shipments").insert({
        order_id: order.id,
        shipping_order_id: shippingOrderId,
        shipment_id: shipmentId,
        status: response.content.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(response);

}