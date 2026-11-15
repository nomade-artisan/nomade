import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderDeliveredEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  const html = renderEmailTemplate({
    title: "Votre commande a été livrée",
    preheader: `Le transporteur indique que la commande ${orderNumber} a été livrée.`,
    customerName,
    intro:
      "Le transporteur indique que votre commande a été livrée. Nous espérons qu’elle vous plaira et qu’elle trouvera sa place chez vous.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "État", value: "Livrée" },
    ],
    secondaryHtml:
      '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Si vous ne retrouvez pas votre colis ou si vous avez la moindre question, écrivez-nous à l’adresse indiquée ci-dessous. Nous vous aiderons.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Votre commande ${orderNumber} a été livrée`,
    html,
    text: renderEmailText(html),
  });
}
