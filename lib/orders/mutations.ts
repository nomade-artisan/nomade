import { supabase } from "@/lib/db";
import type { OrderStatus } from "./types";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  comment?: string
): Promise<void> {
  // Mettre à jour la commande
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(`Erreur mise à jour: ${error.message}`);

  // Ajouter dans l'historique
  const { error: trackError } = await supabase
    .from("order_tracking")
    .insert({
      order_id: orderId,
      status,
      comment: comment || null,
    });

  if (trackError) throw new Error(`Erreur tracking: ${trackError.message}`);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw new Error(`Erreur suppression: ${error.message}`);
}