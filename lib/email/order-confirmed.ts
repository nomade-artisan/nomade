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
        <td style="padding: 16px 0; border-bottom: 1px solid #E8E3DA; font-size: 15px; color: #3F2F25;">
          ${item.name}
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #E8E3DA; font-size: 15px; color: #3F2F25; text-align: center;">
          x${item.quantity}
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #E8E3DA; font-size: 15px; color: #3F2F25; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)} €
        </td>
      </tr>
    `
    )
    .join("");

  // Bouton facture (si disponible)
  const invoiceButton = invoicePdfUrl
    ? `
    <div style="text-align: center; margin: 32px 0 24px;">
      <a href="${invoicePdfUrl}" style="display: inline-block; background: #A66A3F; color: #FFFFFF; padding: 14px 36px; border-radius: 40px; text-decoration: none; font-size: 16px; font-weight: 500; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(166,106,63,0.2);">
        Télécharger ma facture
      </a>
    </div>
  `
    : "";

  // Timeline
  const timeline = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px;">
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #3F2F25;">
          <span style="display:inline-block; width:20px; text-align:center;">✅</span> Commande confirmée
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #3F2F25;">
          <span style="display:inline-block; width:20px; text-align:center;">🧵</span> Préparation dans notre atelier
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #3F2F25;">
          <span style="display:inline-block; width:20px; text-align:center;">📦</span> Expédition
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #3F2F25;">
          <span style="display:inline-block; width:20px; text-align:center;">🚚</span> Livraison
        </td>
      </tr>
    </table>
  `;

  // Bloc artisanat
  const artisanBlock = `
    <div style="background: #F8F6F2; border-radius: 16px; padding: 24px 20px; margin: 28px 0; text-align: center; border-left: 3px solid #A66A3F;">
      <div style="font-size: 22px; margin-bottom: 8px;">🤎</div>
      <p style="margin: 0; font-size: 15px; color: #3F2F25; line-height: 1.6;">
        Chez Nomade, chaque pièce est préparée avec le plus grand soin dans notre atelier.<br>
        Merci de soutenir une fabrication artisanale française.
      </p>
    </div>
  `;

  // Bloc assistance
  const assistanceBlock = `
    <div style="background: #FFFFFF; border-radius: 16px; padding: 24px 20px; margin: 28px 0; box-shadow: 0 2px 8px rgba(63,47,37,0.04);">
      <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 500; color: #3F2F25;">Une question ?</h3>
      <p style="margin: 0 0 12px; font-size: 15px; color: #5C4B3A; line-height: 1.6;">
        Notre atelier reste à votre disposition.
      </p>
      <p style="margin: 0; font-size: 15px; color: #3F2F25;">
        <a href="mailto:${CONTACT_EMAIL}" style="color: #A66A3F; text-decoration: none; font-weight: 500;">
          ${CONTACT_EMAIL}
        </a>
      </p>
    </div>
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
    <body style="margin: 0; padding: 0; background: #F8F6F2; font-family: Georgia, 'Times New Roman', serif; color: #3F2F25;">

      <!-- CONTENEUR PRINCIPAL -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #F8F6F2; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 24px; box-shadow: 0 4px 20px rgba(63,47,37,0.06); overflow: hidden;">

              <!-- HEADER -->
              <tr>
                <td style="padding: 48px 40px 32px; text-align: center; background: #FFFFFF; border-bottom: 1px solid #E8E3DA;">
                  <h1 style="margin: 0; font-size: 38px; font-weight: 400; letter-spacing: 4px; color: #3F2F25; font-family: Georgia, serif;">
                    Nomade
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 15px; color: #A66A3F; font-style: italic; letter-spacing: 1px;">
                    L'essentiel est à l'intérieur.
                  </p>
                  <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E8E3DA;">
                    <p style="margin: 0; font-size: 22px; font-weight: 300; color: #3F2F25; line-height: 1.4;">
                      Merci pour votre confiance.
                    </p>
                    <p style="margin: 6px 0 0; font-size: 16px; color: #7B8B73; font-style: italic;">
                      Votre aventure commence aujourd'hui.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- CORPS -->
              <tr>
                <td style="padding: 40px 40px 32px; background: #FFFFFF;">

                  <!-- MESSAGE PERSONNALISÉ -->
                  <p style="margin: 0 0 24px; font-size: 17px; line-height: 1.8; color: #3F2F25; font-family: Georgia, serif;">
                    Bonjour <strong>${customerName}</strong>,
                  </p>
                  <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.8; color: #3F2F25;">
                    Merci d'avoir choisi Nomade. Votre commande est maintenant confirmée et notre atelier va commencer sa préparation avec le plus grand soin.
                  </p>
                  <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.8; color: #3F2F25;">
                    Chaque création est réalisée avec passion afin de vous accompagner pendant de nombreuses années.
                  </p>
                  <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.8; color: #3F2F25;">
                    Nous vous informerons dès que votre colis sera confié au transporteur.
                  </p>

                  <!-- BLOC COMMANDE -->
                  <div style="background: #F8F6F2; border-radius: 16px; padding: 24px 20px; margin-bottom: 32px; border: 1px solid #E8E3DA;">
                    <p style="margin: 0 0 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7B8B73;">
                      Commande confirmée
                    </p>
                    <p style="margin: 0; font-size: 20px; font-weight: 500; color: #3F2F25;">
                      ${orderNumber}
                    </p>
                    <p style="margin: 6px 0 0; font-size: 14px; color: #5C4B3A;">
                      ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <!-- TABLEAU PRODUITS -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <thead>
                      <tr>
                        <th style="padding: 0 0 12px; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #7B8B73; font-weight: 500; border-bottom: 1px solid #E8E3DA;">
                          Article
                        </th>
                        <th style="padding: 0 0 12px; text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #7B8B73; font-weight: 500; border-bottom: 1px solid #E8E3DA;">
                          Qté
                        </th>
                        <th style="padding: 0 0 12px; text-align: right; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #7B8B73; font-weight: 500; border-bottom: 1px solid #E8E3DA;">
                          Prix
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- TOTAUX -->
                  <div style="background: #F8F6F2; border-radius: 16px; padding: 20px 24px; margin-bottom: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 15px; color: #3F2F25;">
                          Sous-total
                        </td>
                        <td style="padding: 6px 0; font-size: 15px; color: #3F2F25; text-align: right;">
                          ${subtotal.toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 15px; color: #3F2F25;">
                          Livraison
                        </td>
                        <td style="padding: 6px 0; font-size: 15px; color: #3F2F25; text-align: right;">
                          ${shipping.toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0; font-size: 19px; font-weight: 600; color: #3F2F25; border-top: 2px solid #D6B48A;">
                          Total
                        </td>
                        <td style="padding: 12px 0 0; font-size: 19px; font-weight: 600; color: #3F2F25; text-align: right; border-top: 2px solid #D6B48A;">
                          ${total.toFixed(2)} €
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- BOUTON FACTURE -->
                  ${invoiceButton}

                  <!-- TIMELINE -->
                  <div style="background: #FFFFFF; border-radius: 16px; padding: 20px 20px 8px; margin: 28px 0; border: 1px solid #E8E3DA;">
                    <p style="margin: 0 0 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #7B8B73; font-weight: 500;">
                      Suivi de votre commande
                    </p>
                    ${timeline}
                  </div>

                  <!-- BLOC ARTISANAT -->
                  ${artisanBlock}

                  <!-- BLOC ASSISTANCE -->
                  ${assistanceBlock}

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background: #3F2F25; padding: 40px 40px 32px; text-align: center; color: #FFFFFF;">
                  <p style="margin: 0; font-size: 22px; font-weight: 400; letter-spacing: 2px; font-family: Georgia, serif;">
                    Nomade
                  </p>
                  <p style="margin: 6px 0 0; font-size: 14px; color: #D6B48A; font-style: italic; letter-spacing: 0.5px;">
                    Maroquinerie artisanale française
                  </p>
                  <p style="margin: 16px 0 0; font-size: 13px; color: #D6B48A; font-style: italic;">
                    L'essentiel est à l'intérieur.
                  </p>
                  <p style="margin: 24px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
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

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Commande ${orderNumber} confirmée`,
    html: htmlContent,
  });
}