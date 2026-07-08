import { NextResponse } from "next/server";
import { testBoxtalConnection } from "@/lib/boxtal/auth";

export async function GET() {
  try {
    const data = await testBoxtalConnection();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
  console.log(error.response?.status);
  console.log(error.response?.headers);
  console.log(error.response?.config?.url);
  console.log(error.response?.data);

  return NextResponse.json(error.response?.data);
}
}