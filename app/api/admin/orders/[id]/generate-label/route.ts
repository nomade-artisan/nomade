import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";

import { Boxtal } from "@/lib/boxtal";
import { createClient } from "@supabase/supabase-js";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    // récupérer la commande
    const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !order) {

        return NextResponse.json(
            { error: "Commande introuvable" },
            { status: 404 }
        );

    }

    if (order.status !== "confirmed") {

        return NextResponse.json(
            { error: "La commande doit être confirmée." },
            { status: 400 }
        );

    }

    const response = await Boxtal.generateLabel(order);

    return NextResponse.json(response);

}