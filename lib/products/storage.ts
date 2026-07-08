import { supabase } from "@/lib/db";

const BUCKET_NAME = "products";
const FOLDER = "product-images";

export async function uploadProductImages(
  files: File[]
): Promise<{ path: string }[]> {
  const uploads = files.map(async (file) => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `${FOLDER}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    return { path: data.path };
  });

  return Promise.all(uploads);
}

export async function deleteProductImages(paths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(paths);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}