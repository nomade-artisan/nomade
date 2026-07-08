import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendShippingEmail({
  to,
  customerName,
  orderNumber,
  trackingNumber,
  trackingUrl,
  carrier,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
}) {
  await resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est en route`,
    html: `
      <h2>Votre colis arrive !</h2>
      <p>Bonjour ${customerName},</p>
      <p>Votre commande a été expédiée avec ${carrier}.</p>
      <p>Numéro de suivi : <strong>${trackingNumber}</strong></p>
      <p><a href="${trackingUrl}">Suivre mon colis</a></p>
    `,
  });
}

export async function sendDeliveryEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  await resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} a été livrée`,
    html: `
      <h2>Commande livrée</h2>
      <p>Bonjour ${customerName},</p>
      <p>Votre commande a bien été livrée.</p>
      <p>Merci pour votre confiance.</p>
    `,
  });
}