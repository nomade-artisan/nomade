import { NextRequest, NextResponse } from "next/server";
import { createCompleteProduct, updateCompleteProduct } from "@/lib/products/services";
import { generateSlug } from "@/lib/products/queries";
import type { ProductFormState } from "@/lib/products/types";

// ─── Création ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extraire les données
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const status = formData.get("status") as "draft" | "active" | "archived";
    const isNew = formData.get("isNew") === "true";
    const detailsString = formData.get("details") as string;
    const details = detailsString ? JSON.parse(detailsString) : [];

    // Gérer les images
    const images: ProductFormState["images"] = [];
    const imageFiles = formData.getAll("images") as File[];
    const coverImageIndex = Number(formData.get("coverImageIndex") || 0);

    imageFiles.forEach((file, index) => {
      if (file && file.size > 0) {
        images.push({
          id: `${Date.now()}-${index}`,
          file,
          preview: "",
          isCover: index === coverImageIndex,
        });
      }
    });

    // Générer le slug
    const slug = generateSlug(name);

    // Préparer les données
    const productData: ProductFormState = {
      name,
      slug,
      description,
      categoryId,
      price,
      stock,
      status,
      isNew,
      details,
      images,
    };

    // Créer le produit
    const product = await createCompleteProduct(productData);

    return NextResponse.json(
      { message: "Produit créé avec succès", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ─── Modification ────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productId = Number(formData.get("productId"));
    if (!productId) {
      return NextResponse.json({ error: "productId manquant" }, { status: 400 });
    }

    // Récupérer les URLs existantes
    const existingUrlsString = formData.get("existingUrls") as string;
    const existingUrls: string[] = existingUrlsString ? JSON.parse(existingUrlsString) : [];

    // Extraire les données
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const status = formData.get("status") as "draft" | "active" | "archived";
    const isNew = formData.get("isNew") === "true";
    const detailsString = formData.get("details") as string;
    const details = detailsString ? JSON.parse(detailsString) : [];

    // Gérer les nouvelles images
    const images: ProductFormState["images"] = [];
    const imageFiles = formData.getAll("images") as File[];
    const coverImageIndex = Number(formData.get("coverImageIndex") || 0);

    imageFiles.forEach((file, index) => {
      if (file && file.size > 0) {
        images.push({
          id: `${Date.now()}-${index}`,
          file,
          preview: "",
          isCover: index === coverImageIndex,
        });
      }
    });

    // Générer le slug
    const slug = generateSlug(name);

    // Préparer les données
    const productData: ProductFormState = {
      name,
      slug,
      description,
      categoryId,
      price,
      stock,
      status,
      isNew,
      details,
      images,
    };

    // Mettre à jour le produit
    const product = await updateCompleteProduct(productId, productData, existingUrls);

    return NextResponse.json(
      { message: "Produit modifié avec succès", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
// ─── Suppression ────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("id"));

    if (!productId) {
      return NextResponse.json({ error: "id manquant" }, { status: 400 });
    }

    const { deleteCompleteProduct } = await import("@/lib/products/services");
    await deleteCompleteProduct(productId);

    return NextResponse.json(
      { message: "Produit supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}