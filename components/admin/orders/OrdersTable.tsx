"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Rechercher un client..."
              defaultValue={currentParams.get("search") || ""}
              className="pl-9"
            />
          </div>
          <Select name="status" defaultValue={currentParams.get("status") || "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmée</SelectItem>
              <SelectItem value="shipped">Expédiée</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
              <SelectItem value="returned">Retournée</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Filtrer</Button>
        </form>
      </CardHeader>

      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 text-sm font-medium">Commande</th>
              <th className="text-left p-4 text-sm font-medium">Client</th>
              <th className="text-left p-4 text-sm font-medium">Articles</th>
              <th className="text-left p-4 text-sm font-medium">Total</th>
              <th className="text-left p-4 text-sm font-medium">Statut</th>
              <th className="text-left p-4 text-sm font-medium">Date</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-mono text-sm">
                    #{order.order_number || order.id.substring(0, 8)}
                    </td>
                  <td className="p-4 text-sm">{order.customer_name}</td>
                  <td className="p-4 text-sm">{order.items_count}</td>
                  <td className="p-4 text-sm font-medium">
                    {order.total.toFixed(2)} €
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
      </CardContent>
    </Card>
  );
}