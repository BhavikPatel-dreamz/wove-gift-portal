import { NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Optional date range filters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "all"; // all, month, quarter, year

    // Calculate date range based on period
    const dateRange = getDateRange(period, startDate, endDate);

    // Run queries in parallel for better performance
    const [
      giftCardsMetrics,
      redemptionMetrics,
      settlementMetrics,
      monthlyTrends,
      topBrands,
      weeklyPerformance,
      activeBrands,
      revenueMetrics,
      customerMetrics,
      occasionMetrics,
    ] = await Promise.all([
      getGiftCardsMetrics(dateRange),
      getRedemptionMetrics(dateRange),
      getSettlementMetrics(dateRange),
      getMonthlyTransactionTrends(dateRange),
      getTopPerformingBrands(dateRange),
      getWeeklyPerformance(dateRange),
      getActiveBrandPartners(),
      getRevenueMetrics(dateRange),
      getCustomerMetrics(dateRange),
      getOccasionMetrics(dateRange),
    ]);

    return NextResponse.json({
      success: true,
      period: {
        type: period,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      metrics: {
        giftCards: giftCardsMetrics,
        redemption: redemptionMetrics,
        settlements: settlementMetrics,
        revenue: revenueMetrics,
        customers: customerMetrics,
        occasions: occasionMetrics,
        activeBrandPartners: activeBrands,
      },
      trends: {
        monthly: monthlyTrends,
        weekly: weeklyPerformance,
      },
      topPerformers: {
        brands: topBrands,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

function getDateRange(period, startDate, endDate) {
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = now;
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        start = null;
        end = null;
    }
  }

  return { start, end };
}

function buildDateFilter(dateRange) {
  if (!dateRange.start || !dateRange.end) return {};
  
  return {
    createdAt: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
}

// Gift Cards Metrics - FIXED VERSION
async function getGiftCardsMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Get all voucher codes with their values
  const voucherCodes = await prisma.voucherCode.findMany({
    where: dateFilter,
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

  const totalIssued = voucherCodes.length;

  // Calculate total value issued
  const totalValue = voucherCodes.reduce(
    (sum, vc) => sum + vc.originalValue,
    0
  );

  // Calculate average value
  const averageValue = totalIssued > 0 ? Math.round(totalValue / totalIssued) : 0;

  // Categorize vouchers based on redemption status
  const fullyRedeemed = voucherCodes.filter((vc) => {
    const hasRedemptionRecords = vc._count.redemptions > 0;
    const isMarkedRedeemed = vc.isRedeemed === true;
    const fullyUsed = vc.remainingValue === 0;
    return hasRedemptionRecords || isMarkedRedeemed || fullyUsed;
  });

  const partiallyRedeemed = voucherCodes.filter((vc) => {
    const hasBeenUsed = vc.remainingValue < vc.originalValue;
    const notFullyUsed = vc.remainingValue > 0;
    return hasBeenUsed && notFullyUsed;
  });

  const active = voucherCodes.filter((vc) => {
    const notUsed = vc.remainingValue === vc.originalValue;
    const notMarkedRedeemed = !vc.isRedeemed;
    const noRedemptions = vc._count.redemptions === 0;
    return notUsed && notMarkedRedeemed && noRedemptions;
  });

  // Calculate values for each category
  const fullyRedeemedValue = fullyRedeemed.reduce(
    (sum, vc) => sum + vc.originalValue,
    0
  );

  const partiallyRedeemedValue = partiallyRedeemed.reduce(
    (sum, vc) => sum + vc.originalValue,
    0
  );

  const partiallyRedeemedRemaining = partiallyRedeemed.reduce(
    (sum, vc) => sum + vc.remainingValue,
    0
  );

  const activeValue = active.reduce(
    (sum, vc) => sum + vc.originalValue,
    0
  );

  // Calculate growth rate if period is specified
  let growthRate = null;
  if (dateRange.start && dateRange.end) {
    const previousPeriod = await getPreviousPeriodMetrics(dateRange);
    growthRate = calculateGrowthRate(totalIssued, previousPeriod.count);
  }

  return {
    totalIssued,
    totalValue,
    averageValue,
    growthRate,
    byStatus: [
      {
        status: "Redeemed",
        count: fullyRedeemed.length,
        totalValue: fullyRedeemedValue,
        remainingValue: 0,
      },
      {
        status: "Partially Redeemed",
        count: partiallyRedeemed.length,
        totalValue: partiallyRedeemedValue,
        remainingValue: partiallyRedeemedRemaining,
      },
      {
        status: "Active",
        count: active.length,
        totalValue: activeValue,
        remainingValue: activeValue,
      },
    ],
  };
}

// Redemption Metrics - FIXED VERSION (Based on second API logic)
async function getRedemptionMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Get all voucher codes with their redemption data
  const voucherCodes = await prisma.voucherCode.findMany({
    where: dateFilter,
    select: {
      id: true,
      isRedeemed: true,
      originalValue: true,
      remainingValue: true,
      redeemedAt: true,
      _count: {
        select: {
          redemptions: true,
        },
      },
    },
  });

  const totalIssued = voucherCodes.length;

  // Calculate total issued value
  const totalIssuedValue = voucherCodes.reduce(
    (sum, vc) => sum + vc.originalValue,
    0
  );

  // Count fully redeemed vouchers
  const fullyRedeemed = voucherCodes.filter((vc) => {
    const hasRedemptionRecords = vc._count.redemptions > 0;
    const isMarkedRedeemed = vc.isRedeemed === true;
    const fullyUsed = vc.remainingValue === 0;
    return hasRedemptionRecords || isMarkedRedeemed || fullyUsed;
  }).length;

  // Count partially redeemed vouchers
  const partiallyRedeemed = voucherCodes.filter((vc) => {
    const hasBeenUsed = vc.remainingValue < vc.originalValue;
    const notFullyUsed = vc.remainingValue > 0;
    return hasBeenUsed && notFullyUsed;
  }).length;

  // Calculate total used value (for accurate redemption rate)
  const totalUsedValue = voucherCodes.reduce((sum, vc) => {
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

  // Calculate redemption rate based on value usage (same as second API)
  const redemptionRate =
    totalIssuedValue > 0
      ? parseFloat(((totalUsedValue / totalIssuedValue) * 100).toFixed(2))
      : 0;

  // Get daily redemptions for trend analysis
  let dailyQuery = `
    SELECT
      DATE("redeemedAt") as date,
      COUNT(*)::int as count,
      SUM("originalValue" - "remainingValue")::float as "totalRedeemed"
    FROM "VoucherCode"
    WHERE "isRedeemed" = true
  `;
  
  const dailyParams = [];
  
  if (dateRange.start) {
    dailyQuery += ` AND "redeemedAt" >= ${dailyParams.length + 1}::timestamp`;
    dailyParams.push(dateRange.start);
  }
  if (dateRange.end) {
    dailyQuery += ` AND "redeemedAt" <= ${dailyParams.length + 1}::timestamp`;
    dailyParams.push(dateRange.end);
  }
  
  dailyQuery += `
    GROUP BY DATE("redeemedAt")
    ORDER BY date DESC
    LIMIT 30
  `;
  
  const dailyRedemptions = await prisma.$queryRawUnsafe(dailyQuery, ...dailyParams);

  return {
    fullyRedeemed,
    partiallyRedeemed,
    redemptionRate,
    totalUsedValue,
    totalIssuedValue,
    dailyTrend: dailyRedemptions,
  };
}

// Settlement Metrics
async function getSettlementMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);
  
  const [pending, paid, inReview, totalPayable, settlementsByBrand] =
    await Promise.all([
      // Pending settlements
      prisma.settlements.aggregate({
        _sum: { netPayable: true },
        _count: true,
        where: {
          status: "Pending",
          ...dateFilter,
        },
      }),

      // Paid settlements
      prisma.settlements.aggregate({
        _sum: { netPayable: true },
        _count: true,
        where: {
          status: "Paid",
          ...dateFilter,
        },
      }),

      // In review
      prisma.settlements.aggregate({
        _sum: { netPayable: true },
        _count: true,
        where: {
          status: "InReview",
          ...dateFilter,
        },
      }),

      // Total payable across all statuses
      prisma.settlements.aggregate({
        _sum: {
          netPayable: true,
          commissionAmount: true,
          vatAmount: true,
        },
        where: dateFilter,
      }),

      // Settlements by brand
      prisma.settlements.groupBy({
        by: ["brandId", "status"],
        _sum: {
          netPayable: true,
          commissionAmount: true,
        },
        _count: true,
        where: dateFilter,
        orderBy: {
          _sum: {
            netPayable: "desc",
          },
        },
        take: 10,
      }),
    ]);

  // Get brand details
  const brandIds = [...new Set(settlementsByBrand.map((s) => s.brandId))];
  const brands = brandIds.length > 0 ? await prisma.brand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, brandName: true, logo: true },
  }) : [];

  const enrichedSettlements = settlementsByBrand.map((settlement) => {
    const brand = brands.find((b) => b.id === settlement.brandId);
    return {
      ...settlement,
      brandName: brand?.brandName || "Unknown",
      brandLogo: brand?.logo,
    };
  });

  return {
    pending: {
      count: pending._count,
      amount: pending._sum.netPayable || 0,
    },
    paid: {
      count: paid._count,
      amount: paid._sum.netPayable || 0,
    },
    inReview: {
      count: inReview._count,
      amount: inReview._sum.netPayable || 0,
    },
    totals: {
      netPayable: totalPayable._sum.netPayable || 0,
      commission: totalPayable._sum.commissionAmount || 0,
      vat: totalPayable._sum.vatAmount || 0,
    },
    byBrand: enrichedSettlements,
  };
}

// Monthly Transaction Trends
async function getMonthlyTransactionTrends(dateRange) {
  let query = `
    SELECT
      to_char("createdAt", 'YYYY-MM') as month,
      to_char("createdAt", 'Mon YYYY') as "monthLabel",
      COUNT(*)::int as "orderCount",
      SUM("totalAmount")::float as "totalAmount",
      SUM("quantity")::int as "totalQuantity",
      AVG("totalAmount")::float as "avgOrderValue",
      SUM("discount")::float as "totalDiscount"
    FROM "Order"
    WHERE "paymentStatus" = 'COMPLETED'
  `;
  
  const params = [];
  
  if (dateRange.start) {
    query += ` AND "createdAt" >= $${params.length + 1}::timestamp`;
    params.push(dateRange.start);
  }
  if (dateRange.end) {
    query += ` AND "createdAt" <= $${params.length + 1}::timestamp`;
    params.push(dateRange.end);
  }
  
  query += `
    GROUP BY month, "monthLabel"
    ORDER BY month DESC
    LIMIT 12
  `;
  
  const trends = await prisma.$queryRawUnsafe(query, ...params);

  // Calculate month-over-month growth
  const trendsWithGrowth = trends.map((trend, index) => {
    if (index < trends.length - 1) {
      const previousMonth = trends[index + 1];
      const growth = calculateGrowthRate(
        Number(trend.totalAmount),
        Number(previousMonth.totalAmount)
      );
      return { ...trend, growth };
    }
    return { ...trend, growth: null };
  });

  return trendsWithGrowth.reverse();
}

// Top Performing Brands - FIXED VERSION
async function getTopPerformingBrands(dateRange, limit = 10) {
  const dateFilter = buildDateFilter(dateRange);

  const topBrands = await prisma.order.groupBy({
    by: ["brandId"],
    _count: { id: true },
    _sum: {
      totalAmount: true,
      quantity: true,
      discount: true,
    },
    _avg: {
      totalAmount: true,
    },
    where: {
      paymentStatus: "COMPLETED",
      ...dateFilter,
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
    take: limit,
  });

  // Get brand details with categories
  const brandIds = topBrands.map((b) => b.brandId);
  const brands = brandIds.length > 0 ? await prisma.brand.findMany({
    where: { id: { in: brandIds } },
    select: {
      id: true,
      brandName: true,
      logo: true,
      categoryName: true,
      isActive: true,
      isFeature: true,
    },
  }) : [];

  // Calculate metrics for each brand using the same logic as second API
  const enrichedBrands = await Promise.all(
    topBrands.map(async (brand) => {
      const brandDetails = brands.find((b) => b.id === brand.brandId);

      // Get voucher codes with redemption data for this brand
      const voucherCodesWithRedemptions = await prisma.voucherCode.findMany({
        where: {
          order: {
            brandId: brand.brandId,
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

      const totalVouchers = voucherCodesWithRedemptions.length;

      // Calculate total issued value
      const totalIssuedValue = voucherCodesWithRedemptions.reduce(
        (sum, vc) => sum + vc.originalValue,
        0
      );

      // Calculate total used value
      const totalUsedValue = voucherCodesWithRedemptions.reduce((sum, vc) => {
        const hasRedemptionRecords = vc._count.redemptions > 0;
        const isMarkedRedeemed = vc.isRedeemed === true;
        const hasBeenUsed = vc.remainingValue < vc.originalValue;

        if (hasRedemptionRecords || isMarkedRedeemed || hasBeenUsed) {
          const usedAmount = vc.originalValue - vc.remainingValue;
          return sum + usedAmount;
        }
        return sum;
      }, 0);

      // Calculate redemption rate based on value (same as second API)
      const redemptionRate =
        totalIssuedValue > 0
          ? parseFloat(((totalUsedValue / totalIssuedValue) * 100).toFixed(2))
          : 0;

      return {
        brandId: brand.brandId,
        brandName: brandDetails?.brandName || "Unknown",
        logo: brandDetails?.logo,
        category: brandDetails?.categoryName,
        isActive: brandDetails?.isActive,
        isFeatured: brandDetails?.isFeature,
        metrics: {
          orderCount: brand._count.id,
          totalRevenue: brand._sum.totalAmount || 0,
          totalQuantity: brand._sum.quantity || 0,
          totalDiscount: brand._sum.discount || 0,
          avgOrderValue: Math.round(brand._avg.totalAmount || 0),
          redemptionRate,
        },
      };
    })
  );

  return enrichedBrands;
}

// Weekly Performance
async function getWeeklyPerformance(dateRange) {
  const weeklyData = await prisma.$queryRaw`
    SELECT
      to_char(date_series.day, 'YYYY-MM-DD') as date,
      to_char(date_series.day, 'Dy') as "dayName",
      COALESCE(COUNT(o.id), 0)::int as "orderCount",
      COALESCE(SUM(o."totalAmount"), 0)::float as "totalAmount",
      COALESCE(SUM(o.quantity), 0)::int as "totalQuantity",
      COALESCE(AVG(o."totalAmount"), 0)::float as "avgOrderValue"
    FROM (
      SELECT generate_series(
        (CURRENT_DATE - interval '6 days'),
        CURRENT_DATE,
        '1 day'
      )::date AS day
    ) AS date_series
    LEFT JOIN "Order" o
      ON DATE(o."createdAt") = date_series.day
      AND o."paymentStatus" = 'COMPLETED'
    GROUP BY date_series.day
    ORDER BY date_series.day ASC
  `;

  // Calculate week-over-week comparison
  const currentWeekTotal = weeklyData.reduce(
    (sum, day) => sum + Number(day.totalAmount),
    0
  );

  const previousWeekData = await prisma.$queryRaw`
    SELECT COALESCE(SUM("totalAmount"), 0)::float as total
    FROM "Order"
    WHERE "paymentStatus" = 'COMPLETED'
      AND "createdAt" >= CURRENT_DATE - interval '13 days'
      AND "createdAt" < CURRENT_DATE - interval '6 days'
  `;

  const previousWeekTotal = Number(previousWeekData[0]?.total || 0);
  const weekOverWeekGrowth = calculateGrowthRate(
    currentWeekTotal,
    previousWeekTotal
  );

  return {
    daily: weeklyData,
    summary: {
      currentWeekTotal,
      previousWeekTotal,
      weekOverWeekGrowth,
    },
  };
}

// Active Brand Partners
async function getActiveBrandPartners() {
  const [total, active, inactive, featured, byCategory] = await Promise.all([
    prisma.brand.count(),
    prisma.brand.count({ where: { isActive: true } }),
    prisma.brand.count({ where: { isActive: false } }),
    prisma.brand.count({ where: { isActive: true, isFeature: true } }),
    prisma.brand.groupBy({
      by: ["categoryName"],
      _count: true,
      where: { isActive: true },
      orderBy: {
        _count: {
          categoryName: "desc",
        },
      },
    }),
  ]);

  // Get recent partnerships (last 30 days)
  const recentPartners = await prisma.brand.count({
    where: {
      isActive: true,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return {
    total,
    active,
    inactive,
    featured,
    recentPartners,
    byCategory: byCategory.map((cat) => ({
      category: cat.categoryName,
      count: cat._count,
    })),
  };
}

// Revenue Metrics
async function getRevenueMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  const revenue = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
      subtotal: true,
      discount: true,
    },
    _avg: {
      totalAmount: true,
    },
    _count: true,
    where: {
      paymentStatus: "COMPLETED",
      ...dateFilter,
    },
  });

  // Revenue by payment method
  const byPaymentMethod = await prisma.order.groupBy({
    by: ["paymentMethod"],
    _sum: { totalAmount: true },
    _count: true,
    where: {
      paymentStatus: "COMPLETED",
      ...dateFilter,
    },
  });

  return {
    totalRevenue: revenue._sum.totalAmount || 0,
    totalSubtotal: revenue._sum.subtotal || 0,
    totalDiscount: revenue._sum.discount || 0,
    avgOrderValue: Math.round(revenue._avg.totalAmount || 0),
    orderCount: revenue._count,
    byPaymentMethod: byPaymentMethod.map((pm) => ({
      method: pm.paymentMethod || "Unknown",
      revenue: pm._sum.totalAmount || 0,
      count: pm._count,
    })),
  };
}

// Customer Metrics
async function getCustomerMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Build repeat customers query
  let repeatQuery = `
    SELECT COUNT(DISTINCT "userId")::int as count
    FROM "Order"
    WHERE "userId" IN (
      SELECT "userId"
      FROM "Order"
      WHERE 1=1
  `;
  
  const repeatParams = [];
  
  if (dateRange.start) {
    repeatQuery += ` AND "createdAt" >= $${repeatParams.length + 1}::timestamp`;
    repeatParams.push(dateRange.start);
  }
  if (dateRange.end) {
    repeatQuery += ` AND "createdAt" <= $${repeatParams.length + 1}::timestamp`;
    repeatParams.push(dateRange.end);
  }
  
  repeatQuery += `
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    )
  `;

  const [totalCustomers, activeCustomers, newCustomers, repeatCustomers] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          orders: { some: dateFilter },
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: dateRange.start
            ? {
                gte: dateRange.start,
                lte: dateRange.end,
              }
            : undefined,
        },
      }),
      // Customers with more than 1 order
      prisma.$queryRawUnsafe(repeatQuery, ...repeatParams),
    ]);

  const repeatRate =
    activeCustomers > 0
      ? ((Number(repeatCustomers[0]?.count || 0) / activeCustomers) * 100).toFixed(2)
      : 0;

  return {
    total: totalCustomers,
    active: activeCustomers,
    new: newCustomers,
    repeat: Number(repeatCustomers[0]?.count || 0),
    repeatRate: parseFloat(repeatRate),
  };
}

// Occasion Metrics
async function getOccasionMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Check if there are any completed orders
  const ordersWithOccasions = await prisma.order.count({
    where: {
      paymentStatus: "COMPLETED",
      ...dateFilter,
    },
  });

  // Return empty array if no orders found
  if (ordersWithOccasions === 0) {
    return [];
  }

  const topOccasions = await prisma.order.groupBy({
    by: ["occasionId"],
    _count: true,
    _sum: { totalAmount: true },
    where: {
      paymentStatus: "COMPLETED",
      ...dateFilter,
    },
    orderBy: {
      _count: {
        occasionId: "desc",
      },
    },
    take: 10,
  });

  // Return empty array if no occasions found
  if (topOccasions.length === 0) {
    return [];
  }

  const occasionIds = topOccasions.map((o) => o.occasionId);

  const occasions = await prisma.occasion.findMany({
    where: { id: { in: occasionIds } },
    select: { id: true, name: true, emoji: true, type: true },
  });

  return topOccasions.map((occ) => {
    const occasion = occasions.find((o) => o.id === occ.occasionId);
    return {
      occasionId: occ.occasionId,
      name: occasion?.name || "Unknown",
      emoji: occasion?.emoji,
      type: occasion?.type,
      orderCount: occ._count,
      totalRevenue: occ._sum.totalAmount || 0,
    };
  });
}

// Helper: Calculate growth rate
function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return null;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

// Helper: Get previous period metrics
async function getPreviousPeriodMetrics(dateRange) {
  const duration = dateRange.end - dateRange.start;
  const previousStart = new Date(dateRange.start - duration);
  const previousEnd = dateRange.start;

  const count = await prisma.voucherCode.count({
    where: {
      createdAt: {
        gte: previousStart,
        lt: previousEnd,
      },
    },
  });

  return { count };
}