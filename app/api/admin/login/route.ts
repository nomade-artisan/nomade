import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
} from "@/lib/security/admin-session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = getAdminSessionSecret();

    if (!adminPassword || !sessionSecret) {
      return NextResponse.json(
        { error: "Configuration admin manquante" },
        { status: 503 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { error: "Mot de passe invalide" },
        { status: 401 }
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionSecret,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Requete invalide" },
      { status: 400 }
    );
  }
}
