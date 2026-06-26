import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/db";
import { Resend } from "resend";
import Stripe from "stripe";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL;

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

   // 1. Récupérer tous les stocks en une requête
const { data: products } = await supabase
  .from("products")
  .select("id, stock")
  .in("id", productIds.map(Number));

// 2. Préparer toutes les updates
const updates = productIds
  .map((id: string, i: number) => {
    const product = products?.find((p) => p.id === Number(id));
    if (!product) return null;
    const qty = quantities[i] ?? 1;
    return {
      id: Number(id),
      stock: Math.max(0, product.stock - qty),
    };
  })
  .filter(Boolean);

// 3. Exécuter toutes les updates en parallèle
await Promise.all(
  updates.map((u: any) =>
    supabase.from("products").update({ stock: u!.stock }).eq("id", u!.id)
  )
);
    // 3. Récupérer les line items Stripe
    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
      session.id
    );
    const shipping = session.shipping_details || session.customer_details;
    const orderNumber =
      "NOM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const totalAmount = (session.amount_total || 0) / 100;

    // 4. Créer la commande dans la nouvelle structure
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: null, // Peut être lié plus tard si compte client
        status: "confirmed",
        subtotal: totalAmount - 0, // Ajuster si livraison
        shipping: 0,
        total: totalAmount,
        shipping_address: shipping?.address
          ? {
              line1: shipping.address.line1,
              line2: shipping.address.line2 || "",
              city: shipping.address.city,
              postal_code: shipping.address.postal_code,
              country: shipping.address.country,
            }
          : null,
        notes: `Commande Stripe: ${session.payment_intent}`,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Erreur création commande:", orderError);
    } else {
      // 5. Créer les order_items
      const orderItems = lineItems?.map((item: any) => ({
        order_id: order.id,
        product_id: Number(item.price?.metadata?.product_id) || 0,
        product_name: item.description,
        product_price: (item.amount_total || 0) / 100 / item.quantity,
        quantity: item.quantity || 1,
        total: (item.amount_total || 0) / 100,
      })) || [];

      if (orderItems.length > 0) {
        await supabase.from("order_items").insert(orderItems);
      }

      // 6. Créer l'entrée de suivi
      await supabase.from("order_tracking").insert({
        order_id: order.id,
        status: "confirmed",
        comment: "Paiement validé via Stripe",
      });

      // 7. Analytics
      await supabase.from("analytics_events").insert({
        event_type: "purchase_completed",
        product_id: productIds.join(","),
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          amount: totalAmount,
          products: productIds,
          quantities,
          customer_email: session.customer_details?.email,
        },
      });

      // 8. ✅ Revalidation du cache
      for (const id of productIds) {
        revalidatePath(`/boutique/${id}`);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/boutique");
      revalidatePath("/");
    }

    // 9. Facture Stripe
    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    const invoiceUrl = invoice.hosted_invoice_url;

    // 10. Contenu commun pour les emails

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
      : "Adresse communiquée";

    const customerName = session.customer_details?.name || "";
    const customerEmail = session.customer_details?.email || "";

    // ==================== EMAIL CLIENT ====================
    if (customerEmail) {
      await resend.emails.send({
        from: `Nomade <${NOREPLY_EMAIL}>`,
        to: customerEmail,
        subject: "Votre commande Nomade est confirmée",
        html: `
          <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
            <h2 style="font-weight: 400; color: #1c1917; font-size: 22px; margin-bottom: 8px;">
              Merci pour votre commande
            </h2>
            <p style="color: #78716c; font-size: 14px; margin-bottom: 24px;">
              Bonjour ${customerName},<br />
              Votre commande est confirmée. Nous la préparons avec soin.
            </p>
            <strong>Numéro de commande : ${orderNumber}</strong>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>${itemsList}</tbody>
            </table>
            <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #44403c; font-size: 14px; margin: 0 0 4px 0; font-weight: 500;">Livraison</p>
              <p style="color: #78716c; font-size: 13px; margin: 0;">${shippingAddress}</p>
              <p style="color: #78716c; font-size: 13px; margin: 4px 0 0 0;">3 à 5 jours ouvrés</p>
            </div>
            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; margin-bottom: 16px;">
              <p style="color: #44403c; font-size: 16px; margin: 0; text-align: right;">
                Total : <strong>${totalAmount.toFixed(2)} €</strong>
              </p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${invoiceUrl}" style="display: inline-block; background: #1c1917; color: white; padding: 10px 20px; border-radius: 24px; text-decoration: none; font-size: 13px;">
                Voir ma facture
              </a>
            </div>
            <p style="color: #a8a29e; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
              Nomade — L&apos;essentiel est à l&apos;intérieur
            </p>
          </div>
        `,
      });
    }

    // ==================== EMAIL ADMIN ====================
    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: `${ADMIN_EMAIL}`,
      subject: `Nouvelle commande ${orderNumber} — ${totalAmount.toFixed(2)} €`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917; font-size: 20px; margin-bottom: 8px;">
            Nouvelle commande reçue
          </h2>
          <div style="background: #1c1917; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 18px; font-weight: 400;">${totalAmount.toFixed(2)} €</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.7;">Commande ${orderNumber}</p>
          </div>
          <p style="color: #44403c; font-size: 14px; margin-bottom: 16px;">
            <strong>${customerName}</strong><br />
            ${customerEmail}
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tbody>${itemsList}</tbody>
          </table>
          <div style="background: #f5f5f4; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <p style="color: #78716c; font-size: 13px; margin: 0;">
              📍 ${shippingAddress}
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/orders/${order?.id}" style="display: inline-block; background: #1c1917; color: white; padding: 10px 20px; border-radius: 24px; text-decoration: none; font-size: 13px;">
            Voir dans l'admin
          </a>
        </div>
      `,
    });
  }

  return NextResponse.json({ received: true });
}