import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderInTransitEmail({
  to,
  customerName,
  orderNumber,
  trackingUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingUrl: string;
}) {
  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est en cours d'acheminement`,
    html: `
      <h2>Votre colis est en cours d'acheminement</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Votre colis est actuellement en cours de livraison.
      </p>

      <p>
        <a href="${trackingUrl}">
          Suivre mon colis
        </a>
      </p>
    `,
  });
}