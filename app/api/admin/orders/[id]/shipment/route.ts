import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: shipment, error } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .eq("order_id", id)
    .maybeSingle();

  if (error) {
    console.error("Erreur lecture shipment API:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le shipment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ shipment: shipment ?? null });
}
