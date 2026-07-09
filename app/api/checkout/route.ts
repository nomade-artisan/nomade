import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Panier vide" },
        { status: 400 }
      );
    }

    // Vérification du stock réel
    for (const item of items) {
      if (item.id === "shipping") continue;

      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          {
            error: `Le produit "${item.name}" n'existe plus.`,
          },
          { status: 400 }
        );
      }

      if (product.stock <= 0) {
        return NextResponse.json(
          {
            outOfStock: true,
            products: [
              {
                id: product.id,
                name: product.name,
                stock: 0,
              },
            ],
          },
          { status: 409 }
        );
      }

      if (item.quantity > product.stock) {
        return NextResponse.json(
          {
            outOfStock: true,
            products: [
              {
                id: product.id,
                name: product.name,
                stock: product.stock,
              },
            ],
          },
          { status: 409 }
        );
      }
    }

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

  line_items: items.map((item: any) => ({
    price_data: {
      currency: "eur",

      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },

      unit_amount: Math.round(item.price * 100),
    },

    quantity: item.quantity,
  })),

  metadata: {
    product_ids: items
      .filter((item: any) => item.id !== "shipping")
      .map((item: any) => item.id)
      .join(","),

    quantities: items
      .filter((item: any) => item.id !== "shipping")
      .map((item: any) => item.quantity)
      .join(","),
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