import { NextRequest, NextResponse } from "next/server";
import { getOrdersList } from "@/lib/orders/queries";
import { updateOrderStatus, deleteOrder } from "@/lib/orders/mutations";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Boxtal } from "@/lib/boxtal";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

// GET : liste des commandes
export async function GET(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-orders-get", {
    windowMs: 60_000,
    maxRequests: 120,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getOrdersList(page, pageSize, status, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT : changer le statut
export async function PUT(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-orders-put", {
    windowMs: 60_000,
    maxRequests: 60,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { orderId, status, comment, adminPassword } = body;

    if (status === "cancelled") {
      const configuredPassword = process.env.ADMIN_CANCEL_PASSWORD;

      if (!configuredPassword) {
        return NextResponse.json(
          { error: "ADMIN_CANCEL_PASSWORD non configuré" },
          { status: 500 }
        );
      }

      if (!adminPassword || adminPassword !== configuredPassword) {
        return NextResponse.json(
          { error: "Mot de passe administrateur invalide" },
          { status: 403 }
        );
      }

      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Commande introuvable" },
          { status: 404 }
        );
      }

      const { data: shipment, error: shipmentError } = await supabaseAdmin
        .from("shipments")
        .select("id, shipping_order_id, status")
        .eq("order_id", orderId)
        .maybeSingle();

      if (shipmentError) {
        return NextResponse.json(
          { error: "Erreur de lecture shipment" },
          { status: 500 }
        );
      }

      const shipmentStatus = (shipment?.status || "").toUpperCase();
      const depositedStatuses = new Set(["SHIPPED", "IN_TRANSIT", "DELIVERED"]);

      if (
        order.status === "shipped" ||
        order.status === "delivered" ||
        depositedStatuses.has(shipmentStatus)
      ) {
        return NextResponse.json(
          {
            error:
              "Annulation impossible: le colis est deja depose chez le transporteur. Utilisez le retour.",
          },
          { status: 409 }
        );
      }

      if (shipment?.shipping_order_id) {
        try {
          await Boxtal.cancel(shipment.shipping_order_id);

          await supabaseAdmin
            .from("shipments")
            .update({
              status: "CANCELLED",
              updated_at: new Date().toISOString(),
            })
            .eq("id", shipment.id);
        } catch (boxtalError: any) {
          const boxtalStatus = boxtalError?.response?.status;

          if (boxtalStatus === 400) {
            return NextResponse.json(
              {
                error:
                  "Annulation Boxtal impossible: le transporteur ne permet plus l'annulation de cette expedition.",
              },
              { status: 409 }
            );
          }

          return NextResponse.json(
            {
              error: "Echec de l'annulation Boxtal. Reessayez plus tard.",
            },
            { status: 502 }
          );
        }
      }
    }

    await updateOrderStatus(orderId, status, comment);

    return NextResponse.json({ message: "Statut mis à jour" });
  } catch (error) {
    console.error("PUT order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE : supprimer une commande
export async function DELETE(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-orders-delete", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "id manquant" }, { status: 400 });
    }

    await deleteOrder(orderId);

    return NextResponse.json({ message: "Commande supprimée" });
  } catch (error) {
    console.error("DELETE order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}