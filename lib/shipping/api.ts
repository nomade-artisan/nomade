import { CARRIERS } from './carriers';
import type { CreateLabelInput } from './types';

function getAuthHeaders() {
  const { publicKey, secretKey } = CARRIERS.sendcloud;
  const encoded = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}

export async function generateShippingLabel(input: CreateLabelInput) {
  const { baseUrl } = CARRIERS.sendcloud;
  const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };

  // Étape 1 : Créer le colis via API v3
  const parcelResponse = await fetch(`${baseUrl}/parcels`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parcel: {
        name: input.customer_name || 'Client',
        address: input.shipping_address?.line1 || '',
        city: input.shipping_address?.city || '',
        postal_code: input.shipping_address?.postal_code || '',
        country: input.shipping_address?.country || 'FR',
        email: input.customer_email || '',
        telephone: input.shipping_address?.phone || '',
        weight: input.weight || 500,
        order_number: input.order_id,
        request_label: true,          // demande immédiate de l’étiquette
      },
    }),
  });

  if (!parcelResponse.ok) {
    const errorBody = await parcelResponse.text();
    throw new Error(`Erreur création colis Sendcloud: ${errorBody}`);
  }

  const parcel = await parcelResponse.json();
  // En v3, l’objet retourné peut être directement `parcel.id`, `parcel.tracking_number`, etc.
  const parcelId = parcel.id;
  const trackingNumber = parcel.tracking_number;
  const trackingUrl = parcel.tracking_url;

  // Étape 2 : Récupérer l’URL de l’étiquette
  const labelResponse = await fetch(`${baseUrl}/parcels/${parcelId}/label`, {
    headers: getAuthHeaders(),
  });

  if (!labelResponse.ok) {
    throw new Error('Erreur récupération étiquette Sendcloud');
  }

  const label = await labelResponse.json();
  // Selon la version, l’URL peut être dans label.label_printer.url ou label.normal_printer.url
  const labelUrl =
    label.label?.label_printer?.url ||
    label.label?.normal_printer?.url ||
    '';

  return {
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    label_url: labelUrl,
  };
}