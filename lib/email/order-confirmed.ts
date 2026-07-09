import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderConfirmedEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} confirmée`,
    html: `
      <h2>Merci pour votre commande</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Nous avons bien reçu votre commande.
      </p>

      <p>
        Nous commençons sa préparation.
      </p>
    `,
  });
}