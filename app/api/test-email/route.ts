// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const noreplyEmail = process.env.NOREPLY_EMAIL;
export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: noreplyEmail || "ne-pas-repondre@nomade-artisan.fr",
      to: "merveilleskatabisomwe@gmail.com", // ← Remplace par ton email
      subject: "Test Nomade",
      html: "<p>Si tu reçois ceci, Resend fonctionne.</p>",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}