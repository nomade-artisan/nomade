import { getOrderById } from "@/lib/orders/queries";
import { notFound } from "next/navigation";
import OrderDetail from "@/components/admin/orders/OrderDetail";

interface Props {
  params: Promise<{ id: string}>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Commande {order.order_number || order.id.substring(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  );
}