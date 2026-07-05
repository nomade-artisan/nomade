import { NextRequest, NextResponse } from "next/server";
import { getProductsList } from "@/lib/products/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 50,
      search: searchParams.get("search") || "",
      status: "active" as const, 
      category: searchParams.get("category") || "all",
      sortField: (searchParams.get("sortField") as any) || "created_at",
      sortDirection: (searchParams.get("sortDirection") as any) || "desc",
    };

    const result = await getProductsList(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API products error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}