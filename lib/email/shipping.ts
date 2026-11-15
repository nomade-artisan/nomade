import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { escapeHtml, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendShippingEmail({
  to,
  customerName,
  orderNumber,
  trackingNumber,
  trackingUrl,
  carrier,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
}) {
  const hasTrackingUrl = Boolean(trackingUrl && trackingUrl.trim());
  const html = renderEmailTemplate({
    title: "Votre commande a été expédiée",
    preheader: `La commande ${orderNumber} a été remise au transporteur.`,
    customerName,
    intro:
      "Votre colis a été confié au transporteur. Vous trouverez les informations de suivi ci-dessous.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "Transporteur", value: carrier || "À confirmer" },
      { label: "N° de suivi", value: trackingNumber || "En cours de génération" },
    ],
    cta: hasTrackingUrl
      ? { label: "Suivre mon colis", href: trackingUrl }
      : undefined,
    mainHtml: trackingNumber
      ? `<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Conservez votre numéro de suivi <strong>${escapeHtml(trackingNumber)}</strong> pour retrouver facilement votre colis.</p>`
      : "",
    secondaryHtml: hasTrackingUrl
      ? ""
      : '<p style="margin:14px 0 0;color:#57534e;font-size:14px;line-height:1.7;">Le lien de suivi sera disponible dès que le transporteur l’aura activé.</p>',
  });

  return resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: `Votre commande ${orderNumber} a été expédiée`,
    html,
    text: renderEmailText(html),
  });
}

export async function sendDeliveryEmail({
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
      "Le transporteur indique que votre commande a été livrée. Nous espérons qu’elle vous plaira.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "État", value: "Livrée" },
    ],
    secondaryHtml:
      '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">Si vous avez une question ou si vous ne retrouvez pas votre colis, écrivez-nous à l’adresse indiquée ci-dessous. Nous sommes là pour vous aider.</p>',
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
