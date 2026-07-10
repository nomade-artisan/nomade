// lib/email/order-confirmed.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL!;

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
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #ececec;">
          ${item.name}
        </td>
        <td align="center" style="padding:12px 0;border-bottom:1px solid #ececec;">
          x${item.quantity}
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #ececec;">
          ${(item.price * item.quantity).toFixed(2)} €
        </td>
      </tr>
    `
    )
    .join("");

  const invoiceSection = invoicePdfUrl
    ? `<div style="margin:20px 0;text-align:center;">
         <a href="${invoicePdfUrl}" style="background:#1c1917;color:#fff;padding:10px 20px;border-radius:24px;text-decoration:none;">
           Télécharger ma facture
         </a>
       </div>`
    : "";

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} confirmée`,
    html: `
<div style="max-width:650px;margin:auto;font-family:Inter,Arial,sans-serif;background:#fafaf9;color:#1c1917;">

<div style="padding:40px;text-align:center;border-bottom:1px solid #ececec;">
<h1 style="margin:0;font-weight:500;">Nomade</h1>
<p style="margin-top:10px;color:#78716c;">Merci pour votre commande.</p>
</div>

<div style="padding:40px;">

<h2 style="font-weight:500;">Bonjour ${customerName},</h2>

<p style="line-height:1.7;color:#44403c;">
Nous avons bien reçu votre commande. Notre atelier va maintenant préparer votre colis avec le plus grand soin.
Vous recevrez un nouvel email dès que votre commande sera remise au transporteur.
</p>

<div style="margin:35px 0;padding:20px;background:#f5f5f4;border-radius:10px;">
<strong>Commande</strong><br>${orderNumber}
</div>

<h3>Articles</h3>
<table width="100%" cellspacing="0" cellpadding="0">
${itemsHtml}
<tr>
  <td colspan="2" style="padding-top:20px;">Sous-total</td>
  <td align="right">${subtotal.toFixed(2)} €</td>
</tr>
<tr>
  <td colspan="2" style="padding-top:10px;">Livraison</td>
  <td align="right">${shipping.toFixed(2)} €</td>
</tr>
<tr>
  <td colspan="2" style="padding-top:20px;font-size:18px;font-weight:bold;">Total</td>
  <td align="right" style="padding-top:20px;font-size:18px;font-weight:bold;">${total.toFixed(2)} €</td>
</tr>
</table>

${invoiceSection}

<div style="margin-top:40px;padding:25px;background:#f8f8f8;border-radius:10px;">
<h3 style="margin-top:0;">Et maintenant ?</h3>
<p style="line-height:1.7;color:#57534e;"> Votre commande est confirmée.</p>
<p style="line-height:1.7;color:#57534e;"> Nous préparons actuellement votre colis.</p>
<p style="line-height:1.7;color:#57534e;"> Dès son expédition, vous recevrez automatiquement votre numéro de suivi.</p>
</div>

<div style="margin-top:40px;padding:20px;border-top:1px solid #ececec;font-size:13px;color:#78716c;line-height:1.7;">
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
<br><br>
Pour toute question concernant votre commande, vous pouvez :
<ul>
  <li>utiliser le formulaire de contact disponible sur notre site ;</li>
  <li>ou nous écrire à <strong>${CONTACT_EMAIL}</strong>.</li>
</ul>
Nous vous répondrons dans les meilleurs délais.
</div>

</div>

<div style="padding:30px;text-align:center;color:#a8a29e;font-size:12px;">
© ${new Date().getFullYear()} Nomade<br>L'essentiel est à l'intérieur.
</div>

</div>
`,
  });
}