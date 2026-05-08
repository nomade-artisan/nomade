// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/db";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! // À ajouter dans .env.local
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Quand le paiement est réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const productIds = session.metadata?.product_ids?.split(",") || [];
    const quantities = session.metadata?.quantities?.split(",").map(Number) || [];

    // 1. Mettre à jour le stock
    for (let i = 0; i < productIds.length; i++) {
      const id = productIds[i];
      const qty = quantities[i] || 1;

      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", id)
        .single();

      if (product) {
        const newStock = Math.max(0, product.stock - qty);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", id);
      }
    }

    // 2. Enregistrer la commande
    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
      session.id
    );

    await supabase.from("orders").insert([
      {
        customer_name: session.customer_details?.name || "Client",
        customer_email: session.customer_details?.email || "",
        items: lineItems,
        total: (session.amount_total || 0) / 100,
        status: "payée",
      },
    ]);

    // 3. Envoyer un email de confirmation
    if (session.customer_details?.email) {
      await resend.emails.send({
        from: "Nomade <contact@nomade.fr>",
        to: session.customer_details.email,
        subject: "Votre commande Nomade est confirmée",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
            <h2 style="font-weight: 400; color: #1c1917;">Merci pour votre commande</h2>
            <p style="color: #78716c;">Bonjour ${session.customer_details.name || ""},</p>
            <p style="color: #44403c;">Votre commande a bien été reçue. Nous la préparons avec soin.</p>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
            <p style="color: #78716c; font-size: 14px;">Total : <strong>${((session.amount_total || 0) / 100).toFixed(2)} €</strong></p>
            <p style="color: #78716c; font-size: 14px;">Livraison : 3-5 jours ouvrés</p>
            <p style="color: #a8a29e; font-size: 12px; margin-top: 20px;">Nomade — L'essentiel est à l'intérieur</p>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}