import { generateShippingLabel } from './api';
import { createShippingLabel } from './mutations';
import { supabase } from '@/lib/db';
import { sendShippingEmail } from '@/lib/email/shipping';
import { revalidatePath } from 'next/cache';

export async function createAndProcessLabel(
  orderId: string,
  carrier: string,
  customerName?: string,
  customerEmail?: string
) {
  // Récupérer les infos de la commande
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('shipping_address')
    .eq('id', orderId)
    .single();
  if (orderError || !order) throw new Error('Commande introuvable');

  // Générer l'étiquette via Sendcloud
  const labelResult = await generateShippingLabel({
    order_id: orderId,
    carrier,
    shipping_address: order.shipping_address,
    customer_name: customerName,
    customer_email: customerEmail,
  });

  // Enregistrer l'étiquette en base
  const label = await createShippingLabel({
    order_id: orderId,
    carrier,
    tracking_number: labelResult.tracking_number,
    tracking_url: labelResult.tracking_url,
    label_url: labelResult.label_url,
  });

  // Mettre à jour la commande
  await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: labelResult.tracking_number,
      tracking_url: labelResult.tracking_url,
      carrier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Ajouter au suivi
  await supabase.from('order_tracking').insert({
    order_id: orderId,
    status: 'shipped',
    comment: `Étiquette générée via ${carrier}, suivi: ${labelResult.tracking_number}`,
  });

  // Envoyer l'email d'expédition
  if (customerEmail) {
    await sendShippingEmail({
      to: customerEmail,
      customerName: customerName || 'Client',
      orderNumber: orderId.slice(0, 8),
      trackingNumber: labelResult.tracking_number,
      trackingUrl: labelResult.tracking_url,
      carrier,
    });
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);

  return label;
}