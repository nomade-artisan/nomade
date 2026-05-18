// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product_id");
  
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { product_id, customer_name, rating, comment } = await req.json();

  if (!product_id || !customer_name || !rating) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([{ product_id, customer_name, rating, comment }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mettre à jour la note moyenne du produit
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", product_id);

  if (reviews) {
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await supabase
      .from("products")
      .update({ rating: Math.round(avgRating * 10) / 10, reviews: reviews.length })
      .eq("id", product_id);
  }

  return NextResponse.json(data);
}