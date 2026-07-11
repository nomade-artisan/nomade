import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { Resend } from "resend";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL?.split(",").map((e) => e.trim()) || [];

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "contact", {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Email invalide." },
        { status: 400 }
      );
    }

    // Sauvegarde dans Supabase
    const { error: dbError } = await supabase
      .from("contacts")
      .insert([{ name, email, message }]);

    if (dbError) {
      console.error("Erreur Supabase:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du message." },
        { status: 500 }
      );
    }

    // Notification par email
    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Message de ${name}`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
            Nouveau message
          </h2>
          <p style="color: #78716c; font-size: 14px; margin-bottom: 4px;">
            <strong>De :</strong> ${name}
          </p>
          <p style="color: #78716c; font-size: 14px; margin-bottom: 20px;">
            <strong>Email :</strong> ${email}
          </p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="color: #44403c; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
            ${message}
          </p>
          <p style="color: #a8a29e; font-size: 12px; margin-top: 24px; text-align: center;">
            Nomade — L&apos;essentiel est à l&apos;intérieur
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès.",
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}