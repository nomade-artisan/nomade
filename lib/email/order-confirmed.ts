import { Resend } from "resend";
import { escapeHtml, formatEuro, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

export async function sendOrderConfirmedEmail({
  to,
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  total,
  invoicePdfUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  invoicePdfUrl?: string | null;
}) {
  const html = renderEmailTemplate({
    title: "Confirmation de commande",
    preheader: `Votre commande ${orderNumber} est confirmee`,
    customerName,
    intro:
      "Merci pour votre commande. Nous avons bien recu votre paiement et votre commande est maintenant confirmee.",
    details: [
      { label: "Commande", value: orderNumber },
      { label: "Sous-total", value: formatEuro(subtotal) },
      { label: "Livraison", value: formatEuro(shipping) },
      { label: "Total", value: formatEuro(total) },
    ],
    cta: invoicePdfUrl
      ? {
          label: "Telecharger ma facture",
          href: invoicePdfUrl,
        }
      : undefined,
    mainHtml: `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:0 0 18px;background:#ffffff;">
        <p style="margin:0 0 10px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.4px;">Articles commandes</p>
        ${items
          .map(
            (item) => `
              <div style="padding:8px 0;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;gap:10px;">
                <span style="font-size:13px;color:#111827;">${escapeHtml(item.name)} x${item.quantity}</span>
                <span style="font-size:13px;color:#111827;font-weight:600;"> ${formatEuro(
                  item.price * item.quantity
                )}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `,
    secondaryHtml:
      '<p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">Prochaine etape: vous recevrez un email des que la commande passe en preparation puis lors de l\'expedition.</p>',
  });

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} confirmée`,
    html,
    text: renderEmailText(html),
  });
}