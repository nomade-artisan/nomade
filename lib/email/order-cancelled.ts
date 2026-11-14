import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderCancelledEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  const html = renderEmailTemplate({
    title: "Votre commande a été annulée",
    preheader: `Mise à jour concernant la commande ${orderNumber}.`,
    customerName,
    intro:
      "Votre commande a été annulée. Si un remboursement a été déclenché, son traitement apparaîtra sur le moyen de paiement utilisé, selon les délais de votre banque.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "État", value: "Annulée" },
    ],
    secondaryHtml:
      '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Si vous souhaitez en savoir plus sur cette annulation, écrivez-nous à l’adresse indiquée ci-dessous. Nous sommes à votre écoute.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Votre commande ${orderNumber} a été annulée`,
    html,
    text: renderEmailText(html),
  });
}
