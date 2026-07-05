import { NextRequest, NextResponse } from "next/server";
import { getOrdersList } from "@/lib/orders/queries";
import { updateOrderStatus, deleteOrder } from "@/lib/orders/mutations";

// GET : liste des commandes
export async function GET(request: NextRequest) {
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
  try {
    const body = await request.json();
    const { orderId, status, comment } = body;

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