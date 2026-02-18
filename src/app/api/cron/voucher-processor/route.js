import { NextResponse } from "next/server";
import { processVouchersQueue } from "../../../../lib/action/cronProcessor";
import { validateCronRequest } from "../../../../lib/cronAuth";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  const authErrorResponse = validateCronRequest(request);
  if (authErrorResponse) return authErrorResponse;

  try {
    const result = await processVouchersQueue();

    return NextResponse.json({
      success: Boolean(result?.success),
      job: "voucher-processor",
      executedAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[CRON][voucher-processor] Unhandled error:", error);

    return NextResponse.json(
      {
        success: false,
        job: "voucher-processor",
        executedAt: new Date().toISOString(),
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
