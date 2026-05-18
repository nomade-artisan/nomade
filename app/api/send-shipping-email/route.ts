// app/api/send-shipping-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const noreplyEmail = process.env.NOREPLY_EMAIL;
const carrierNames: Record<string, string> = {
  laposte: "La Poste",
  chronopost: "Chronopost",
  colissimo: "Colissimo",
  mondialrelay: "Mondial Relay",
  ups: "UPS",
  dhl: "DHL",
};

export async function POST(req: NextRequest) {
  try {
    const { orderId, trackingNumber, trackingUrl, carrier } = await req.json();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
        
    const carrierName = carrierNames[carrier] || carrier;

    await resend.emails.send({
      from: `Nomade <${noreplyEmail}>`,
      to: order.customer_email,
      subject: "Votre commande Nomade est en route",
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
            Votre colis est en route
          </h2>
          <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
            Bonjour ${order.customer_name},
          </p>
          <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
            Votre commande a été expédiée. Votre sac arrive bientôt.
          </p>

          <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #78716c; font-size: 13px; margin: 0 0 8px 0;">
              Transporteur : <strong style="color: #44403c;">${carrierName}</strong>
            </p>
            <p style="color: #44403c; font-size: 14px; margin: 0 0 8px 0;">
              Numéro de suivi : <strong>${trackingNumber}</strong>
            </p>
            <a href="${trackingUrl}" style="color: #1c1917; font-size: 13px; text-decoration: underline;">
              Suivre mon colis
            </a>
          </div>

          <p style="color: #78716c; font-size: 13px; line-height: 1.6;">
            Livraison estimée : 3 à 5 jours ouvrés.
          </p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="color: #a8a29e; font-size: 12px; margin-top: 20px; text-align: center;">
            Nomade — L&apos;essentiel est à l&apos;intérieur
          </p>
        </div>
      `,
    });

    await supabase
      .from("orders")
      .update({
        status: "expédiée",
        tracking_number: trackingNumber,
        carrier: carrier,
      })
      .eq("id", orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}