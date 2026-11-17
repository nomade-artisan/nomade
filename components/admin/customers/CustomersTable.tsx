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
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder="Rechercher un client..." className="h-11 pl-9 sm:h-9" />
          </div>
          <Button type="submit" className="min-h-11 w-full sm:min-h-9 sm:w-auto">Filtrer</Button>
        </form>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
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
        </div>

        <div className="divide-y md:hidden">
          {customers.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Aucun client trouvé
            </p>
          ) : (
            customers.map((customer) => (
              <article key={customer.id} className="space-y-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <h2 className="break-words font-medium">{customer.name}</h2>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Commandes</dt>
                    <dd className="mt-1">{customer.total_orders}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Total dépensé</dt>
                    <dd className="mt-1 font-semibold">{customer.total_spent.toFixed(2)} €</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Dernière commande</dt>
                    <dd className="mt-1">
                      {customer.last_order_date
                        ? new Date(customer.last_order_date).toLocaleDateString("fr-FR")
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <Button asChild variant="outline" size="sm" className="min-h-11 w-full">
                  <Link href={`/admin/customers/${customer.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Détail du client
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
