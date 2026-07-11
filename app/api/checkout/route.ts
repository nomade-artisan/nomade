import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/client";
import { validatePromoCode } from "@/lib/promotions";

function parseEnvNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(req: NextRequest) {
  try {
    
    const { items, promoCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Panier vide" },
        { status: 400 }
      );
    }

    const productItems = items.filter((item: any) => item.id !== "shipping");

    if (productItems.length === 0) {
      return NextResponse.json(
        { error: "Aucun produit valide dans le panier." },
        { status: 400 }
      );
    }

    const productIds = productItems.map((item: any) => Number(item.id));
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

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
      image?: string;
    }> = [];

    // Vérification du stock réel et reconstruction des prix côté serveur
    for (const item of productItems) {
      const numericId = Number(item.id);
      const quantity = Number(item.quantity);
      const product = productById.get(numericId);

      if (!product) {
        return NextResponse.json(
          {
            error: `Le produit \"${item.name}\" n'existe plus.`,
          },
          { status: 400 }
        );
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
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
        image: typeof item.image === "string" ? item.image : undefined,
      });
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
    const shippingCost = parseEnvNumber(
      process.env.NEXT_PUBLIC_SHIPPING_COST,
      7
    );
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;

    let promoDiscount = 0;
    let normalizedPromoCode = "";
    let stripePromotionCodeId: string | undefined;
    let promoId: number | undefined;

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
            images: item.image ? [item.image] : [],
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

    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],

  mode: "payment",

  invoice_creation: {
    enabled: true,
  },

  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,

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