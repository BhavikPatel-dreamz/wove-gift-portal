import { NextResponse } from "next/server";
import sendScheduledReports from "../../../../../scripts/send-scheduled-reports.js";
import { validateCronRequest } from "../../../../lib/cronAuth";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  const authErrorResponse = validateCronRequest(request);
  if (authErrorResponse) return authErrorResponse;

  try {
    const result = await sendScheduledReports();

    return NextResponse.json({
      success: !result?.error,
      job: "scheduled-reports",
      executedAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[CRON][scheduled-reports] Unhandled error:", error);

    return NextResponse.json(
      {
        success: false,
        job: "scheduled-reports",
        executedAt: new Date().toISOString(),
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
