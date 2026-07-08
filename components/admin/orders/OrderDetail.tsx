"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Printer,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { OrderWithRelations, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders/types";

const CARRIERS: Record<string, string> = {
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

export default function OrderDetail({ order }: { order: OrderWithRelations }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelWithRefund, setCancelWithRefund] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [labelData, setLabelData] = useState<{
    shippingOrderId: string;
    status: string;
    trackingNumber: string;
    trackingUrl: string;
    labelUrl: string;
  } | null>(null);

  const hasLabel = !!(order.shipment?.label_url || labelData?.labelUrl);
  const labelUrl = labelData?.labelUrl ?? order.shipment?.label_url;
  const trackingUrl = labelData?.trackingUrl ?? order.shipment?.tracking_url;
  const trackingNumber = labelData?.trackingNumber ?? order.shipment?.tracking_number;
  const displayCarrier = order.shipment?.carrier
    ? CARRIERS[order.shipment.carrier] ?? order.shipment.carrier
    : null;

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

      if (newStatus === "shipped") {
        await fetch("/api/send-shipping-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
      }

      setComment("");
      router.refresh();
    } catch (err) {
      toast.error("Échec du changement de statut");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleGenerateLabel() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/generate-label`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur inconnue");
      }

      const payload = await res.json();
      setLabelData(payload);
      toast.success("Étiquette générée avec succès");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la génération");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCancelOrder() {
    setIsUpdating(true);
    try {
      if (cancelWithRefund && (order as any).payment_intent_id) {
        const refundRes = await fetch("/api/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (!refundRes.ok) throw new Error("Échec du remboursement");
      }

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
      toast.error("Erreur lors de l'annulation");
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
      toast.error("Erreur lors de la suppression");
      console.error(err);
    }
  }

  const nextAction = NEXT_STATUS[order.status];
  const shippingAddress = order.shipping_address;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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

      <div className="space-y-6">
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

            <Textarea
              placeholder="Commentaire (optionnel)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Expédition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasLabel ? (
              <>
                <div className="text-sm space-y-1">
                  <p>
                    Transporteur : {displayCarrier ?? "Non spécifié"}
                  </p>
                  <p>Tracking : {trackingNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {labelUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Télécharger l&apos;étiquette
                      </a>
                    </Button>
                  )}
                  {trackingUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir le suivi
                      </a>
                    </Button>
                  )}
                  {order.status === "confirmed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateLabel}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Regénérer
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Aucune étiquette générée
                </p>
                {order.status === "confirmed" && (
                  <Button
                    onClick={handleGenerateLabel}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? "Génération en cours..." : "Générer l'étiquette"}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

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