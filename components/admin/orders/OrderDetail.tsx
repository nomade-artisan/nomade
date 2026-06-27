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
import { Input } from "@/components/ui/input";
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
import {
  Trash2,
  Loader2,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Undo2,
  MapPin,
} from "lucide-react";
import type { OrderWithRelations, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders/types";

interface Props {
  order: OrderWithRelations;
}

const CARRIERS: Record<string, string> = {
  laposte: "La Poste",
  chronopost: "Chronopost",
  colissimo: "Colissimo",
  mondialrelay: "Mondial Relay",
  ups: "UPS",
  dhl: "DHL",
};

const NEXT_STATUS: Record<
  OrderStatus,
  { status: OrderStatus; label: string; icon: any } | null
> = {
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

  // États pour l'annulation avec remboursement
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelWithRefund, setCancelWithRefund] = useState(true);

  // Champs tracking
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrier, setCarrier] = useState("laposte");
  const [showShippingFields, setShowShippingFields] = useState(false);

  async function handleStatusChange(newStatus: OrderStatus) {
    // Si on passe en "shipped" et que les champs tracking ne sont pas encore saisis,
    // on les affiche d'abord au lieu d'envoyer tout de suite.
    if (newStatus === "shipped" && !showShippingFields) {
      setShowShippingFields(true);
      return;
    }

    setIsUpdating(true);
    try {
      const payload: any = {
        orderId: order.id,
        status: newStatus,
        comment: comment || undefined,
      };

      // Ajouter les infos de tracking si on expédie
      if (newStatus === "shipped") {
        payload.trackingNumber = trackingNumber;
        payload.trackingUrl = trackingUrl;
        payload.carrier = carrier;
      }

      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur");

      // Si on a expédié, envoyer l'email de suivi
      if (newStatus === "shipped") {
        await fetch("/api/send-shipping-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            trackingNumber,
            trackingUrl,
            carrier,
          }),
        });
        setShowShippingFields(false);
      }

      setComment("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  // Nouvelle fonction d'annulation qui gère le remboursement
  async function handleCancelOrder() {
    setIsUpdating(true);
    try {
      // Si on doit rembourser et qu'un payment_intent_id existe
      if (cancelWithRefund && (order as any).payment_intent_id) {
        const refundRes = await fetch("/api/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (!refundRes.ok) throw new Error("Échec du remboursement");
      }

      // Mettre à jour le statut vers "cancelled"
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: "cancelled",
          comment: cancelWithRefund
            ? "Annulée avec remboursement"
            : "Annulée sans remboursement",
        }),
      });

      setShowCancelDialog(false);
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
  const shippingAddress = order.shipping_address;

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
                    <td className="p-4 text-sm">
                      {item.product_price.toFixed(2)} €
                    </td>
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

        {/* Adresse de livraison */}
        {shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.postal_code} {shippingAddress.city}
              </p>
              <p>{shippingAddress.country}</p>
            </CardContent>
          </Card>
        )}

        {/* Suivi */}
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.tracking.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun événement
                </p>
              ) : (
                order.tracking.map((track) => (
                  <div
                    key={track.id}
                    className="flex gap-4 items-start border-l-2 border-muted pl-4"
                  >
                    <div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ORDER_STATUS_COLORS[track.status as OrderStatus]
                        }`}
                      >
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
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                ORDER_STATUS_COLORS[order.status]
              }`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>

            {/* Bouton action principale */}
            {nextAction && !showShippingFields && (
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

            {/* Champs de suivi (apparaissent quand on clique sur Expédier) */}
            {showShippingFields && (
              <div className="space-y-3 pt-2">
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Transporteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CARRIERS).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Numéro de suivi"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <Input
                  placeholder="URL de suivi"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShippingFields(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("shipped")}
                    disabled={isUpdating || !trackingNumber}
                  >
                    Confirmer l'expédition
                  </Button>
                </div>
              </div>
            )}

            {/* Bouton Annuler (avec remboursement intégré) */}
            {order.status !== "cancelled" &&
              order.status !== "delivered" &&
              order.status !== "returned" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCancelDialog(true)}
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

            {/* Dialog d'annulation avec option de remboursement */}
            <AlertDialog
              open={showCancelDialog}
              onOpenChange={setShowCancelDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la commande ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible.
                    {(order as any).payment_intent_id
                      ? " Le client sera remboursé automatiquement."
                      : " Aucun paiement n'est associé, le remboursement n'est pas possible."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {(order as any).payment_intent_id && (
                  <div className="py-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cancelWithRefund}
                        onChange={(e) => setCancelWithRefund(e.target.checked)}
                      />
                      Rembourser le paiement
                    </label>
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>
                    Revenir
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                    className="bg-destructive"
                  >
                    {isUpdating ? "En cours..." : "Confirmer l'annulation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
                  <AlertDialogTitle>
                    Supprimer cette commande ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive"
                  >
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