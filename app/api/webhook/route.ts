// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/db";
import { Resend } from "resend";
import { sendOrderConfirmedEmail } from "@/lib/email/order-confirmed";
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

    // --- 1. Métadonnées produits ---
    const productIds: string[] =
      session.metadata?.product_ids?.split(",").filter(Boolean) || [];
    const quantities: number[] =
      session.metadata?.quantities?.split(",").map(Number).filter(Boolean) || [];

    // --- 2. Mise à jour des stocks (inchangée, mais on pourrait l'améliorer) ---
    const { data: products } = await supabase
      .from("products")
      .select("id, stock")
      .in("id", productIds.map(Number));

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
      .filter((u): u is { id: number; stock: number } => u !== null);

    await Promise.all(
      updates.map((u) =>
        supabase.from("products").update({ stock: u.stock }).eq("id", u.id)
      )
    );

    // --- 3. Récupération des line items ---
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const shipping = session.shipping_details || session.customer_details;
    const orderNumber = "NOM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const totalAmount = (session.amount_total || 0) / 100;

    // --- 4. Calcul du sous-total et des frais de port ---
    // Récupération du montant de la livraison
    const shippingAmount = (session.total_details?.amount_shipping || session.shipping_cost?.amount_total || 0) / 100;
    const subtotal = totalAmount - shippingAmount;

    const customerName = session.customer_details?.name ?? "";
    const [firstName = "", ...rest] = customerName.trim().split(/\s+/);
    const lastName = rest.join(" ");

    // --- 5. Création de la commande ---
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: null,
        status: "confirmed",
        subtotal: subtotal,        
        shipping: shippingAmount,
        total: totalAmount,
        shipping_address: shipping?.address
          ? {
              firstName,
              lastName,
              email: session.customer_details?.email ?? "",
              phone: shipping?.phone || session.customer_details?.phone || "",
              line1: shipping.address.line1,
              line2: shipping.address.line2 || "",
              city: shipping.address.city,
              postal_code: shipping.address.postal_code,
              country: shipping.address.country,
            }
          : {
              firstName,
              lastName,
              email: session.customer_details?.email ?? "",
              phone: shipping?.phone || session.customer_details?.phone || "",
            },
        notes: `Commande passée via Stripe`,
        payment_intent_id: session.payment_intent,
        order_number: orderNumber,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("❌ Erreur création commande :", orderError);
      // On continue quand même, mais on ne pourra pas envoyer d'email avec order.id
    } else {
      // --- 6. Insertion des order_items ---
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

      // --- 7. Tracking ---
      await supabase.from("order_tracking").insert({
        order_id: order.id,
        status: "confirmed",
        comment: "Paiement validé via Stripe",
      });

      // --- 8. Gestion client (inchangée) ---
      const customerEmail = session.customer_details?.email || session.customer?.email || "";
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

          await supabase
            .from("orders")
            .update({ customer_id: existingCustomer.id })
            .eq("id", order.id);
        } else {
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
      }

      // --- 9. Analytics ---
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

      // --- 10. Revalidation ---
      for (const id of productIds) {
        revalidatePath(`/boutique/${id}`);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin/customers");
      revalidatePath("/boutique");
      revalidatePath("/");
    }

    // --- 11. Récupération de la facture (si disponible) ---
    let invoiceUrl: string | null = null;
    if (session.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(session.invoice as string);
        invoiceUrl = invoice.hosted_invoice_url || null;
      } catch (e) {
        console.warn("⚠️ Impossible de récupérer la facture :", e);
      }
    }

    // --- 12. Envoi de l'email client via la fonction centralisée ---
    const customerEmail = session.customer_details?.email || "";
    if (customerEmail && order) {
      // Transformer les lineItems en items pour la fonction
      const itemsForEmail = lineItems.data.map((item: any) => ({
        name: item.description || "Produit",
        quantity: item.quantity || 1,
        price: (item.amount_total || 0) / 100 / (item.quantity || 1),
      }));

      await sendOrderConfirmedEmail({
        to: customerEmail,
        customerName: customerName || "Client",
        orderNumber,
        items: itemsForEmail,
        subtotal: subtotal,         // ✅ sous-total hors livraison
        shipping: shippingAmount,    // ✅ frais de port
        total: totalAmount,
        invoicePdfUrl: invoiceUrl,   // ✅ peut être null
      });
    }

    // --- 13. Email admin (inchangé) ---
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

    await resend.emails.send({
      from: `Nomade <${NOREPLY_EMAIL}>`,
      to: '${ADMIN_EMAIL}',
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