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
            <p>{customer.email}</p>
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
          <table className="w-full">
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
        </CardContent>
      </Card>
    </div>
  );
}