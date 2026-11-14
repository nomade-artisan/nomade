import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/client";
import { validatePromoCode } from "@/lib/promotions";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function parseEnvNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, "checkout", {
    windowMs: 60_000,
    maxRequests: 20,
  });
  if (rateLimitError) return rateLimitError;

  try {
    
    let body: { items?: unknown; promoCode?: unknown };
    try {
      const contentLength = Number(req.headers.get("content-length") || 0);
      if (contentLength > 65536) {
        return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
      }
      const rawBody = await req.text();
      if (rawBody.length > 65536) {
        return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
      }
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "RequÃªte invalide." }, { status: 400 });
    }
    const { items, promoCode } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { error: "Panier vide" },
        { status: 400 }
      );
    }

    const rawProductItems = items.filter((item: any) => item?.id !== "shipping");

    if (rawProductItems.length === 0) {
      return NextResponse.json(
        { error: "Aucun produit valide dans le panier." },
        { status: 400 }
      );
    }

    const groupedItems = new Map<number, { id: number; quantity: number }>();
    for (const item of rawProductItems) {
      const id = Number(item?.id);
      const quantity = Number(item?.quantity);
      if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: "Produit ou quantité invalide." }, { status: 400 });
      }
      const totalQuantity = (groupedItems.get(id)?.quantity || 0) + quantity;
      if (!Number.isSafeInteger(totalQuantity)) {
        return NextResponse.json({ error: "Quantité invalide." }, { status: 400 });
      }
      groupedItems.set(id, { id, quantity: totalQuantity });
    }
    const productItems = [...groupedItems.values()];
    const productIds = productItems.map((item) => item.id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds)
      .eq("status", "active");

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Erreur lors de la verification des produits." },
        { status: 500 }
      );
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const unavailableProducts: Array<{ id: number; name: string; stock: number }> = [];
    const normalizedItems: Array<{
      id: number;
      name: string;
      unitPrice: number;
      quantity: number;
    }> = [];

    // Vérification du stock réel et reconstruction des prix côté serveur
    for (const item of productItems) {
      const numericId = Number(item.id);
      const quantity = Number(item.quantity);
      const product = productById.get(numericId);

      if (!product) {
        return NextResponse.json(
          {
            error: `Le produit ${numericId} n'existe plus.`,
          },
          { status: 400 }
        );
      }

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: `Quantite invalide pour \"${product.name}\".` },
          { status: 400 }
        );
      }

      if (product.stock <= 0) {
        unavailableProducts.push({
          id: product.id,
          name: product.name,
          stock: 0,
        });
        continue;
      }

      if (quantity > product.stock) {
        unavailableProducts.push({
          id: product.id,
          name: product.name,
          stock: product.stock,
        });
        continue;
      }

      normalizedItems.push({
        id: product.id,
        name: product.name,
        unitPrice: Number(product.price),
        quantity,
      });
    }

    if (normalizedItems.some((item) => !Number.isFinite(item.unitPrice) || item.unitPrice <= 0)) {
      return NextResponse.json({ error: "Un prix produit est invalide." }, { status: 500 });
    }

    if (unavailableProducts.length > 0) {
      return NextResponse.json(
        {
          outOfStock: true,
          products: unavailableProducts,
        },
        { status: 409 }
      );
    }

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const freeShippingThreshold = parseEnvNumber(
      process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD,
      120
    );
    const shippingCost = Math.max(0, parseEnvNumber(
      process.env.NEXT_PUBLIC_SHIPPING_COST,
      8.11
    ));
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;

    let promoDiscount = 0;
    let normalizedPromoCode = "";
    let stripePromotionCodeId: string | undefined;
    let promoId: number | undefined;

    if (typeof promoCode === "string" && promoCode.trim().length > 100) {
      return NextResponse.json({ error: "Code promo invalide." }, { status: 400 });
    }

    if (typeof promoCode === "string" && promoCode.trim()) {
      const promoResult = await validatePromoCode({
        promoCode,
        subtotal,
      });

      if (!promoResult.valid) {
        return NextResponse.json(
          {
            error: promoResult.message || "Code promo invalide.",
          },
          { status: 400 }
        );
      }

      if (!promoResult.stripePromotionCodeId) {
        return NextResponse.json(
          {
            error:
              "Code promo valide mais non configure dans Stripe. Ajoutez STRIPE_PROMOTION_CODE_NOMADE10.",
          },
          { status: 500 }
        );
      }

      promoDiscount = promoResult.discountAmount;
      normalizedPromoCode = promoResult.code;
      stripePromotionCodeId = promoResult.stripePromotionCodeId;
      promoId = promoResult.promoId;
    }

    const lineItems = [
      ...normalizedItems.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      ...(shipping > 0
        ? [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: "Livraison",
                },
                unit_amount: Math.round(shipping * 100),
              },
              quantity: 1,
            },
          ]
        : []),
    ];

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://scolta.nomade-artisan.fr").replace(/\/+$/, "");
    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],

  mode: "payment",

  invoice_creation: {
    enabled: true,
  },

  success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

  cancel_url: `${baseUrl}/cart`,

  shipping_address_collection: {
    allowed_countries: ["FR", "BE", "LU", "CH"],
  },

  phone_number_collection: {
    enabled: true,
  },

  locale: "fr",

  custom_text: {
    submit: {
      message: "Nous préparons votre commande avec soin.",
    },
  },

  line_items: lineItems,
  ...(stripePromotionCodeId
    ? {
        discounts: [
          {
            promotion_code: stripePromotionCodeId,
          },
        ],
      }
    : {}),

  metadata: {
    product_ids: normalizedItems
      .map((item) => item.id)
      .join(","),

    quantities: normalizedItems
      .map((item) => item.quantity)
      .join(","),
    promo_code: normalizedPromoCode,
    promo_id: promoId ? String(promoId) : "",
    promo_discount: promoDiscount.toFixed(2),
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
  },
});

    return NextResponse.json({
      url: session.url,
    });

  } catch (error: any) {
    console.error("Erreur Stripe:", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
