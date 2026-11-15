import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, getProductRating, createReview } from "@/lib/products/queries";
import { enforceRateLimit } from "@/lib/security/rate-limit";

// GET : récupérer les avis + note d'un produit
export async function GET(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "reviews-get", {
    windowMs: 60_000,
    maxRequests: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("productId"));

    if (!Number.isSafeInteger(productId) || productId <= 0) {
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
  const rateLimitError = await enforceRateLimit(request, "reviews-post", {
    windowMs: 10 * 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const rawBody = await request.text();
    if (rawBody.length > 8192) {
      return NextResponse.json({ error: "RequÃªte trop volumineuse." }, { status: 413 });
    }
    const body = JSON.parse(rawBody);
    const { product_id, user_name, rating, comment } = body;

    if (!product_id || !rating || !comment) {
      return NextResponse.json(
        { error: "product_id, rating et comment sont requis" },
        { status: 400 }
      );
    }

    if (!Number.isSafeInteger(Number(product_id)) || Number(product_id) <= 0) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 });
    }

    if (typeof comment !== "string" || comment.trim().length < 3 || comment.length > 2000) {
      return NextResponse.json(
        { error: "Le commentaire doit faire au moins 3 caractères" },
        { status: 400 }
      );
    }

    const review = await createReview({
      product_id,
      user_name: typeof user_name === "string" ? user_name.trim().slice(0, 80) || "Anonyme" : "Anonyme",
      rating,
      comment: comment.trim(),
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
