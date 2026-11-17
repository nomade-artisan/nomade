import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { escapeHtml, formatEuro, renderEmailTemplate, renderEmailText } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmedEmail({
  to,
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  discountAmount = 0,
  total,
  invoicePdfUrl,
  idempotencyKey,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  discountAmount?: number;
  total: number;
  invoicePdfUrl?: string | null;
  idempotencyKey?: string;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td class="email-item-cell" style="padding:12px 8px 12px 0;border-top:1px solid #eeeae6;color:#292524;font-size:14px;line-height:1.5;">${escapeHtml(item.name)}</td>
          <td class="email-item-cell" align="center" style="padding:12px 8px;border-top:1px solid #eeeae6;color:#57534e;font-size:14px;white-space:nowrap;">${item.quantity}</td>
          <td class="email-item-cell" align="right" style="padding:12px 0 12px 8px;border-top:1px solid #eeeae6;color:#292524;font-size:14px;font-weight:600;white-space:nowrap;">${formatEuro(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  const html = renderEmailTemplate({
    title: "Votre commande est confirmée",
    preheader: `Paiement reçu : retrouvez le récapitulatif de la commande ${orderNumber}.`,
    customerName,
    intro:
      "Merci d’avoir choisi Nomade. Votre paiement a bien été reçu et votre commande est confirmée. Notre équipe prend le relais ; nous vous informerons par email de chaque étape importante.",
    mainHtml: `
      <div style="margin:22px 0 8px;">
        <h2 class="email-order-title" style="margin:0 0 8px;color:#292524;font-size:17px;line-height:1.4;">Les articles de votre commande</h2>
        <table class="email-order-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th class="email-item-cell" scope="col" align="left" style="padding:8px 8px 8px 0;color:#78716c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Article</th>
              <th class="email-item-cell" scope="col" align="center" style="padding:8px;color:#78716c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Qté</th>
              <th class="email-item-cell" scope="col" align="right" style="padding:8px 0 8px 8px;color:#78716c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Montant</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    `,
    details: [
      { label: "N° de commande", value: orderNumber },
      { label: "Sous-total", value: formatEuro(subtotal) },
      ...(discountAmount > 0
        ? [{ label: "Réduction", value: formatEuro(-discountAmount) }]
        : []),
      { label: "Livraison", value: formatEuro(shipping) },
      { label: "Total payé", value: formatEuro(total) },
    ],
    cta: invoicePdfUrl
      ? {
          label: "Télécharger votre facture",
          href: invoicePdfUrl,
        }
      : undefined,
    secondaryHtml:
      '<p style="margin:18px 0 0;color:#57534e;font-size:14px;line-height:1.7;">Gardez cet email pour retrouver facilement les informations de votre commande. Vous recevrez un autre message lorsque sa préparation commencera, puis à son expédition.</p>',
  });

  return resend.emails.send(
    {
      from: EMAIL_FROM,
      replyTo: EMAIL_REPLY_TO,
      to,
      subject: `Votre commande ${orderNumber} est confirmée`,
      html,
      text: renderEmailText(html),
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}
