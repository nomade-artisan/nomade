// app/api/send-preparation-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const noreplyEmail = process.env.NOREPLY_EMAIL;

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    await resend.emails.send({
      from: `Nomade <${noreplyEmail}>`,
      to: order.customer_email,
      subject: "Votre commande Nomade est en préparation",
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
            Votre commande est en préparation
          </h2>
          <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
            Bonjour ${order.customer_name},
          </p>
          <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
            Nous avons commencé à préparer votre commande. Chaque sac est fait avec soin, à la main, comme toujours.
          </p>
          <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
            Vous recevrez un email dès que votre colis sera expédié, avec un numéro de suivi.
          </p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="color: #a8a29e; font-size: 12px; margin-top: 20px; text-align: center;">
            Nomade — L&apos;essentiel est à l&apos;intérieur
          </p>
        </div>
      `,
    });

    // Mettre à jour le statut
    await supabase.from("orders").update({ status: "en préparation" }).eq("id", orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}