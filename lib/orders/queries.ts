import { supabase } from "@/lib/db";
import type {
  OrderWithRelations,
  OrderListItem,
  OrderTracking,
  PaginatedResponse,
} from "./types";

// ─── Liste paginée ────────────────────────────────────
export async function getOrdersList(
  page = 1,
  pageSize = 10,
  status?: string,
  search?: string
): Promise<PaginatedResponse<OrderListItem>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total,
      created_at,
      customer:customers(id, first_name, last_name),
      items:order_items(count)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `customer.first_name.ilike.%${search}%,customer.last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const orders: OrderListItem[] = (data || []).map((order: any) => ({
    id: order.id,
    customer_name: order.customer
      ? `${order.customer.first_name} ${order.customer.last_name}`
      : "Client invité",
    status: order.status,
    total: order.total,
    items_count: order.items?.[0]?.count || 0,
    created_at: order.created_at,
  }));

  return {
    data: orders,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ─── Détail complet ───────────────────────────────────
export async function getOrderById(id: string): Promise<OrderWithRelations | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(id, email, first_name, last_name),
      items:order_items(*),
      tracking:order_tracking(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return order as unknown as OrderWithRelations;
}