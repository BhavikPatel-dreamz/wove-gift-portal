import { NextResponse } from "next/server";

/**
 * Health check endpoint for DigitalOcean App Platform.
 * Returns a lightweight 200 OK without hitting the database,
 * so App Platform load balancer probes stay fast and reliable.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
