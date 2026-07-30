import { Resend } from "resend";
import { formatEuro, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

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
    title: "Remboursement confirme",
    preheader: `Votre remboursement pour la commande ${orderNumber} est lance`,
    customerName,
    intro:
      "Votre remboursement a bien ete traite. Le montant sera visible sur votre compte selon les delais de votre etablissement bancaire.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Montant rembourse", value: formatEuro(total) },
      { label: "Etat", value: "Remboursement en cours" },
    ],
    secondaryHtml:
      '<p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">Le delai moyen constate est de 5 a 10 jours ouvres. Si besoin, repondez a cet email et nous vous aiderons rapidement.</p>',
  });

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} a ete remboursee`,
    html,
    text: renderEmailText(html),
  });
}
