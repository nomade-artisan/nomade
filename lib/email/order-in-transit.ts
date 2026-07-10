import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;

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
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commande en transit</title>
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
                    En cours d'acheminement
                  </p>
                </td>
              </tr>

              <!-- CORPS -->
              <tr>
                <td style="padding: 40px 40px 32px; background: #FFFFFF;">

                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Bonjour <strong>${customerName}</strong>,
                  </p>
                  <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #444444;">
                    Votre colis est actuellement en cours d'acheminement pour la commande <strong>${orderNumber}</strong>.
                  </p>
                  <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #444444;">
                    Vous pouvez suivre son trajet en temps réel grâce au lien ci-dessous.
                  </p>

                  <!-- BLOC COMMANDE -->
                  <div style="background: #F9F9F9; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #EEEEEE; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888;">
                      Commande
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: 500; color: #1A1A1A;">
                      ${orderNumber}
                    </p>
                  </div>

                  <!-- BOUTON SUIVI -->
                  <div style="text-align: center; margin: 28px 0 20px;">
                    <a href="${trackingUrl}" style="display: inline-block; background: #1A1A1A; color: #FFFFFF; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: 0.3px;">
                      Suivre mon colis
                    </a>
                  </div>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background: #1A1A1A; padding: 32px 40px 28px; text-align: center; color: #FFFFFF;">
                  <p style="margin: 0; font-size: 18px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">
                    Nomade
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

  return resend.emails.send({
    from: `Nomade <${NOREPLY_EMAIL}>`,
    to,
    subject: `Votre commande ${orderNumber} est en cours d'acheminement`,
    html: htmlContent,
  });
}