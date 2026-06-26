import { getOrdersList } from "@/lib/orders/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrdersPagination from "@/components/admin/orders/OrdersPagination";
import OrdersTable from "@/components/admin/orders/OrdersTable";
export const dynamic = "force-dynamic";
interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const status = params.status;
  const search = params.search;

  const { data, total, totalPages } = await getOrdersList(
    page,
    pageSize,
    status,
    search
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Commandes</h1>
          <p className="text-sm text-muted-foreground">
            {total} commande{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <OrdersTable orders={data} />

      {totalPages > 1 && (
        <OrdersPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}