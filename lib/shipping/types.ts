export interface ShippingLabel {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  tracking_url?: string;
  label_url?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CreateLabelInput {
  order_id: string;
  carrier: string;
  weight?: number; // grammes
  shipping_address: any; // adresse de la commande
  customer_name?: string;
  customer_email?: string;
}

export interface TrackingEvent {
  tracking_number: string;
  status: string;
  location?: string;
  timestamp: string;
  message?: string;
}