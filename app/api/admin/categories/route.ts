import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/categories/queries";
import { createCategory, updateCategory, deleteCategory } from "@/lib/categories/mutations";
import { revalidatePath } from "next/cache";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await createCategory(body);
    revalidatePath("/admin/categories");
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const category = await updateCategory(id, data);
    revalidatePath("/admin/categories");
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

    await deleteCategory(id);
    revalidatePath("/admin/categories");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}