import { Resend } from "resend";
import { escapeHtml, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

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
    title: "Votre colis est en route",
    preheader: `Expedition en cours pour ${orderNumber}`,
    customerName,
    intro:
      "Votre commande a ete expediee et remise au transporteur. Vous pouvez suivre le colis a tout moment.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Transporteur", value: carrier || "Non precise" },
      { label: "Numero de suivi", value: trackingNumber || "A venir" },
    ],
    cta: hasTrackingUrl
      ? {
          label: "Suivre mon colis",
          href: trackingUrl,
        }
      : undefined,
    secondaryHtml: hasTrackingUrl
      ? ""
      : '<p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">Le lien de suivi sera disponible des son activation par le transporteur.</p>',
    mainHtml: `<p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#374151;">Reference utile: <strong>${escapeHtml(
      trackingNumber || ""
    )}</strong></p>`,
  });

  await resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est en route`,
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
    title: "Commande livree",
    preheader: `Confirmation de livraison pour ${orderNumber}`,
    customerName,
    intro:
      "Votre commande a bien ete livree. Merci pour votre confiance.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Etat", value: "Livree" },
    ],
    secondaryHtml:
      '<p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">En cas de souci, repondez directement a cet email pour etre accompagne rapidement.</p>',
  });

  await resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} a été livrée`,
    html,
    text: renderEmailText(html),
  });
}