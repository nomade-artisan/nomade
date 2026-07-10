import { Resend } from "resend";
import { renderEmailTemplate } from "./template";

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
    html: renderEmailTemplate({
      title: "Commande livree",
      preheader: `La commande ${orderNumber} est bien arrivee`,
      customerName,
      intro:
        "Votre commande a ete marquee comme livree. Nous esperons que tout est conforme a vos attentes.",
      details: [
        { label: "Commande", value: orderNumber },
        { label: "Etat", value: "Livree" },
      ],
      secondaryHtml:
        '<p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">Si vous constatez un probleme sur votre colis, repondez simplement a cet email pour que nous puissions vous aider rapidement.</p>',
    }),
  });
}