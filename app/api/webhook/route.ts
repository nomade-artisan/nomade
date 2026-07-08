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
    console.error("❌ Signature webhook invalide:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const productIds: string[] =
      session.metadata?.product_ids?.split(",").filter(Boolean) || [];
    const quantities: number[] =
      session.metadata?.quantities?.split(",").map(Number).filter(Boolean) || [];

    const { data: products } = await supabase
      .from("products")
      .select("id, stock")
      .in("id", productIds.map(Number));

    const updates = productIds
      .map((id: string, i: number) => {
        const product = products?.find((p) => p.id === Number(id));
        if (!product) {
          return null;
        }
        const qty = quantities[i] ?? 1;
        return {
          id: Number(id),
          stock: Math.max(0, product.stock - qty),
        };
      })
      .filter((u): u is { id: number; stock: number } => u !== null);

    await Promise.all(
      updates.map((u) =>
        supabase.from("products").update({ stock: u.stock }).eq("id", u.id)
      )
    );

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const shipping = session.shipping_details || session.customer_details;
    const orderNumber =
      "NOM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const totalAmount = (session.amount_total || 0) / 100;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: null,
        status: "confirmed",
        subtotal: totalAmount,
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
        notes: `Commande passée via Stripes`,
        payment_intent_id: session.payment_intent,
        order_number: orderNumber,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("❌ Erreur création commande :", orderError);
    } else {
      const orderItems = lineItems.data.map((item: any, index: number) => {
        const productId = Number(productIds[index]) || 0;
        return {
          order_id: order.id,
          product_id: productId,
          product_name: item.description,
          product_price: (item.amount_total || 0) / 100 / item.quantity,
          quantity: item.quantity || 1,
          total: (item.amount_total || 0) / 100,
        };
      });

      if (orderItems.length > 0 && orderItems.some((oi) => oi.product_id > 0)) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("❌ Erreur order_items :", itemsError);
        }
      }

      await supabase.from("order_tracking").insert({
        order_id: order.id,
        status: "confirmed",
        comment: "Paiement validé via Stripe",
      });

      const customerEmail =
        session.customer_details?.email || session.customer?.email || "";
      const customerName = session.customer_details?.name || "";

      if (customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim();
        const nameParts = customerName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: existingCustomer, error: lookupError } = await supabase
          .from("customers")
          .select("id, first_name, last_name, phone, address, total_orders, total_spent")
          .eq("email", normalizedEmail)
          .single();

        if (lookupError && lookupError.code !== "PGRST116") {
          console.error("❌ Erreur lookup client :", lookupError);
        }

        if (existingCustomer) {
          // Mettre à jour les infos
          await supabase
            .from("customers")
            .update({
              first_name: firstName || existingCustomer.first_name,
              last_name: lastName || existingCustomer.last_name,
              phone: shipping?.phone || existingCustomer.phone,
              address: shipping?.address
                ? {
                    line1: shipping.address.line1,
                    line2: shipping.address.line2 || "",
                    city: shipping.address.city,
                    postal_code: shipping.address.postal_code,
                    country: shipping.address.country,
                  }
                : existingCustomer.address,
              total_orders: existingCustomer.total_orders + 1,
              total_spent: existingCustomer.total_spent + totalAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCustomer.id);

          // Lier la commande
          const { error: linkError } = await supabase
            .from("orders")
            .update({ customer_id: existingCustomer.id })
            .eq("id", order.id);

          if (linkError) {
            console.error("❌ Erreur liaison commande-client :", linkError);
          }
        } else {
          // Nouveau client
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              email: normalizedEmail,
              first_name: firstName,
              last_name: lastName,
              phone: shipping?.phone || null,
              address: shipping?.address
                ? {
                    line1: shipping.address.line1,
                    line2: shipping.address.line2 || "",
                    city: shipping.address.city,
                    postal_code: shipping.address.postal_code,
                    country: shipping.address.country,
                  }
                : null,
              total_orders: 1,
              total_spent: totalAmount,
            })
            .select("id")
            .single();

          if (newCustomer && !customerError) {
            await supabase
              .from("orders")
              .update({ customer_id: newCustomer.id })
              .eq("id", order.id);
          } else {
            console.error("❌ Erreur création client :", customerError);
          }
        }
      } else {
      }

      await supabase.from("analytics_events").insert({
        event_type: "purchase_completed",
        product_id: productIds.join(","),
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          amount: totalAmount,
          products: productIds,
          quantities,
          customer_email: customerEmail,
        },
      });

      for (const id of productIds) {
        revalidatePath(`/boutique/${id}`);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin/customers");
      revalidatePath("/boutique");
      revalidatePath("/");
    }

    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    const invoiceUrl = invoice.hosted_invoice_url;

    const itemsList = lineItems.data
      .map(
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

    // Email client
    if (customerEmail) {
    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: customerEmail,
      subject: "Votre commande Nomade est confirmée",
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: auto; padding: 36px; background: #fafaf9; border-radius: 16px; color: #1c1917;">

          <h2 style="font-size: 26px; font-weight: 500; margin: 0 0 12px;">
            Merci pour votre confiance !
          </h2>

          <p style="font-size: 15px; color: #57534e; line-height: 1.7; margin-bottom: 24px;">
            Bonjour ${customerName || "à vous"},
            <br><br>
            Nous sommes ravis de vous compter parmi les clients <strong>Nomade</strong>.
            Votre commande a bien été reçue et notre atelier va désormais préparer votre article avec le plus grand soin.
          </p>

          <div style="background: #f5f5f4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #78716c;">
              Numéro de commande
            </p>
            <p style="margin: 6px 0 0; font-size: 18px; font-weight: 600; color: #1c1917;">
              ${orderNumber}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div style="background: #f5f5f4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #1c1917;">
              Adresse de livraison
            </p>

            <p style="margin: 0; font-size: 14px; color: #57534e; line-height: 1.6;">
              📍 ${shippingAddress}
            </p>

            <p style="margin: 10px 0 0; font-size: 13px; color: #78716c;">
              Livraison estimée : <strong>3 à 5 jours ouvrés</strong>
            </p>
          </div>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 18px; margin-bottom: 28px;">
            <p style="margin: 0; text-align: right; font-size: 18px;">
              Total : <strong>${totalAmount.toFixed(2)} €</strong>
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <a
              href="${invoiceUrl}"
              style="display: inline-block; background: #1c1917; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 500;"
            >
              Télécharger ma facture
            </a>
          </div>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 24px;">

            <p style="font-size: 14px; color: #57534e; line-height: 1.7;">
              Nous vous informerons par e-mail dès que votre commande sera expédiée.
            </p>

            <p style="font-size: 14px; color: #57534e; line-height: 1.7;">
              Cet e-mail a été envoyé automatiquement depuis une adresse ne recevant pas de réponses.
            </p>

            <p style="font-size: 14px; color: #57534e; line-height: 1.7;">
              Pour toute question concernant votre commande, vous pouvez nous contacter via notre formulaire en ligne ou directement par e-mail :
            </p>

            <p style="font-size: 14px; line-height: 1.8; margin-top: 10px;">
              🌐 <a href="https://nomade-artisan.fr/contact" style="color:#1c1917;">nomade-artisan.fr/contact</a><br>
              ✉️ <a href="mailto:contact@nomade-artisan.fr" style="color:#1c1917;">contact@nomade-artisan.fr</a>
            </p>

            <p style="margin-top: 26px; font-size: 15px; color: #1c1917;">
              Chaque pièce est préparée avec soin. Merci de faire partie de l'aventure <strong>Nomade</strong>.
            </p>

            <p style="margin-top: 20px; color: #1c1917;">
              À très bientôt,<br>
              <strong>L'équipe Nomade</strong>
            </p>

          </div>

        </div>
      `,
    });

    }

    // Email admin
    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: `${ADMIN_EMAIL}`,
      subject: `Nouvelle commande ${orderNumber} — ${totalAmount.toFixed(2)} €`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: auto; padding: 30px; background: #fafaf9; border-radius: 12px;">
          <h2 style="font-weight: 400; color: #1c1917;">Nouvelle commande</h2>
          <div style="background: #1c1917; color: white; padding: 12px 16px; border-radius: 8px;">
            <p style="font-size: 18px;">${totalAmount.toFixed(2)} €</p>
            <p style="font-size: 13px; opacity: 0.7;">${orderNumber}</p>
          </div>
          <p><strong>${customerName}</strong><br/>${customerEmail}</p>
          <table style="width:100%;">${itemsList}</table>
          <p>📍 ${shippingAddress}</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders/${order?.id}" style="display: inline-block; background: #1c1917; color: white; padding: 10px 20px; border-radius: 24px; text-decoration: none;">Voir dans l'admin</a>
        </div>`,
    });
  }

  return NextResponse.json({ received: true });
}