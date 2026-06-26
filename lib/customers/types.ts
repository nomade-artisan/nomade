export interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  address: any;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithOrders extends Customer {
  orders: {
    id: string;
    status: string;
    total: number;
    created_at: string;
  }[];
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
}