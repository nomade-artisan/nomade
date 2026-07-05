import { supabase } from '@/lib/db';
import type { ShippingLabel } from './types';

export async function createShippingLabel(data: {
  order_id: string;
  carrier: string;
  tracking_number: string;
  tracking_url?: string;
  label_url?: string;
}) {
  const { data: label, error } = await supabase
    .from('shipping_labels')
    .insert({
      ...data,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return label as ShippingLabel;
}

export async function updateTrackingStatus(
  trackingNumber: string,
  status: string
) {
  const { error } = await supabase
    .from('shipping_labels')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('tracking_number', trackingNumber);
  if (error) throw error;
}