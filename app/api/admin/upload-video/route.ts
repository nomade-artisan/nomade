import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_SIZE = 20 * 1024 * 1024; // 20 Mo

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("video");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucune vidéo reçue." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une vidéo." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La vidéo dépasse 20 Mo." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${randomUUID()}.webm`;

    const { error } = await supabaseAdmin.storage
      .from("collections")
      .upload(fileName, buffer, {
        contentType: "video/webm",
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
            : "Erreur lors de l'upload.",
      },
      {
        status: 500,
      }
    );
  }
}