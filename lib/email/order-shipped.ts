import { Resend } from "resend";
import { escapeHtml, renderEmailTemplate } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

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

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est expédiée`,
    html: renderEmailTemplate({
      title: "Votre commande est expédiee",
      preheader: `Commande ${orderNumber} remise au transporteur`,
      customerName,
      intro:
        "Votre colis a ete pris en charge par le transporteur. Vous pouvez suivre l'acheminement de votre envoi des maintenant.",
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
        : `<p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">Le lien de suivi sera active des que le transporteur le rendra disponible.</p>`,
      mainHtml: `<p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#374151;">Conseil: conservez votre numero de suivi <strong>${escapeHtml(
        trackingNumber || ""
      )}</strong> pour vos echanges avec le support.</p>`,
    }),
  });
}