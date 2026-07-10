import { NextRequest, NextResponse } from "next/server";

    // Après la création du refund
import { Resend } from "resend";
import { supabase } from "@/lib/supabase/client";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const paymentIntentId = order.payment_intent_id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Aucun Payment Intent trouvé pour cette commande" },
        { status: 400 }
      );
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    
    const noreplyEmail = process.env.NOREPLY_EMAIL

const resend = new Resend(process.env.RESEND_API_KEY);

// Envoyer l'email de remboursement
if (order.customer_email) {
  await resend.emails.send({
    from: noreplyEmail || "ne-pas-repondre@nomade-artisan.fr",
    to: order.customer_email,
    subject: "Votre commande Nomade a été remboursée",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
        <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 16px;">
          Votre commande a été remboursée
        </h2>
        <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
          Bonjour ${order.customer_name},
        </p>
        <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
          Votre commande #${order.id} d'un montant de <strong>${order.total.toFixed(2)} €</strong> a été remboursée.
        </p>
        <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
          Le remboursement apparaîtra sur votre compte sous 5 à 10 jours ouvrés, selon votre banque.
        </p>
        <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
          Si vous avez la moindre question, répondez simplement à cet email.
        </p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
        <p style="color: #a8a29e; font-size: 12px; text-align: center;">
          Nomade — L&apos;essentiel est à l&apos;intérieur
        </p>
      </div>
    `,
  });
}

    return NextResponse.json({ success: true, refundId: refund.id });


  } catch (error: any) {
    console.error("Erreur refund:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}