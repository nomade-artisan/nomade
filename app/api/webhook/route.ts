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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

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

    // 2. Récupérer les produits + adresse de livraison
    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
      session.id
    );
    const shipping = session.shipping_details || session.customer_details;

    // 3. Enregistrer la commande avec adresse
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: session.customer_details?.name || "Client",
          customer_email: session.customer_details?.email || "",
          items: lineItems,
          total: (session.amount_total || 0) / 100,
          status: "payée",
          shipping_address: shipping?.address
            ? {
                line1: shipping.address.line1,
                line2: shipping.address.line2,
                city: shipping.address.city,
                postal_code: shipping.address.postal_code,
                country: shipping.address.country,
              }
            : null,
        },
      ])
      .select("id")
      .single();

    // 4. Email de confirmation enrichi
    if (session.customer_details?.email) {
      const itemsList = lineItems
        ?.map(
          (item: any) =>
            `<tr>
              <td style="padding: 8px 0; color: #44403c; font-size: 14px;">${item.description}</td>
              <td style="padding: 8px 0; color: #78716c; font-size: 14px; text-align: center;">x${item.quantity}</td>
              <td style="padding: 8px 0; color: #44403c; font-size: 14px; text-align: right;">${(item.amount_total / 100).toFixed(2)} €</td>
            </tr>`
        )
        .join("");

      const shippingAddress = shipping?.address
        ? `${shipping.address.line1 || ""}, ${shipping.address.postal_code || ""} ${shipping.address.city || ""}, ${shipping.address.country || ""}`
        : session.customer_details?.address
        ? `${session.customer_details.address.line1 || ""}, ${session.customer_details.address.postal_code || ""} ${session.customer_details.address.city || ""}`
        : "Adresse communiquée";
              // Récupérer la facture
      const invoice = await stripe.invoices.retrieve(
        session.invoice as string
      );

      // Ajouter le lien dans l'email
      const invoiceUrl = invoice.hosted_invoice_url;
      const invoicePdf = invoice.invoice_pdf;
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: session.customer_details.email,
        subject: "Votre commande Nomade est confirmée",
        html: `
          <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
            
            <h2 style="font-weight: 400; color: #1c1917; font-size: 22px; margin-bottom: 8px;">
              Merci pour votre commande
            </h2>
            <p style="color: #78716c; font-size: 14px; margin-bottom: 24px;">
              Bonjour ${session.customer_details?.name || ""},<br />
              Votre commande est confirmée. Nous la préparons avec soin.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #44403c; font-size: 14px; margin: 0 0 4px 0; font-weight: 500;">
                Livraison
              </p>
              <p style="color: #78716c; font-size: 13px; margin: 0;">
                ${shippingAddress}
              </p>
              <p style="color: #78716c; font-size: 13px; margin: 4px 0 0 0;">
                3 à 5 jours ouvrés
              </p>
            </div>

            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; margin-bottom: 16px;">
              <p style="color: #44403c; font-size: 16px; margin: 0; text-align: right;">
                Total : <strong>${((session.amount_total || 0) / 100).toFixed(2)} €</strong>
              </p>
            </div>

            <p style="color: #a8a29e; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
              Nomade — L&apos;essentiel est à l&apos;intérieur
            </p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${invoiceUrl}" style="
              display: inline-block;
              background: #1c1917;
              color: white;
              padding: 10px 20px;
              border-radius: 24px;
              text-decoration: none;
              font-size: 13px;
            ">
              Voir ma facture
            </a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}