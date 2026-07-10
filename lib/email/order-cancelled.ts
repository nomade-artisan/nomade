import { Resend } from "resend";
import { renderEmailTemplate, renderEmailText } from "./template";

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
  const html = renderEmailTemplate({
    title: "Commande annulee",
    preheader: `Mise a jour de la commande ${orderNumber}`,
    customerName,
    intro:
      "Votre commande a ete annulee. Si un remboursement est prevu, il sera initie automatiquement selon le mode de paiement utilise.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Etat", value: "Annulee" },
    ],
    secondaryHtml:
      '<p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">Le delai de remboursement depend de votre banque et peut prendre quelques jours ouvres.</p>',
  });

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} annulée`,
    html,
    text: renderEmailText(html),
  });
}