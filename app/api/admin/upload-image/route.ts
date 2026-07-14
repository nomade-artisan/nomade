import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucune image reçue." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image trop volumineuse (10 Mo max)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Compression
    const compressed = await sharp(buffer)
      .rotate() // respecte l'orientation EXIF
      .resize({
        width: 1800,
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 6,
      })
      .toBuffer();

    const fileName = `${randomUUID()}.webp`;

    const { error } = await supabaseAdmin.storage
      .from("collections")
      .upload(fileName, compressed, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabaseAdmin.storage
      .from("collections")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      publicUrl: data.publicUrl,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Erreur lors de la compression.",
      },
      {
        status: 500,
      }
    );
  }
}