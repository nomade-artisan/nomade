import { NextRequest, NextResponse } from "next/server";
import { createCompleteProduct, updateCompleteProduct } from "@/lib/products/services";
import { generateSlug } from "@/lib/products/queries";
import type { ProductFormState } from "@/lib/products/types";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasRequiredSpec(details: string[]): boolean {
  const requiredKeys = ["matiere", "dimensions"];

  return details.some((item) => {
    const [rawKey] = item.split(":");
    if (!rawKey) return false;
    const normalized = normalizeForComparison(rawKey);
    return requiredKeys.some((required) => required === normalized);
  });
}

function validateRequiredProductFields(input: {
  name: string;
  description: string;
  categoryId: number | null;
  price: number;
  stock: number;
  details: string[];
  totalImageCount: number;
}): string | null {
  if (!input.name.trim()) return "Le nom du produit est obligatoire.";
  if (!input.description.trim()) return "La description est obligatoire.";
  if (!input.categoryId) return "La categorie est obligatoire.";
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return "Le prix doit etre superieur a 0.";
  }
  if (!Number.isFinite(input.stock) || input.stock < 0) {
    return "Le stock doit etre superieur ou egal a 0.";
  }
  if (input.totalImageCount <= 0) return "Au moins une image est obligatoire.";
  if (input.details.length === 0) return "Ajoute au moins une caracteristique produit.";
  if (!hasRequiredSpec(input.details)) {
    return "Ajoute au minimum une matiere ou des dimensions dans les caracteristiques.";
  }
  return null;
}


export async function POST(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-products-post", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    // Extraire les données
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const collectionId = formData.get("collectionId") ? Number(formData.get("collectionId")) : null;
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

    const validationError = validateRequiredProductFields({
      name,
      description,
      categoryId,
      price,
      stock,
      details,
      totalImageCount: images.length,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Générer le slug
    const slug = generateSlug(name);

    // Préparer les données
    const productData: ProductFormState = {
      name,
      slug,
      description,
      collectionId,
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


export async function PUT(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-products-put", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

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
    const collectionId = formData.get("collectionId") ? Number(formData.get("collectionId")) : null;
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

    const validationError = validateRequiredProductFields({
      name,
      description,
      categoryId,
      price,
      stock,
      details,
      totalImageCount: images.length + existingUrls.length,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Générer le slug
    const slug = generateSlug(name);

    // Préparer les données
    const productData: ProductFormState = {
      name,
      slug,
      description,
      collectionId,
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

export async function DELETE(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "admin-products-delete", {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

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