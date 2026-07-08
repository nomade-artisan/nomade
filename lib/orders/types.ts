//lib/orders/types.ts
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  returned: 'Retournée',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800',
};

export interface Order {
  id: string;
  customer_id: string | null;
  order_number: string | null;
  payment_intent_id?: string | null; // ✅ Ajouté pour le remboursement
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total: number;
  created_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  comment: string | null;
  created_at: string;
}

export interface OrderShipment {
  id: string;
  order_id: string;
  shipping_order_id: string;
  shipment_id?: string | null;
  label_url?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  status?: string | null;
  carrier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithRelations extends Order {
  customer: { id: string; email: string; first_name: string; last_name: string } | null;
  items: OrderItem[];
  tracking: OrderTracking[];
  shipment?: OrderShipment | null;
}

export interface OrderListItem {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  status: OrderStatus;
  total: number;
  items_count: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}