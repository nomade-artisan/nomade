import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { formatEuro, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderRefundedEmail({
  to,
  customerName,
  orderNumber,
  total,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
}) {
  const html = renderEmailTemplate({
    title: "Votre remboursement est en cours",
    preheader: `Le remboursement de la commande ${orderNumber} a été lancé.`,
    customerName,
    intro:
      "Le remboursement de votre commande a été transmis à votre moyen de paiement. Son apparition sur votre compte dépend des délais de traitement de votre banque.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "Montant remboursé", value: formatEuro(total) },
      { label: "État", value: "Remboursement transmis" },
    ],
    secondaryHtml:
      '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Si le remboursement n’apparaît pas après quelques jours ouvrés, contactez-nous à l’adresse ci-dessous : nous vous aiderons à vérifier son suivi.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Remboursement de votre commande ${orderNumber}`,
    html,
    text: renderEmailText(html),
  });
}
