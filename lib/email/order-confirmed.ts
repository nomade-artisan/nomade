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
  // Construction de la ligne d'articles
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E5E5; font-size: 15px; color: #222222;">
          ${item.name}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E5E5; font-size: 15px; color: #222222; text-align: center;">
          x${item.quantity}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #E5E5E5; font-size: 15px; color: #222222; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)} €
        </td>
      </tr>
    `
    )
    .join("");

  // Bouton facture (si disponible)
  const invoiceButton = invoicePdfUrl
    ? `
    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="${invoicePdfUrl}" style="display: inline-block; background: #1A1A1A; color: #FFFFFF; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: 0.3px;">
        Télécharger ma facture
      </a>
    </div>
  `
    : "";

  // Timeline
  const timeline = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 8px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #222222;">
          <span style="display:inline-block; width:20px; text-align:center; font-weight:700; color:#666666;">—</span> Commande confirmée
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #222222;">
          <span style="display:inline-block; width:20px; text-align:center; font-weight:700; color:#666666;">—</span> Préparation en cours
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #222222;">
          <span style="display:inline-block; width:20px; text-align:center; font-weight:700; color:#666666;">—</span> Expédition
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #222222;">
          <span style="display:inline-block; width:20px; text-align:center; font-weight:700; color:#666666;">—</span> Livraison
        </td>
      </tr>
    </table>
  `;

  // Corps de l'email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
    </head>
    <body style="margin: 0; padding: 0; background: #F5F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #222222;">

      <!-- CONTENEUR PRINCIPAL -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #F5F5F5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); overflow: hidden;">

              <!-- HEADER -->
              <tr>
                <td style="padding: 40px 40px 24px; text-align: center; background: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 6px; color: #1A1A1A; text-transform: uppercase;">
                    Nomade
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #888888; letter-spacing: 1px; text-transform: uppercase;">
                    Confirmation de commande
                  </p>
                </td>
              </tr>

              <!-- CORPS -->
              <tr>
                <td style="padding: 40px 40px 32px; background: #FFFFFF;">

                  <!-- MESSAGE PERSONNALISÉ -->
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Bonjour <strong>${customerName}</strong>,
                  </p>
                  <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #444444;">
                    Nous confirmons la réception de votre commande. Celle-ci sera traitée dans les plus brefs délais.
                  </p>
                  <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #444444;">
                    Vous recevrez un email dès l'expédition de votre colis.
                  </p>

                  <!-- BLOC COMMANDE -->
                  <div style="background: #F9F9F9; border-radius: 6px; padding: 20px 20px; margin-bottom: 28px; border: 1px solid #EEEEEE;">
                    <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888;">
                      Commande confirmée
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: 500; color: #1A1A1A;">
                      ${orderNumber}
                    </p>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #888888;">
                      ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <!-- TABLEAU PRODUITS -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <thead>
                      <tr>
                        <th style="padding: 0 0 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 500; border-bottom: 1px solid #E5E5E5;">
                          Article
                        </th>
                        <th style="padding: 0 0 10px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 500; border-bottom: 1px solid #E5E5E5;">
                          Qté
                        </th>
                        <th style="padding: 0 0 10px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 500; border-bottom: 1px solid #E5E5E5;">
                          Prix
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- TOTAUX -->
                  <div style="border-top: 2px solid #E5E5E5; padding-top: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #444444;">
                          Sous-total
                        </td>
                        <td style="padding: 4px 0; font-size: 14px; color: #444444; text-align: right;">
                          ${subtotal.toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #444444;">
                          Livraison
                        </td>
                        <td style="padding: 4px 0; font-size: 14px; color: #444444; text-align: right;">
                          ${shipping.toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0; font-size: 18px; font-weight: 600; color: #1A1A1A;">
                          Total
                        </td>
                        <td style="padding: 12px 0 0; font-size: 18px; font-weight: 600; color: #1A1A1A; text-align: right;">
                          ${total.toFixed(2)} €
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- BOUTON FACTURE -->
                  ${invoiceButton}

                  <!-- TIMELINE -->
                  <div style="background: #F9F9F9; border-radius: 6px; padding: 20px 20px 12px; margin: 28px 0 0; border: 1px solid #EEEEEE;">
                    <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 500;">
                      Suivi de commande
                    </p>
                    ${timeline}
                  </div>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background: #1A1A1A; padding: 32px 40px 28px; text-align: center; color: #FFFFFF;">
                  <p style="margin: 0; font-size: 18px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">
                    Nomade
                  </p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #999999; letter-spacing: 0.5px;">
                    Contact : <a href="mailto:${CONTACT_EMAIL}" style="color: #CCCCCC; text-decoration: none;">${CONTACT_EMAIL}</a>
                  </p>
                  <p style="margin: 16px 0 0; font-size: 12px; color: #666666;">
                    © ${new Date().getFullYear()} Nomade
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  // Envoi de l'email (inchangé)
  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} confirmée`,
    html: htmlContent,
  });
}