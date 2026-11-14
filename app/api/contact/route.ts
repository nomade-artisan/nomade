// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { Resend } from "resend";
import { CONTACT_EMAIL, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email/config";
import { renderEmailTemplate, renderEmailText } from "@/lib/email/template";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>\"']/g, (character) => entities[character]);
}

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "contact", {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;
  // --- 2. Récupération et validation ---
  let name: string, email: string, message: string;
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const rawBody = await req.text();
    if (rawBody.length > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const body = JSON.parse(rawBody);
    name = typeof body.name === "string" ? body.name.trim() : "";
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json(
      { error: "Format de requête invalide." },
      { status: 400 }
    );
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  if (name.length > 100 || email.length > 254 || message.length > 3000) {
    return NextResponse.json({ error: "Un ou plusieurs champs sont trop longs." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email invalide." },
      { status: 400 }
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Le message doit contenir au moins 10 caractères." },
      { status: 400 }
    );
  }

  // --- 3. Sauvegarde dans Supabase ---
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  const { error: dbError } = await supabaseAdmin
    .from("contacts")
    .insert([{ name, email, message }]);

  if (dbError) {
    console.error("❌ Erreur Supabase:", dbError);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du message." },
      { status: 500 }
    );
  }

  // --- 4. Envoi de l'email (notification admin) ---
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Message de ${name.replace(/[\r\n]/g, " ").slice(0, 100)}`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
            Nouveau message
          </h2>
          <p style="color: #78716c; font-size: 14px; margin-bottom: 4px;">
            <strong>De :</strong> ${safeName}
          </p>
          <p style="color: #78716c; font-size: 14px; margin-bottom: 20px;">
            <strong>Email :</strong> ${safeEmail}
          </p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="color: #44403c; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
            ${safeMessage}
          </p>
          <p style="color: #a8a29e; font-size: 12px; margin-top: 24px; text-align: center;">
            Nomade — L'essentiel est à l'intérieur
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("❌ Erreur envoi email:", emailError);
    // On ne bloque pas la réponse car le message est déjà en base
  }

  // --- 5. Accusé de réception (email au client) ---
  try {
    const acknowledgementHtml = renderEmailTemplate({
      title: "Nous avons bien reçu votre message",
      preheader: "Merci d’avoir pris le temps de nous écrire.",
      customerName: name,
      intro:
        "Votre message est bien arrivé. Notre équipe en prendra connaissance et vous répondra à l’adresse que vous nous avez indiquée.",
      secondaryHtml:
        '<p style="margin:0;color:#57534e;font-size:14px;line-height:1.7;">En attendant, vous pouvez découvrir les créations de la boutique. Pour toute précision, écrivez-nous à l’adresse indiquée ci-dessous.</p>',
    });

    await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: EMAIL_REPLY_TO,
      to: email,
      subject: "Nous avons bien reçu votre message",
      html: acknowledgementHtml,
      text: renderEmailText(acknowledgementHtml),
    });
  } catch (emailError) {
    console.error("❌ Erreur envoi accusé de réception:", emailError);
  }

  return NextResponse.json({
    success: true,
    message: "Votre message a été envoyé avec succès.",
  });
}
