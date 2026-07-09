import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";

function verifySignature(
    body: string,
    signature: string
) {

    const secret = process.env.BOXTAL_WEBHOOK_SECRET!;
    
    const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    return expected === signature;

}

export async function POST(req: NextRequest) {

    console.log("🔥 BOXTAL WEBHOOK RECEIVED");

    const rawBody = await req.text();

    console.log(rawBody);
    const signature = req.headers.get("x-bxt-signature");

    if (!signature) {

        return NextResponse.json(
            { error: "Missing signature" },
            { status: 401 }
        );

    }

    if (!verifySignature(rawBody, signature)) {

        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );

    }

    const payload = JSON.parse(rawBody);

    switch (payload.type) {

        case "DOCUMENT_CREATED":

            await handleDocumentCreated(
                supabase,
                payload
            );

            break;

        case "TRACKING_CHANGED":

            await handleTrackingChanged(
                supabase,
                payload
            );

            break;

    }

    return NextResponse.json({
        received: true
    });

}

async function handleDocumentCreated(
    supabase: any,
    payload: any
) {

    const document =
        payload.payload.documents[0];

    await supabase
        .from("shipments")
        .update({

            label_url: document.url,

            updated_at: new Date()

        })
        .eq(
            "shipping_order_id",
            payload.shippingOrderId
        );

}

async function handleTrackingChanged(
    supabase: any,
    payload: any
) {

    const tracking =
        payload.payload.trackings[0];

    await supabase
        .from("shipments")
        .update({

            tracking_number:
                tracking.trackingNumber,

            tracking_url:
                tracking.packageTrackingUrl,

            status:
                tracking.status,

            updated_at:
                new Date()

        })
        .eq(
            "shipping_order_id",
            payload.shippingOrderId
        );

}