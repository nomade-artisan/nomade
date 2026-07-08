import { getCustomersList } from "@/lib/customers/queries";
import CustomersTable from "@/components/admin/customers/CustomersTable";
import CustomersPagination from "@/components/admin/customers/CustomersPagination";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const { data, total, totalPages } = await getCustomersList(
    page,
    pageSize,
    params.search
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {total} client{total > 1 ? "s" : ""}
        </p>
      </div>

      <CustomersTable customers={data} />

      {totalPages > 1 && (
        <CustomersPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}