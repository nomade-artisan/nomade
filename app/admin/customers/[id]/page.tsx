import { getCustomerById } from "@/lib/customers/queries";
import { notFound } from "next/navigation";
import CustomerDetail from "@/components/admin/customers/CustomerDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {customer.first_name} {customer.last_name}
      </h1>
      <CustomerDetail customer={customer} />
    </div>
  );
}