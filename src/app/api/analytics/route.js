import { NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "year";
    const brandId = searchParams.get("brandId");

    // Calculate date range
    const dateRange = getDateRange(period);

    // Fetch analytics data in parallel
    const [brandRedemptions, settlements] = await Promise.all([
      getBrandRedemptionMetrics(dateRange),
      getSettlementData(brandId),
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

// Helper function to get date range
function getDateRange(period) {
  const now = new Date();
  let start,
    end = now;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "all":
    default:
      start = null;
      end = null;
  }

  return { start, end };
}

// Build date filter for Prisma queries
function buildDateFilter(dateRange, field = "createdAt") {
  if (!dateRange.start || !dateRange.end) return {};

  return {
    [field]: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
}

// Get brand redemption metrics - formatted for frontend
async function getBrandRedemptionMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Get all active brands
  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      brandName: true,
      logo: true,
    },
    orderBy: {
      brandName: "asc",
    },
  });

  // Get redemption data for each brand
  const brandRedemptions = await Promise.all(
    brands.map(async (brand) => {
      // Count total voucher codes for this brand from completed orders
      const totalVouchers = await prisma.voucherCode.count({
        where: {
          order: {
            brandId: brand.id,
            ...dateFilter,
          },
        },
      });

      // Get all voucher codes with their redemption data
      const voucherCodesWithRedemptions = await prisma.voucherCode.findMany({
        where: {
          order: {
            brandId: brand.id,
            ...dateFilter,
          },
        },
        select: {
          id: true,
          isRedeemed: true,
          originalValue: true,
          remainingValue: true,
          _count: {
            select: {
              redemptions: true,
            },
          },
        },
      });

      // 💰 Calculate total issued (sum of original values)
      const totalIssuedValue = voucherCodesWithRedemptions.reduce(
        (sum, vc) => sum + vc.originalValue,
        0
      );

      // Count redeemed vouchers using multiple criteria
      const redeemedVouchers = voucherCodesWithRedemptions.filter((vc) => {
        // Check if voucher has any redemption records
        const hasRedemptionRecords = vc._count.redemptions > 0;

        // Check if marked as redeemed
        const isMarkedRedeemed = vc.isRedeemed === true;

        // Check if value has been used (remaining < original)
        const hasBeenUsed = vc.remainingValue < vc.originalValue;

        return hasRedemptionRecords || isMarkedRedeemed || hasBeenUsed;
      }).length;

      // 💰 Calculate total used (sum of used amounts for vouchers that have been redeemed or partially used)
      const totalUsedValue = voucherCodesWithRedemptions.reduce((sum, vc) => {
        const hasRedemptionRecords = vc._count.redemptions > 0;
        const isMarkedRedeemed = vc.isRedeemed === true;
        const hasBeenUsed = vc.remainingValue < vc.originalValue;

        // Only include used/partially redeemed vouchers
        if (hasRedemptionRecords || isMarkedRedeemed || hasBeenUsed) {
          const usedAmount = vc.originalValue - vc.remainingValue;
          return sum + usedAmount;
        }
        return sum;
      }, 0);

      // Calculate redemption rate
      const redemptionRate =
        totalVouchers > 0
          ? Math.round((totalUsedValue / totalIssuedValue) * 100)
          : 0;

      return {
        name: brand.brandName,
        logo: brand.logo || "🎁",
        redemptionRate,
        redeemed: redeemedVouchers,
        total: totalVouchers,
        brandId: brand.id,
      };
    })
  );

  // Filter out brands with no data and sort by redemption rate
  const filteredBrands = brandRedemptions
    .filter((b) => b.total > 0)
    .sort((a, b) => b.redemptionRate - a.redemptionRate)
    .slice(0, 8); // Top 8 brands

  // Assign background colors based on position
  const bgColors = [
    "bg-gray-100", // Position 1
    "bg-pink-50", // Position 2
    "bg-yellow-50", // Position 3
    "bg-red-50", // Position 4
    "bg-blue-50", // Position 5
    "bg-red-50", // Position 6
    "bg-gray-100", // Position 7
    "bg-orange-50", // Position 8
  ];

  return filteredBrands.map((brand, index) => ({
    ...brand,
    bgColor: bgColors[index],
  }));
}

// Get settlement data for LAST MONTH ONLY - formatted for frontend
async function getSettlementData(brandId) {
  // Calculate last month's date range
  const now = new Date();
  
  // Get last month (month - 1)
  const lastMonth = now.getMonth() - 1;
  const yearForLastMonth = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
  const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
  
  // First day of last month at 00:00:00
  const lastMonthStart = new Date(yearForLastMonth, adjustedLastMonth, 1, 0, 0, 0, 0);
  
  // Last day of last month at 23:59:59.999
  const lastMonthEnd = new Date(yearForLastMonth, adjustedLastMonth + 1, 0, 23, 59, 59, 999);

  console.log('Last Month Date Range:', {
    start: lastMonthStart.toISOString(),
    end: lastMonthEnd.toISOString(),
    month: lastMonthStart.toLocaleString('default', { month: 'long', year: 'numeric' })
  });

  // Build where clause based on Settlement schema
  // Schema fields: periodStart, periodEnd, status
  const whereClause = {
    // Check if settlement period overlaps with last month
    OR: [
      // Settlement period starts within last month
      {
        periodStart: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      // Settlement period ends within last month
      {
        periodEnd: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      // Settlement period contains last month
      {
        AND: [
          {
            periodStart: {
              lte: lastMonthStart,
            },
          },
          {
            periodEnd: {
              gte: lastMonthEnd,
            },
          },
        ],
      },
    ],
  };

  // Add brand filter if provided
  if (brandId) {
    whereClause.brandId = brandId;
  }

  console.log('Settlement WHERE clause:', JSON.stringify(whereClause, null, 2));

  // Get pending settlements with brand details
  const pendingSettlements = await prisma.settlements.findMany({
    where: whereClause,
    include: {
      brand: {
        select: {
          id: true,
          brandName: true,
          logo: true,
          currency: true,
        },
      },
    },
    orderBy: {
      netPayable: "desc",
    },
  });

  console.log(`Found ${pendingSettlements.length} settlements for last month`);

  // Format settlements to match frontend expectations
  const settlements = pendingSettlements.map((settlement) => ({
    brand: settlement.brand.brandName,
    amount: Math.round(settlement.netPayable),
    status: settlement.status,
    currency: settlement.brand.currency || "USD",
    periodStart: settlement.periodStart,
    periodEnd: settlement.periodEnd,
    settlementPeriod: settlement.settlementPeriod,
  }));

  return settlements;
}