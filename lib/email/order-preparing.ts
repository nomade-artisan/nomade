import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderPreparingEmail({
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
    subject: `Préparation de votre commande ${orderNumber}`,
    html: `
      <h2>Nous préparons votre commande</h2>

      <p>Bonjour ${customerName},</p>

      <p>
        Votre commande est en cours de préparation dans notre atelier.
      </p>
    `,
  });
}