import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { escapeHtml, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderShippedEmail({
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
      "Votre colis a été confié au transporteur. Vous pouvez suivre son acheminement grâce aux informations ci-dessous.",
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "Transporteur", value: carrier || "À confirmer" },
      { label: "N° de suivi", value: trackingNumber || "En cours de génération" },
    ],
    cta: hasTrackingUrl
      ? {
          label: "Suivre mon colis",
          href: trackingUrl,
        }
      : undefined,
    mainHtml: `<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">${
      trackingNumber
        ? `Conservez votre numéro de suivi <strong>${escapeHtml(trackingNumber)}</strong> pour retrouver facilement votre colis.`
        : "Le numéro de suivi sera ajouté dès qu’il sera communiqué par le transporteur."
    }</p>`,
    secondaryHtml: hasTrackingUrl
      ? ""
      : '<p style="margin:14px 0 0;color:#57534e;font-size:14px;line-height:1.7;">Le lien de suivi n’est pas encore disponible. Il apparaîtra dès que le transporteur l’aura activé.</p>',
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
