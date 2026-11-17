import { CONTACT_EMAIL } from "./config";

type Cta = {
  label: string;
  href: string;
};

type EmailTemplateInput = {
  title: string;
  preheader: string;
  customerName: string;
  intro: string;
  details?: Array<{ label: string; value: string }>;
  mainHtml?: string;
  cta?: Cta;
  secondaryHtml?: string;
};

const BRAND = "Nomade";
const SHOP_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://scolta.nomade-artisan.fr";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function renderEmailTemplate({
  title,
  preheader,
  customerName,
  intro,
  details = [],
  mainHtml = "",
  cta,
  secondaryHtml = "",
}: EmailTemplateInput): string {
  const detailsRows = details
    .map(
      ({ label, value }) => `
        <tr>
          <td class="email-detail" style="padding:10px 0;color:#57534e;font-size:14px;line-height:1.5;">${escapeHtml(label)}</td>
          <td class="email-detail" style="padding:10px 0;color:#1c1917;font-size:14px;line-height:1.5;text-align:right;font-weight:600;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("");

  const detailsBlock = details.length
    ? `
      <div class="email-details" style="background:#faf9f7;border:1px solid #e7e5e4;border-radius:10px;padding:12px 18px;margin:20px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detailsRows}</table>
      </div>
    `
    : "";

  const ctaBlock = cta
    ? `
      <div class="email-cta-wrap" style="text-align:center;margin:28px 0;">
        <a class="email-cta" href="${escapeHtml(cta.href)}" style="display:inline-block;min-height:44px;box-sizing:border-box;background:#292524;color:#ffffff;padding:13px 24px;border-radius:7px;text-decoration:none;font-size:15px;line-height:20px;font-weight:600;">
          ${escapeHtml(cta.label)}
        </a>
      </div>
    `
    : "";

  return `
    <!doctype html>
    <html lang="fr" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          @media screen and (max-width: 480px) {
            .email-outer { padding:16px 8px !important; }
            .email-card { border-radius:10px !important; }
            .email-header { padding:22px 20px 18px !important; }
            .email-title { font-size:21px !important; line-height:1.25 !important; }
            .email-content { padding:22px 20px 24px !important; }
            .email-greeting, .email-intro { font-size:15px !important; line-height:1.55 !important; }
            .email-details { padding:10px 14px !important; margin:18px 0 !important; }
            .email-detail { padding-top:8px !important; padding-bottom:8px !important; font-size:13px !important; line-height:1.45 !important; }
            .email-cta-wrap { margin:22px 0 !important; }
            .email-cta { padding:12px 18px !important; font-size:14px !important; }
            .email-footer { padding:18px 20px !important; }
            .email-footer-copy { font-size:13px !important; line-height:1.55 !important; }
            .email-order-title { font-size:16px !important; line-height:1.35 !important; }
            .email-order-table th { font-size:11px !important; }
            .email-order-table td { font-size:13px !important; line-height:1.4 !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#292524;">
        <div lang="fr" dir="ltr" style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>
        <table lang="fr" dir="ltr" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-outer" style="padding:32px 14px;background:#f5f3f0;">
          <tr>
            <td align="center">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="height:4px;background:#a87954;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="email-header" style="padding:30px 30px 24px;border-bottom:1px solid #eeeae6;">
                    <p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7c6f64;">${BRAND}</p>
                    <h1 class="email-title" style="margin:0;font-size:23px;line-height:1.3;font-weight:600;color:#292524;">${escapeHtml(title)}</h1>
                  </td>
                </tr>
                <tr>
                  <td class="email-content" style="padding:28px 30px 32px;">
                    <p class="email-greeting" style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#292524;">Bonjour${customerName ? ` <strong>${escapeHtml(customerName)}</strong>` : ""},</p>
                    <p class="email-intro" style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#44403c;">${escapeHtml(intro)}</p>
                    ${mainHtml}
                    ${detailsBlock}
                    ${ctaBlock}
                    ${secondaryHtml}
                  </td>
                </tr>
                <tr>
                  <td class="email-footer" style="padding:22px 30px;background:#292524;">
                    <p class="email-footer-copy" style="margin:0 0 8px;color:#ffffff;font-size:14px;line-height:1.5;font-weight:600;">Une question ? Nous sommes là pour vous aider.</p>
                    <p class="email-footer-copy" style="margin:0;color:#e7e5e4;font-size:14px;line-height:1.7;">
                      Écrivez-nous à <a href="mailto:${escapeHtml(CONTACT_EMAIL)}" style="color:#ffffff;text-decoration:underline;">${escapeHtml(CONTACT_EMAIL)}</a>.<br />
                      Retrouvez-nous sur <a href="${escapeHtml(SHOP_URL)}" style="color:#ffffff;text-decoration:underline;">la boutique Nomade</a>.
                    </p>
                    <p style="margin:16px 0 0;color:#d6d3d1;font-size:12px;line-height:1.5;">© ${new Date().getFullYear()} ${BRAND}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function renderEmailText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "\t")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\t+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
