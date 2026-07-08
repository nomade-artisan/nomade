import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, getProductRating, createReview } from "@/lib/products/queries";

// GET : récupérer les avis + note d'un produit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("productId"));

    if (!productId) {
      return NextResponse.json({ error: "productId manquant" }, { status: 400 });
    }

    const [reviews, ratingData] = await Promise.all([
      getProductReviews(productId),
      getProductRating(productId),
    ]);

    return NextResponse.json({
      reviews,
      rating: ratingData.rating,
      totalReviews: ratingData.reviews,
      distribution: ratingData.distribution,
    });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : créer un avis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, user_name, rating, comment } = body;

    if (!product_id || !rating || !comment) {
      return NextResponse.json(
        { error: "product_id, rating et comment sont requis" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 });
    }

    if (comment.length < 3) {
      return NextResponse.json(
        { error: "Le commentaire doit faire au moins 3 caractères" },
        { status: 400 }
      );
    }

    const review = await createReview({
      product_id,
      user_name: user_name || "Anonyme",
      rating,
      comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}