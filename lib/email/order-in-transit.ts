import { Resend } from "resend";
import { renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderInTransitEmail({
  to,
  customerName,
  orderNumber,
  trackingUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingUrl: string;
}) {
  const html = renderEmailTemplate({
    title: "Votre colis est en transit",
    preheader: `Suivi en cours pour la commande ${orderNumber}`,
    customerName,
    intro:
      "Bonne nouvelle, votre colis est maintenant en cours d'acheminement. Vous pouvez consulter son avancee en temps reel.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Etat", value: "En transit" },
    ],
    cta: {
      label: "Suivre mon colis",
      href: trackingUrl,
    },
    secondaryHtml:
      '<p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">Les delais peuvent varier selon les zones de distribution et les jours feries.</p>',
  });

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est en cours d'acheminement`,
    html,
    text: renderEmailText(html),
  });
}