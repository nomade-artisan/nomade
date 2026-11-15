import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderPreparingEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  const html = renderEmailTemplate({
    title: "Votre commande entre en préparation",
    preheader: `Notre équipe prépare la commande ${orderNumber} avec soin.`,
    customerName,
    intro:
      "La préparation de votre commande a commencé dans notre atelier. Chaque article est vérifié avec attention avant son expédition.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "État", value: "Préparation en cours" },
    ],
    secondaryHtml:
      '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Nous vous écrirons dès que le transporteur aura pris votre colis en charge, avec les informations de suivi.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Votre commande ${orderNumber} est en préparation`,
    html,
    text: renderEmailText(html),
  });
}
