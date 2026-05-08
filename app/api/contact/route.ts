// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Email invalide." },
        { status: 400 }
      );
    }

    // Sauvegarde dans Supabase
    const { error: dbError } = await supabase
      .from("contacts")
      .insert([{ name, email, message }]);

    if (dbError) {
      console.error("Erreur Supabase:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du message." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès.",
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}