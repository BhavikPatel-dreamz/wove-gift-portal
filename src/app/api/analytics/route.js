import { NextResponse } from "next/server";
import {
  getDateRange,
  getBrandRedemptionMetrics,
  getSettlementData,
} from "../../../lib/analyticsUtils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "year";

    // Calculate date range
    const dateRange = getDateRange(period);

    // Fetch analytics data in parallel
    const [brandRedemptions, settlements] = await Promise.all([
      getBrandRedemptionMetrics(dateRange),
      getSettlementData(dateRange),
    ]);

    return NextResponse.json({
      success: true,
      brandRedemptions,
      settlements,
      period,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
