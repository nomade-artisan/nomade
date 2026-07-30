// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const resend = new Resend(process.env.RESEND_API_KEY);
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL!;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL?.split(",").map((e) => e.trim()) || [];

export async function POST(req: NextRequest) {
  // --- 1. Rate limiting avec Redis (persistant) ---
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rateKey = `contact:${ip}`;
  const limit = 5;          // 5 requêtes maximum
  const window = 60;        // en 60 secondes

  try {
    const current = await redis.incr(rateKey);
    if (current === 1) {
      await redis.expire(rateKey, window);
    }
    if (current > limit) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans une minute." },
        { status: 429 }
      );
    }
  } catch (redisError) {
    console.error("⚠️ Erreur Redis (rate limiting désactivé):", redisError);
    // Fallback : si Redis est indisponible, on laisse passer
    // (optionnel, à désactiver en production pour la sécurité)
  }

  // --- 2. Récupération et validation ---
  let name, email, message;
  try {
    const body = await req.json();
    name = body.name;
    email = body.email;
    message = body.message;
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

  if (!email.includes("@") || !email.includes(".")) {
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
  const { error: dbError } = await supabase
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
            ${message.replace(/\n/g, "<br />")}
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
    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: email,
      subject: "Votre message a bien été reçu",
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
            Bonjour ${name},
          </h2>
          <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
            Nous avons bien reçu votre message. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <p style="color: #a8a29e; font-size: 12px; margin-top: 24px; text-align: center;">
            Nomade — L'essentiel est à l'intérieur
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("❌ Erreur envoi accusé de réception:", emailError);
  }

  return NextResponse.json({
    success: true,
    message: "Votre message a été envoyé avec succès.",
  });
}