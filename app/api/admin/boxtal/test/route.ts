import { NextRequest, NextResponse } from "next/server";
import { testBoxtalConnection } from "@/lib/boxtal/auth";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { blockInProductionUnlessEnabled } from "@/lib/security/route-guards";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const disabledError = blockInProductionUnlessEnabled("ENABLE_BOXTAL_TEST_ENDPOINT");
  if (disabledError) return disabledError;

  const rateLimitError = await enforceRateLimit(request, "boxtal-test", {
    windowMs: 60_000,
    maxRequests: 10,
  });
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuthorization(request);
  if (authError) return authError;

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