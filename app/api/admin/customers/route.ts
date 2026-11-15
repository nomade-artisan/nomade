import { NextRequest, NextResponse } from "next/server";
import { getCustomersList } from "@/lib/customers/queries";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";

export async function GET(request: NextRequest) {
  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || undefined;

    const result = await getCustomersList(page, pageSize, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET customers error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
