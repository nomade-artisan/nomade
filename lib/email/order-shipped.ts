import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderShippedEmail({
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
  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est expédiée`,
    html: `
      <h2>Votre commande est en route</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Votre commande a été remise à <strong>${carrier}</strong>.
      </p>

      <p>
        Numéro de suivi :
        <strong>${trackingNumber}</strong>
      </p>

      <p>
        <a href="${trackingUrl}">
          Suivre mon colis
        </a>
      </p>
    `,
  });
}