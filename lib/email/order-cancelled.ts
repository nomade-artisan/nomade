import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderCancelledEmail({
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
    subject: `Commande ${orderNumber} annulée`,
    html: `
      <h2>Commande annulée</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Votre commande a été annulée.
      </p>

      <p>
        Si un remboursement est prévu, il sera effectué automatiquement.
      </p>
    `,
  });
}