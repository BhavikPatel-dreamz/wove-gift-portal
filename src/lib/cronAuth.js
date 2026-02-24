import { NextResponse } from "next/server";

/**
 * Validate Vercel Cron requests using Authorization: Bearer <CRON_SECRET>.
 * Returns a NextResponse when unauthorized, otherwise null.
 */
export function validateCronRequest(request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV !== "production") {
      return null;
    }

    return NextResponse.json(
      { success: false, message: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const authorizationHeader = request.headers.get("authorization");
  if (authorizationHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized cron request" },
      { status: 401 }
    );
  }

  return null;
}
