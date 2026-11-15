import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

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
