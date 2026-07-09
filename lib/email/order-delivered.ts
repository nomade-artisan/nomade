import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderDeliveredEmail({
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
    subject: `Votre commande ${orderNumber} a été livrée`,
    html: `
      <h2>Commande livrée</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Votre commande a bien été livrée.
      </p>

      <p>
        Merci d'avoir choisi Nomade ❤️
      </p>
    `,
  });
}