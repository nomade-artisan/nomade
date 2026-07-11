"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Package,
  XCircle,
  RotateCcw,
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

export default function OrderDetail({ order }: { order: OrderWithRelations }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelWithRefund, setCancelWithRefund] = useState(true);
  const [adminCancelPassword, setAdminCancelPassword] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [labelData, setLabelData] = useState<{
    shippingOrderId: string;
    status: string;
    trackingNumber: string;
    trackingUrl: string;
    labelUrl: string;
  } | null>(null);

  useEffect(() => {
    let ignore = false;

    const syncFromServerShipment = () => {
      setLabelData(
        order.shipment
          ? {
              shippingOrderId: order.shipment.shipping_order_id ?? "",
              status: order.shipment.status ?? "",
              trackingNumber: order.shipment.tracking_number ?? "",
              trackingUrl: order.shipment.tracking_url ?? "",
              labelUrl: order.shipment.label_url ?? "",
            }
          : null
      );
    };

    syncFromServerShipment();

    async function fetchLatestShipment() {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}/shipment`);
        if (!res.ok) return;

        const payload = await res.json();
        const shipment = payload.shipment;

        if (!ignore && shipment) {
          setLabelData({
            shippingOrderId: shipment.shipping_order_id ?? "",
            status: shipment.status ?? "",
            trackingNumber: shipment.tracking_number ?? "",
            trackingUrl: shipment.tracking_url ?? "",
            labelUrl: shipment.label_url ?? "",
          });
        }
      } catch (err) {
        console.error("Erreur rechargement shipment", err);
      }
    }

    fetchLatestShipment();

    return () => {
      ignore = true;
    };
  }, [order.id, order.shipment]);

  const shipment = order.shipment ?? null;
  const hasLabel = !!(shipment?.label_url || labelData?.labelUrl);
  const labelUrl = labelData?.labelUrl ?? shipment?.label_url ?? null;
  const trackingUrl = labelData?.trackingUrl ?? shipment?.tracking_url ?? null;
  const trackingNumber = labelData?.trackingNumber ?? shipment?.tracking_number ?? null;
  const shipmentId = labelData?.shippingOrderId ?? shipment?.shipping_order_id ?? null;
  const shipmentStatus = labelData?.status ?? shipment?.status ?? null;
  const displayCarrier = shipment?.carrier
    ? CARRIERS[shipment.carrier] ?? shipment.carrier
    : null;

  /**
   * 🔥 Génération de l'étiquette d'expédition
   * - Déclenche la création du shipment avec statut ANNOUNCED
   * - Passe la commande en "preparing"
   * - L'email n'est PAS envoyé ici (ce sera fait par le webhook)
   */
  async function handleGenerateLabel() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/generate-label`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        const missing = Array.isArray(data?.details?.missingFields)
          ? data.details.missingFields.join(", ")
          : "";
        const validation = Array.isArray(data?.details?.validation)
          ? data.details.validation.join(" | ")
          : "";

        const message = [
          data?.error,
          missing ? `Champs manquants: ${missing}` : "",
          validation ? `Détail Boxtal: ${validation}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        throw new Error(message || "Erreur inconnue");
      }

      const payload = await res.json();
      setLabelData(payload);
      toast.success("Étiquette générée avec succès");

      // 🔥 L'API de génération de label gère déjà la mise à jour de l'historique
      // et le passage en status "preparing".
      router.refresh();

      // ⚠️ L'email d'expédition sera envoyé par le webhook Boxtal
      // lors du passage à SHIPPED (dépôt transporteur)

    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la génération");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCancelOrder() {
    setIsUpdating(true);
    setCancelError("");
    try {
      if (!adminCancelPassword.trim()) {
        throw new Error("Mot de passe administrateur requis");
      }

      const cancelRes = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: "cancelled",
          adminPassword: adminCancelPassword,
          comment: cancelWithRefund
            ? "Annulée avec remboursement"
            : "Annulée sans remboursement",
        }),
      });

      if (!cancelRes.ok) {
        const data = await cancelRes.json().catch(() => ({}));
        throw new Error(data.error || "Échec de l'annulation");
      }

      if (cancelWithRefund && (order as any).payment_intent_id) {
        const refundRes = await fetch("/api/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (!refundRes.ok) {
          toast.error("Commande annulée mais remboursement en échec");
        }
      }

      setShowCancelDialog(false);
      setAdminCancelPassword("");
      setCancelError("");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'annulation";
      setCancelError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleReturnOrder() {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: "returned",
          comment: "Commande retournee apres depot transporteur",
        }),
      });

      if (!res.ok) throw new Error("Erreur retour commande");
      toast.success("Commande marquee comme retournee");
      router.refresh();
    } catch (err) {
      toast.error("Erreur lors du passage en retour");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  const shippingAddress = order.shipping_address;
  const depositedToCarrier =
    order.status === "shipped" ||
    order.status === "delivered" ||
    shipmentStatus === "SHIPPED" ||
    shipmentStatus === "IN_TRANSIT" ||
    shipmentStatus === "DELIVERED";
  const canCancel =
    !depositedToCarrier &&
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.status !== "returned";
  const canReturn =
    depositedToCarrier &&
    order.status !== "returned" &&
    order.status !== "cancelled";

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
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Historique</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
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
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>

            {order.status === "confirmed" && (
              <p className="text-xs text-muted-foreground text-center">
                L'expedition est declenchee lors de la generation de l'etiquette.
              </p>
            )}

            {canCancel && (
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

            {canReturn && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReturnOrder}
                disabled={isUpdating}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Passer en retour
              </Button>
            )}

            {depositedToCarrier && order.status !== "returned" && (
              <p className="text-xs text-muted-foreground text-center">
                Le colis est depose chez le transporteur: l'annulation est desactivee, utilisez le retour.
              </p>
            )}

            <AlertDialog
              open={showCancelDialog}
              onOpenChange={(open) => {
                setShowCancelDialog(open);
                if (!open) {
                  setAdminCancelPassword("");
                  setCancelError("");
                }
              }}
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
                <div className="space-y-2 py-2">
                  <label className="text-sm font-medium">
                    Mot de passe administrateur
                  </label>
                  <Input
                    type="password"
                    value={adminCancelPassword}
                    onChange={(e) => {
                      setAdminCancelPassword(e.target.value);
                      if (cancelError) setCancelError("");
                    }}
                    placeholder="Saisir le mot de passe"
                    autoComplete="off"
                  />
                  {cancelError && (
                    <p className="text-sm text-red-500">{cancelError}</p>
                  )}
                </div>
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

          </CardContent>
        </Card>

        {/* 🔥 Carte Expédition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Expédition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shipmentId || shipmentStatus || trackingNumber || labelUrl || trackingUrl ? (
              <>
                <div className="rounded-md border bg-muted/20 p-3 text-sm space-y-2">
                  {shipmentId && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Shipment ID</span>
                      <span className="font-medium break-all text-right">{shipmentId}</span>
                    </div>
                  )}
                  {shipmentStatus && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Statut shipment</span>
                      <span className="font-medium">{shipmentStatus}</span>
                    </div>
                  )}
                  {displayCarrier && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Transporteur</span>
                      <span className="font-medium">{displayCarrier}</span>
                    </div>
                  )}
                  {trackingNumber && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Tracking</span>
                      <span className="font-medium break-all text-right">{trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {labelUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir l'étiquette
                      </a>
                    </Button>
                  )}
                  {labelUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Télécharger l'étiquette
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
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Aucune information shipment disponible
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
                {order.status === "preparing" && (
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
                    {isGenerating ? "Génération en cours..." : "Régénérer l'étiquette"}
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
            {(order.discount_amount ?? 0) > 0 && (
              <>
                <div className="flex justify-between text-emerald-700">
                  <span className="text-muted-foreground">
                    Réduction{order.promo_code ? ` (${order.promo_code})` : ""}
                  </span>
                  <span>-{(order.discount_amount ?? 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total avant réduction</span>
                  <span>{(order.total + (order.discount_amount ?? 0)).toFixed(2)} €</span>
                </div>
              </>
            )}
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