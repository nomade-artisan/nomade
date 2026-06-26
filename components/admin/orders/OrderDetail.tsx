"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, Truck, Package, CheckCircle, XCircle, Undo2 } from "lucide-react";
import type { OrderWithRelations, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders/types";

interface Props {
  order: OrderWithRelations;
}

const NEXT_STATUS: Record<OrderStatus, { status: OrderStatus; label: string; icon: any } | null> = {
  pending: { status: "confirmed", label: "Confirmer", icon: CheckCircle },
  confirmed: { status: "shipped", label: "Expédier", icon: Truck },
  shipped: { status: "delivered", label: "Livrer", icon: Package },
  delivered: null,
  cancelled: { status: "pending", label: "Réactiver", icon: Undo2 },
  returned: { status: "pending", label: "Réactiver", icon: Undo2 },
};

export default function OrderDetail({ order }: Props) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  async function handleStatusChange(newStatus: OrderStatus) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) throw new Error("Erreur");

      setComment("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/orders?id=${order.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur");

      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const nextAction = NEXT_STATUS[order.status];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Colonne principale */}
      <div className="lg:col-span-2 space-y-6">
        {/* Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 text-sm">Produit</th>
                  <th className="text-left p-4 text-sm">Prix</th>
                  <th className="text-left p-4 text-sm">Qté</th>
                  <th className="text-right p-4 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 text-sm">{item.product_name}</td>
                    <td className="p-4 text-sm">{item.product_price.toFixed(2)} €</td>
                    <td className="p-4 text-sm">{item.quantity}</td>
                    <td className="p-4 text-sm text-right font-medium">
                      {item.total.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Suivi */}
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.tracking.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun événement</p>
              ) : (
                order.tracking.map((track) => (
                  <div key={track.id} className="flex gap-4 items-start border-l-2 border-muted pl-4">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[track.status as OrderStatus]}`}>
                        {ORDER_STATUS_LABELS[track.status as OrderStatus]}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(track.created_at).toLocaleString("fr-FR")}
                      </p>
                      {track.comment && (
                        <p className="text-sm mt-1">{track.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Statut + actions */}
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <span className={`text-sm px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>

            {/* Bouton action principale */}
            {nextAction && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange(nextAction.status)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <nextAction.icon className="mr-2 h-4 w-4" />
                )}
                {nextAction.label}
              </Button>
            )}

            {/* Bouton annuler */}
            {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "returned" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusChange("cancelled")}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            )}

            {/* Commentaire */}
            <Textarea
              placeholder="Commentaire (optionnel)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />

            {/* Supprimer */}
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Résumé */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{order.shipping.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-medium text-base border-t pt-2">
              <span>Total</span>
              <span>{order.total.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            {order.customer ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {order.customer.first_name} {order.customer.last_name}
                </p>
                <p className="text-muted-foreground">{order.customer.email}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Client invité</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}