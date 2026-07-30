import { supabase } from "@/lib/supabase/client";
import type { CustomerListItem, CustomerWithOrders } from "./types";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getCustomersList(
  page = 1,
  pageSize = 10,
  search?: string
): Promise<PaginatedResponse<CustomerListItem>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    .select(
      `
      id,
      email,
      first_name,
      last_name,
      total_orders,
      total_spent,
      created_at,
      orders:orders(order_number, created_at)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "orders", ascending: false })
    .limit(1, { referencedTable: "orders" })
    .range(from, to);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching customers:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const customers: CustomerListItem[] = (data || []).map((c: any) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`.trim() || "—",
    email: c.email,
    total_orders: c.total_orders,
    total_spent: c.total_spent,
    last_order_date: c.orders?.[0]?.created_at || null,
    created_at: c.created_at,
  }));

  return {
    data: customers,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getCustomerById(id: string): Promise<CustomerWithOrders | null> {
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      orders:orders(id, order_number, status, total, created_at)
    `
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "orders", ascending: false })
    .single();
    
  if (error) {  
    console.error("Error fetching customer:", error);
    return null;
  }

  return data as unknown as CustomerWithOrders;
}