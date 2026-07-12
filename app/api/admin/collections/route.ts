import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getCollections } from "@/lib/collections/queries";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/lib/collections/mutations";

export async function GET(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-collections-get", {
    windowMs: 60_000,
    maxRequests: 60,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  const collections = await getCollections();
  return NextResponse.json(collections);
}

export async function POST(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-collections-post", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const collection = await createCollection(body);
    revalidatePath("/admin/collections");
    revalidatePath("/");
    revalidatePath("/boutique");
    return NextResponse.json(collection, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-collections-put", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...data } = body;
    const collection = await updateCollection(id, data);
    revalidatePath("/admin/collections");
    revalidatePath("/");
    revalidatePath("/boutique");
    return NextResponse.json(collection);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-collections-delete", {
    windowMs: 60_000,
    maxRequests: 20,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "id manquant" }, { status: 400 });
    }

    await deleteCollection(id);
    revalidatePath("/admin/collections");
    revalidatePath("/");
    revalidatePath("/boutique");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
