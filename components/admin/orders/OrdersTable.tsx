"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import type { OrderListItem } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders/types";

interface Props {
  orders: OrderListItem[];
}

export default function OrdersTable({ orders }: Props) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const status = formData.get("status") as string;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);

    router.push(`/admin/orders?${params.toString()}`);
  }

  const currentParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  return (
    <Card>
      <CardHeader>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Rechercher un client..."
              defaultValue={currentParams.get("search") || ""}
              className="h-11 pl-9 sm:h-9"
            />
          </div>
          <select
            name="status"
            defaultValue={currentParams.get("status") || "all"}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-9 sm:w-[180px]"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="returned">Retournée</option>
          </select>
          <Button type="submit" className="min-h-11 w-full sm:min-h-9 sm:w-auto">Filtrer</Button>
        </form>
      </CardHeader>

      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 text-sm font-medium">Commande</th>
              <th className="text-left p-4 text-sm font-medium">Client</th>
              <th className="text-left p-4 text-sm font-medium">Articles</th>
              <th className="text-left p-4 text-sm font-medium">Total</th>
              <th className="text-left p-4 text-sm font-medium">Réduction</th>
              <th className="text-left p-4 text-sm font-medium">Statut</th>
              <th className="text-left p-4 text-sm font-medium">Date</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-mono text-sm">
                    #{order.order_number || order.id.substring(0, 8)}
                    {order.refunded_at && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2 py-1 font-sans text-[10px] text-rose-800">
                        Remboursée
                      </span>
                    )}
                    </td>
                  <td className="p-4 text-sm">{order.customer_name}</td>
                  <td className="p-4 text-sm">{order.items_count}</td>
                  <td className="p-4 text-sm font-medium">
                    {order.total.toFixed(2)} €
                  </td>
                  <td className="p-4 text-sm">
                    {(order.discount_amount ?? 0) > 0
                      ? `-${(order.discount_amount ?? 0).toFixed(2)} €${order.promo_code ? ` (${order.promo_code})` : ""}`
                      : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        ORDER_STATUS_COLORS[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Détail
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <div className="divide-y md:hidden">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Aucune commande trouvée
            </p>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-medium">
                      #{order.order_number || order.id.substring(0, 8)}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.customer_name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {order.refunded_at && (
                  <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800">
                    Remboursée
                  </span>
                )}

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Articles</dt>
                    <dd className="mt-1">{order.items_count}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Date</dt>
                    <dd className="mt-1">{new Date(order.created_at).toLocaleDateString("fr-FR")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Total</dt>
                    <dd className="mt-1 font-semibold">{order.total.toFixed(2)} €</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Réduction</dt>
                    <dd className="mt-1 truncate">
                      {(order.discount_amount ?? 0) > 0
                        ? `-${(order.discount_amount ?? 0).toFixed(2)} €${order.promo_code ? ` (${order.promo_code})` : ""}`
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <Button asChild variant="outline" size="sm" className="min-h-11 w-full">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Détail de la commande
                  </Link>
                </Button>
              </article>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
