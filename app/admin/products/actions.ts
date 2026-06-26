"use server";

import { redirect } from "next/navigation";

import { createProduct } from "@/lib/products/mutations";

import {
  ProductFormState,
} from "@/components/admin/products/types";

export async function createProductAction(
  product: ProductFormState
) {
  await createProduct(product);

  redirect("/admin/products");
}