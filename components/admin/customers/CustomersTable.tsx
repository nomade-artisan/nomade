"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import type { CustomerListItem } from "@/lib/customers/types";

interface Props {
  customers: CustomerListItem[];
}

export default function CustomersTable({ customers }: Props) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/customers?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder="Rechercher un client..." className="pl-9" />
          </div>
          <Button type="submit">Filtrer</Button>
        </form>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 text-sm">Client</th>
              <th className="text-left p-4 text-sm">Email</th>
              <th className="text-left p-4 text-sm">Commandes</th>
              <th className="text-left p-4 text-sm">Total dépensé</th>
              <th className="text-left p-4 text-sm">Dernière commande</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                  Aucun client trouvé
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm font-medium">{customer.name}</td>
                  <td className="p-4 text-sm">{customer.email}</td>
                  <td className="p-4 text-sm">{customer.total_orders}</td>
                  <td className="p-4 text-sm">{customer.total_spent.toFixed(2)} €</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {customer.last_order_date
                      ? new Date(customer.last_order_date).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="p-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/customers/${customer.id}`}>
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