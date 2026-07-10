import { Resend } from "resend";
import { renderEmailTemplate } from "./template";

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
    html: renderEmailTemplate({
      title: "Preparation de votre commande",
      preheader: `Votre commande ${orderNumber} est en preparation`,
      customerName,
      intro:
        "Nous avons commence la preparation de votre commande dans notre atelier. Chaque article est verifie avant expedition.",
      details: [
        { label: "Commande", value: orderNumber },
        { label: "Etat", value: "Preparation en cours" },
      ],
      secondaryHtml:
        '<p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">Vous recevrez un prochain email avec votre suivi des remise au transporteur.</p>',
    }),
  });
}