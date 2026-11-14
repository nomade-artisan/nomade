import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const hasTrackingUrl = Boolean(trackingUrl && trackingUrl.trim());
  const html = renderEmailTemplate({
    title: "Votre colis poursuit son acheminement",
    preheader: `Suivez l’avancement de la commande ${orderNumber}.`,
    customerName,
    intro:
      "Votre colis est en route et poursuit son acheminement. Nous vous tiendrons informé de sa livraison.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "État", value: "En cours d’acheminement" },
    ],
    cta: hasTrackingUrl
      ? {
          label: "Suivre mon colis",
          href: trackingUrl,
        }
      : undefined,
    secondaryHtml: hasTrackingUrl
      ? '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Les délais peuvent varier selon la destination et les jours fériés. Votre colis continue son parcours.</p>'
      : '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Le suivi en ligne n’est pas encore disponible. Votre colis poursuit son acheminement ; vous recevrez un nouveau message à la prochaine étape.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Votre commande ${orderNumber} est en cours d’acheminement`,
    html,
    text: renderEmailText(html),
  });
}
