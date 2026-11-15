import { NextRequest, NextResponse } from "next/server";
import { getProductsList } from "@/lib/products/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPage = Number(searchParams.get("page") || 1);
    const requestedPageSize = Number(searchParams.get("pageSize") || 50);
    const requestedSortField = searchParams.get("sortField") || "created_at";
    const requestedSortDirection = searchParams.get("sortDirection") || "desc";
    const sortFields = ["name", "price", "stock", "created_at"] as const;

    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 || requestedPage > 10000) {
      return NextResponse.json({ error: "Page invalide." }, { status: 400 });
    }
    if (!Number.isSafeInteger(requestedPageSize) || requestedPageSize < 1 || requestedPageSize > 50) {
      return NextResponse.json({ error: "Taille de page invalide." }, { status: 400 });
    }
    if (!sortFields.includes(requestedSortField as (typeof sortFields)[number])) {
      return NextResponse.json({ error: "Tri invalide." }, { status: 400 });
    }
    if (requestedSortDirection !== "asc" && requestedSortDirection !== "desc") {
      return NextResponse.json({ error: "Sens de tri invalide." }, { status: 400 });
    }
    const search = searchParams.get("search") || "";
    if (search.length > 100) {
      return NextResponse.json({ error: "Recherche trop longue." }, { status: 400 });
    }
    
    const options = {
      page: requestedPage,
      pageSize: requestedPageSize,
      search,
      status: "active" as const, 
      collection: searchParams.get("collection") || "all",
      category: searchParams.get("category") || "all",
      sortField: requestedSortField as (typeof sortFields)[number],
      sortDirection: requestedSortDirection as "asc" | "desc",
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
