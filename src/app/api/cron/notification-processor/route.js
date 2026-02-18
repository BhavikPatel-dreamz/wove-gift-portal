import { NextResponse } from "next/server";
import { processNotificationsQueue } from "../../../../lib/action/Notificationprocessorcron";
import { validateCronRequest } from "../../../../lib/cronAuth";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  const authErrorResponse = validateCronRequest(request);
  if (authErrorResponse) return authErrorResponse;

  try {
    const result = await processNotificationsQueue();

    return NextResponse.json({
      success: Boolean(result?.success),
      job: "notification-processor",
      executedAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[CRON][notification-processor] Unhandled error:", error);

    return NextResponse.json(
      {
        success: false,
        job: "notification-processor",
        executedAt: new Date().toISOString(),
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
