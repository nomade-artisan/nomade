const configuredContactEmail = process.env.CONTACT_EMAIL
  ?.split(",")
  .map((email) => email.trim())
  .find(Boolean);

export const CONTACT_EMAIL =
  configuredContactEmail || "contact@nomade-artisan.fr";

export const EMAIL_FROM = `Nomade <${CONTACT_EMAIL}>`;
export const EMAIL_REPLY_TO = CONTACT_EMAIL;
