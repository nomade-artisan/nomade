// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { sendOrderConfirmedEmail } from "@/lib/email/order-confirmed";
import { sendOrderRefundedEmail } from "@/lib/email/order-refunded";
import Stripe from "stripe";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL;

function escapeHtml(value: unknown) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>\"']/g, (character) => entities[character]);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook Stripe non configuré" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("❌ Signature webhook invalide:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

    // --- Idempotence ---
  const eventKey = `stripe:event:${event.id}`;
  const claim = await redis.set(eventKey, "processing", { nx: true, ex: 300 });
  if (!claim) {
    const currentState = await redis.get(eventKey);
    if (currentState === "processed") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }
    return NextResponse.json({ error: "Traitement déjà en cours" }, { status: 409 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Récupération des détails de livraison
    const resolvedSession = (await stripe.checkout.sessions.retrieve(
      session.id
    )) as any;
    const shippingAddress =
      session?.shipping_details?.address ||
      session?.collected_information?.shipping_details?.address ||
      resolvedSession?.shipping_details?.address ||
      (resolvedSession as any)?.collected_information?.shipping_details?.address ||
      session?.customer_details?.address ||
      resolvedSession?.customer_details?.address ||
      null;
    const shippingPhone =
      session?.shipping_details?.phone ||
      resolvedSession?.shipping_details?.phone ||
      session?.customer_details?.phone ||
      resolvedSession?.customer_details?.phone ||
      "";
    const shippingName =
      session?.shipping_details?.name ||
      resolvedSession?.shipping_details?.name ||
      session?.customer_details?.name ||
      resolvedSession?.customer_details?.name ||
      "";

    // Métadonnées produits
    const productIds: string[] = session.metadata?.product_ids?.split(",") || [];
    const quantities: number[] = session.metadata?.quantities?.split(",").map(Number) || [];
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

    if (!paymentIntentId || productIds.length === 0 || productIds.length !== quantities.length) {
      await redis.del(eventKey);
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 500 });
    }

    const stockItems = productIds.map((id, index) => ({
      id: Number(id),
      quantity: quantities[index],
    }));
    if (stockItems.some((item) => !Number.isSafeInteger(item.id) || item.id <= 0 || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
      await redis.del(eventKey);
      return NextResponse.json({ error: "Quantités de commande invalides" }, { status: 500 });
    }

    const { error: stockError } = await supabaseAdmin.rpc("reserve_products_for_payment", {
      p_payment_intent_id: paymentIntentId,
      p_items: stockItems,
    });
    if (stockError) {
      if (/Insufficient product stock/i.test(stockError.message)) {
        try {
          await stripe.refunds.create(
            { payment_intent: paymentIntentId },
            { idempotencyKey: `stock-refund-${event.id}` }
          );
          await redis.set(eventKey, "processed", { ex: 7 * 24 * 60 * 60 });
          const email = session.customer_details?.email;
          if (email) {
            try {
              await sendOrderRefundedEmail({
                to: email,
                customerName: shippingName || "Client",
                orderNumber: session.id,
                total: (session.amount_total || 0) / 100,
              });
            } catch (emailError) {
              console.error("Impossible d'envoyer l'email de remboursement:", emailError);
            }
          }
          return NextResponse.json({ received: true, refunded: true });
        } catch (refundError) {
          console.error("Remboursement automatique impossible:", refundError);
          await redis.del(eventKey);
          return NextResponse.json({ error: "Remboursement à traiter manuellement" }, { status: 500 });
        }
      }

      console.error("Réservation de stock impossible:", stockError);
      await redis.del(eventKey);
      return NextResponse.json({ error: "Réservation de stock impossible" }, { status: 500 });
    }
    // Line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const generatedOrderNumber = "NOM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const totalAmount = (session.amount_total || 0) / 100;
    const shippingAmount = (session.total_details?.amount_shipping || session.shipping_cost?.amount_total || 0) / 100;
    const discountAmount = (session.total_details?.amount_discount || 0) / 100;
    const subtotal = totalAmount - shippingAmount + discountAmount;
    const appliedPromoCode =
      typeof session.metadata?.promo_code === "string" && session.metadata.promo_code.trim()
        ? session.metadata.promo_code.trim().toUpperCase()
        : null;

    const customerName = shippingName || session.customer_details?.name || "";
    const [firstName = "", ...rest] = customerName.trim().split(/\s+/);
    const lastName = rest.join(" ");

    // Création de la commande
    const { data: insertedOrder, error: insertError } = await supabaseAdmin
      .from("orders")
      .upsert({
        customer_id: null,
        status: "confirmed",
        subtotal: subtotal,
        shipping: shippingAmount,
        discount_amount: discountAmount,
        promo_code: appliedPromoCode,
        total: totalAmount,
        shipping_address: shippingAddress
          ? {
              firstName,
              lastName,
              email: session.customer_details?.email ?? "",
              phone: shippingPhone || session.customer_details?.phone || "",
              line1: shippingAddress.line1 || "",
              line2: shippingAddress.line2 || "",
              city: shippingAddress.city || "",
              postal_code: shippingAddress.postal_code || "",
              country: shippingAddress.country || "",
            }
          : {
              firstName,
              lastName,
              email: session.customer_details?.email ?? "",
              phone: shippingPhone || session.customer_details?.phone || "",
            },
        notes: `Commande passée via Stripe`,
        payment_intent_id: paymentIntentId,
      order_number: generatedOrderNumber,
      }, { onConflict: "payment_intent_id", ignoreDuplicates: true })
      .select("id, customer_id, order_number")
      .maybeSingle();

    let order = insertedOrder;
    let orderError = insertError;
    if (!order && !orderError) {
      const existing = await supabaseAdmin
        .from("orders")
        .select("id, customer_id, order_number")
        .eq("payment_intent_id", paymentIntentId)
        .maybeSingle();
      order = existing.data;
      orderError = existing.error;
    }
    const isNewOrder = Boolean(insertedOrder);
    let orderNumber = generatedOrderNumber;

    if (orderError || !order) {
      await redis.del(eventKey);
      return NextResponse.json({ error: 'Enregistrement de commande impossible' }, { status: 500 });
    } else {
      orderNumber = order.order_number || generatedOrderNumber;
      // Persistance promo (sécurité)
      const { error: promoTraceError } = await supabaseAdmin
        .from("orders")
        .update({
          discount_amount: discountAmount,
          promo_code: appliedPromoCode,
        })
        .eq("id", order.id);
      if (promoTraceError) {
        console.error("❌ Erreur persistance trace promo sur order:", promoTraceError);
      }

      // Order items
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

      // ✅ Correction : on ne garde que les items avec un product_id valide (> 0)
      const validOrderItems = orderItems.filter((oi) => oi.product_id > 0);
      if (validOrderItems.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from("order_items")
          .upsert(validOrderItems, { onConflict: "order_id,product_id" });
        if (itemsError) {
          await redis.del(eventKey);
          return NextResponse.json({ error: 'Enregistrement des articles impossible' }, { status: 500 });
        }
      }

      // Tracking
      const { error: trackingError } = await supabaseAdmin.from("order_tracking").insert({
        order_id: order.id,
        status: "confirmed",
        comment: "Paiement validé via Stripe",
      });
      if (trackingError) console.error("Tracking commande non enregistré:", trackingError);

      // Gestion client
      const customerEmail = session.customer_details?.email || session.customer?.email || "";
      if (customerEmail && !order.customer_id) {
        const normalizedEmail = customerEmail.toLowerCase().trim();
        const nameParts = customerName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: existingCustomer, error: lookupError } = await supabaseAdmin
          .from("customers")
          .select("id, first_name, last_name, phone, address, total_orders, total_spent")
          .eq("email", normalizedEmail)
          .single();

        if (lookupError && lookupError.code !== "PGRST116") {
          console.error("❌ Erreur lookup client :", lookupError);
        }

        if (existingCustomer) {
          await supabaseAdmin
            .from("customers")
            .update({
              first_name: firstName || existingCustomer.first_name,
              last_name: lastName || existingCustomer.last_name,
              phone: shippingPhone || existingCustomer.phone,
              address: shippingAddress
                ? {
                    line1: shippingAddress.line1 || "",
                    line2: shippingAddress.line2 || "",
                    city: shippingAddress.city || "",
                    postal_code: shippingAddress.postal_code || "",
                    country: shippingAddress.country || "",
                  }
                : existingCustomer.address,
              total_orders: existingCustomer.total_orders + 1,
              total_spent: existingCustomer.total_spent + totalAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCustomer.id);

          await supabaseAdmin
            .from("orders")
            .update({ customer_id: existingCustomer.id })
            .eq("id", order.id);
        } else {
          const { data: newCustomer, error: customerError } = await supabaseAdmin
            .from("customers")
            .insert({
              email: normalizedEmail,
              first_name: firstName,
              last_name: lastName,
              phone: shippingPhone || null,
              address: shippingAddress
                ? {
                    line1: shippingAddress.line1 || "",
                    line2: shippingAddress.line2 || "",
                    city: shippingAddress.city || "",
                    postal_code: shippingAddress.postal_code || "",
                    country: shippingAddress.country || "",
                  }
                : null,
              total_orders: 1,
              total_spent: totalAmount,
            })
            .select("id")
            .single();

          if (newCustomer && !customerError) {
            await supabaseAdmin
              .from("orders")
              .update({ customer_id: newCustomer.id })
              .eq("id", order.id);
    } else {
            console.error("❌ Erreur création client :", customerError);
          }
        }
      }

      // Analytics : 1 événement par produit pour pouvoir agréger proprement par produit.
      const purchaseAnalyticsRows = productIds.map((productId, index) => ({
        event_type: "purchase_completed",
        session_id: session.id,
        product_id: String(productId),
        metadata: {
          amount: totalAmount,
          shipping: shippingAmount,
          discount: discountAmount,
          product_index: index,
          quantity: Number(quantities[index] ?? 1),
        },
      }));

      if (purchaseAnalyticsRows.length > 0) {
        const { data: existingPurchaseEvents, error: purchaseLookupError } = await supabaseAdmin
          .from("analytics_events")
          .select("id")
          .eq("event_type", "purchase_completed")
          .eq("session_id", session.id)
          .limit(1);

        if (purchaseLookupError) {
          console.error("Analytics purchase lookup failed:", purchaseLookupError);
        } else if (!existingPurchaseEvents?.length) {
          const { error: analyticsError } = await supabaseAdmin
            .from("analytics_events")
            .insert(purchaseAnalyticsRows);

          if (analyticsError) {
            console.error("Analytics purchase rows failed:", analyticsError);
          }
        }
      }

      // Incrémenter l'utilisation du code promo
      const promoIdRaw = session.metadata?.promo_id;
      const promoCodeRaw = session.metadata?.promo_code;
      const promoId = promoIdRaw ? Number(promoIdRaw) : NaN;
      if (isNewOrder && (Number.isFinite(promoId) || promoCodeRaw)) {
        let promoCodeRecord: { id: number; used_count: number } | null = null;
        if (Number.isFinite(promoId)) {
          const { data, error } = await supabaseAdmin
            .from("promo_codes")
            .select("id, used_count")
            .eq("id", promoId)
            .maybeSingle();
          if (!error) promoCodeRecord = data;
        }
        if (!promoCodeRecord && promoCodeRaw) {
          const { data, error } = await supabaseAdmin
            .from("promo_codes")
            .select("id, used_count")
            .eq("code", String(promoCodeRaw).trim().toUpperCase())
            .maybeSingle();
          if (!error) promoCodeRecord = data;
        }
        if (promoCodeRecord) {
          await supabaseAdmin
            .from("promo_codes")
            .update({ used_count: (promoCodeRecord.used_count || 0) + 1 })
            .eq("id", promoCodeRecord.id);
        }
      }

      // Revalidation
      for (const id of productIds) {
        revalidatePath(`/boutique/${id}`);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin/customers");
      revalidatePath("/boutique");
      revalidatePath("/");
    }

    // --- Récupération de la facture Stripe ---
    let invoiceUrl: string | null = null;
    if (session.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(session.invoice as string);
        invoiceUrl = invoice.hosted_invoice_url || null;
      } catch (e) {
        console.warn("⚠️ Impossible de récupérer la facture :", e);
      }
    }

    // --- Email client ---
    const customerEmail = session.customer_details?.email || "";
    if (customerEmail && order) {
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
        subtotal: subtotal,
        shipping: shippingAmount,
        total: totalAmount,
        invoicePdfUrl: invoiceUrl,
      });
    }

    console.log("Metadata :", session.metadata);
    console.log("Product IDs :", productIds);
    console.log(
      "Stripe line items :",
      lineItems.data.map((i) => ({
        description: i.description,
        quantity: i.quantity,
      }))
    );

    // --- Email admin ---
    const itemsList = lineItems.data
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 8px 0; color: #44403c; font-size: 14px;">${escapeHtml(item.description)}</td>
            <td style="padding: 8px 0; color: #78716c; font-size: 14px; text-align: center;">x${item.quantity}</td>
            <td style="padding: 8px 0; color: #44403c; font-size: 14px; text-align: right;">${(item.amount_total / 100).toFixed(2)} €</td>
          </tr>`
      )
      .join("");

    const shippingAddressText = shippingAddress
      ? `${shippingAddress.line1 || ""}, ${shippingAddress.postal_code || ""} ${shippingAddress.city || ""}, ${shippingAddress.country || ""}`
      : "Adresse communiquée";

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
          <p><strong>${escapeHtml(customerName)}</strong><br/>${escapeHtml(customerEmail)}</p>
          <table style="width:100%;">${itemsList}</table>
          <p>📍 ${escapeHtml(shippingAddressText)}</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders/${order?.id}" style="display: inline-block; background: #1c1917; color: white; padding: 10px 20px; border-radius: 24px; text-decoration: none;">Voir dans l'admin</a>
        </div>`,
    });
  }

  // --- Marquer l'événement comme traité ---
  await redis.set(eventKey, "processed", { ex: 7 * 24 * 60 * 60 });

  return NextResponse.json({ received: true });
}
