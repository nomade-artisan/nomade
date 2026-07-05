import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { updateTrackingStatus } from '@/lib/shipping/mutations';
import { revalidatePath } from 'next/cache';
import { sendDeliveryEmail } from '@/lib/email/shipping';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { action, parcel } = payload;

    if (action === 'parcel_status_changed' && parcel) {
      const trackingNumber = parcel.tracking_number;
      const statusMessage = parcel.status?.message || '';

      // Mettre à jour le statut de l'étiquette
      await updateTrackingStatus(trackingNumber, 'in_transit'); // ou un statut plus précis

      // Si le colis est livré (status.id = 6 chez Sendcloud)
      if (parcel.status?.id === 6) {
        const { data: label } = await supabase
          .from('shipping_labels')
          .select('order_id')
          .eq('tracking_number', trackingNumber)
          .single();

        if (label) {
          // Mettre à jour la commande
          await supabase
            .from('orders')
            .update({ status: 'delivered', updated_at: new Date().toISOString() })
            .eq('id', label.order_id);

          // Ajouter au suivi
          await supabase.from('order_tracking').insert({
            order_id: label.order_id,
            status: 'delivered',
            comment: statusMessage || 'Colis livré via Sendcloud',
          });

          // Envoyer l'email de confirmation
          const { data: order } = await supabase
            .from('orders')
            .select('customer:customers(email, first_name)')
            .eq('id', label.order_id)
            .single();

          const customer = Array.isArray((order as any)?.customer)
            ? (order as any).customer[0]
            : (order as any)?.customer;

          if (customer?.email) {
            await sendDeliveryEmail({
              to: customer.email,
              customerName: customer.first_name || 'Client',
              orderNumber: label.order_id.slice(0, 8),
            });
          }

          revalidatePath('/admin/orders');
          revalidatePath(`/admin/orders/${label.order_id}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}