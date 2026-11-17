import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { CustomerWithOrders } from "@/lib/customers/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders/types";

interface Props {
  customer: CustomerWithOrders;
}

export default function CustomerDetail({ customer }: Props) {
    
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Infos client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Nom</span>
            <p className="font-medium">{customer.first_name} {customer.last_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="break-all">{customer.email}</p>
          </div>
          {customer.phone && (
            <div>
              <span className="text-muted-foreground">Téléphone</span>
              <p>{customer.phone}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Client depuis</span>
            <p>{new Date(customer.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-light">{customer.total_orders}</p>
            <p className="text-xs text-muted-foreground">commandes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light">{customer.total_spent.toFixed(2)} €</p>
            <p className="text-xs text-muted-foreground">total dépensé</p>
          </div>
        </CardContent>
      </Card>

      {/* Commandes */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-4 text-sm">Commande</th>
                <th className="text-left p-4 text-sm">Statut</th>
                <th className="text-left p-4 text-sm">Total</th>
                <th className="text-left p-4 text-sm">Date</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Aucune commande
                  </td>
                </tr>
              ) : (
                customer.orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{order.order_number || order.id.substring(0, 8)}</td>
                    
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{order.total.toFixed(2)} €</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
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
            {customer.orders.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Aucune commande</p>
            ) : (
              customer.orders.map((order) => (
                <article key={order.id} className="space-y-4 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <p className="break-all font-mono text-sm font-medium">
                      {order.order_number || order.id.substring(0, 8)}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Total</dt>
                      <dd className="mt-1 font-semibold">{order.total.toFixed(2)} €</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Date</dt>
                      <dd className="mt-1">{new Date(order.created_at).toLocaleDateString("fr-FR")}</dd>
                    </div>
                  </dl>

                  <Button asChild variant="outline" size="sm" className="min-h-11 w-full">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir la commande
                    </Link>
                  </Button>
                </article>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
