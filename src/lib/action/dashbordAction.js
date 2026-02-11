import { prisma } from "../db";

export async function getDashboardData(options = {}) {
  try {
    const { period = "all", startDate, endDate, shop } = options;
    const dateRange = getDateRange(period, startDate, endDate);

    let brandId = null;
    if (shop) {
      const brand = await prisma.brand.findUnique({
        where: { domain: shop },
        select: { id: true },
      });

      if (!brand) {
        return getEmptyDashboardResponse(period, dateRange);
      }
      brandId = brand.id;
    }

    // ✅ OPTIMIZATION: Execute all queries in parallel for maximum speed
    const [
      coreMetrics,
      topBrands,
      activeBrands,
      monthlyTrends,
      weeklyPerformance,
      occasionMetrics,
    ] = await Promise.all([
      getCoreMetrics(dateRange, brandId),
      getTopPerformingBrands(dateRange, brandId),
      getActiveBrandPartners(brandId),
      getMonthlyTrends(dateRange, brandId),
      getWeeklyPerformance(dateRange, brandId),
      getOccasionMetrics(dateRange, brandId),
    ]);

    return {
      success: true,
      period: {
        type: period,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      metrics: {
        giftCards: coreMetrics.giftCards,
        redemption: coreMetrics.redemption,
        settlements: coreMetrics.settlements,
        revenue: coreMetrics.revenue,
        customers: coreMetrics.customers,
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
    };
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    return { success: false, error: error.message };
  }
}

// ✅ OPTIMIZATION 1: Combine all core metrics into single parallel execution
async function getCoreMetrics(dateRange, brandId = null) {
  const dateFilter = buildDateFilter(dateRange);
  const orderWhere = {
    ...dateFilter,
    paymentStatus: "COMPLETED",
    ...(brandId && { brandId }),
  };

  const voucherWhere = {
    order: orderWhere,
  };

  // Execute all core queries in parallel
  const [
    voucherCodes,
    settlements,
    revenueData,
    paymentMethods,
    customers,
    previousPeriodCount,
  ] = await Promise.all([
    // Voucher codes with redemption count
    prisma.voucherCode.findMany({
      where: voucherWhere,
      select: {
        id: true,
        isRedeemed: true,
        originalValue: true,
        remainingValue: true,
        redeemedAt: true,
        _count: { select: { redemptions: true } },
      },
    }),

    // Settlements data
    prisma.settlements.findMany({
      where: {
        ...dateFilter,
        ...(brandId && { brandId }),
      },
      select: {
        status: true,
        netPayable: true,
        commissionAmount: true,
        vatAmount: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
          },
        },
      },
    }),

    // Revenue aggregation
    prisma.order.aggregate({
      where: orderWhere,
      _sum: {
        totalAmount: true,
        subtotal: true,
        discount: true,
      },
      _avg: { totalAmount: true },
      _count: true,
    }),

    // Payment methods
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: orderWhere,
      _sum: { totalAmount: true },
      _count: true,
    }),

    // Customer metrics
    getCustomerMetrics(dateRange, brandId, orderWhere),

    // Previous period for growth calculation
    dateRange.start
      ? prisma.voucherCode.count({
          where: {
            order: {
              paymentStatus: "COMPLETED",
              ...(brandId && { brandId }),
              createdAt: {
                gte: new Date(
                  dateRange.start.getTime() -
                    (dateRange.end.getTime() - dateRange.start.getTime())
                ),
                lt: dateRange.start,
              },
            },
          },
        })
      : Promise.resolve(0),
  ]);

  // Process voucher metrics
  const voucherMetrics = processVoucherMetrics(
    voucherCodes,
    previousPeriodCount
  );

  // Process settlement metrics
  const settlementMetrics = processSettlementMetrics(settlements);

  // Process revenue metrics
  const revenueMetrics = {
    totalRevenue: revenueData._sum.totalAmount || 0,
    totalSubtotal: revenueData._sum.subtotal || 0,
    totalDiscount: revenueData._sum.discount || 0,
    avgOrderValue: Math.round(revenueData._avg.totalAmount || 0),
    orderCount: revenueData._count,
    byPaymentMethod: paymentMethods.map((pm) => ({
      method: pm.paymentMethod || "Unknown",
      revenue: pm._sum.totalAmount || 0,
      count: pm._count,
    })),
  };

  return {
    giftCards: voucherMetrics.giftCards,
    redemption: voucherMetrics.redemption,
    settlements: settlementMetrics,
    revenue: revenueMetrics,
    customers,
  };
}

// ✅ OPTIMIZATION 2: Process voucher data in memory (faster than multiple DB queries)
function processVoucherMetrics(voucherCodes, previousPeriodCount) {
  const totalIssued = voucherCodes.length;
  const totalValue = voucherCodes.reduce((sum, vc) => sum + vc.originalValue, 0);
  const averageValue = totalIssued > 0 ? Math.round(totalValue / totalIssued) : 0;

  let fullyRedeemedCount = 0,
    partiallyRedeemedCount = 0,
    activeCount = 0;
  let fullyRedeemedValue = 0,
    partiallyRedeemedValue = 0,
    partiallyRedeemedRemaining = 0,
    activeValue = 0,
    totalUsedValue = 0;

  // Single pass through voucher codes
  for (const vc of voucherCodes) {
    const hasRedemptions = vc._count.redemptions > 0;
    const isMarkedRedeemed = vc.isRedeemed === true;
    const fullyUsed = vc.remainingValue === 0;
    const hasBeenUsed = vc.remainingValue < vc.originalValue;
    const notFullyUsed = vc.remainingValue > 0;

    if (hasRedemptions || isMarkedRedeemed || fullyUsed) {
      fullyRedeemedCount++;
      fullyRedeemedValue += vc.originalValue;
      totalUsedValue += vc.originalValue - vc.remainingValue;
    } else if (hasBeenUsed && notFullyUsed) {
      partiallyRedeemedCount++;
      partiallyRedeemedValue += vc.originalValue;
      partiallyRedeemedRemaining += vc.remainingValue;
      totalUsedValue += vc.originalValue - vc.remainingValue;
    } else {
      activeCount++;
      activeValue += vc.originalValue;
    }
  }

  const redemptionRate =
    totalValue > 0 ? parseFloat(((totalUsedValue / totalValue) * 100).toFixed(2)) : 0;

  const growthRate =
    previousPeriodCount > 0
      ? parseFloat((((totalIssued - previousPeriodCount) / previousPeriodCount) * 100).toFixed(2))
      : null;

  return {
    giftCards: {
      totalIssued,
      totalValue,
      averageValue,
      growthRate,
      byStatus: [
        {
          status: "Redeemed",
          count: fullyRedeemedCount,
          totalValue: fullyRedeemedValue,
          remainingValue: 0,
        },
        {
          status: "Partially Redeemed",
          count: partiallyRedeemedCount,
          totalValue: partiallyRedeemedValue,
          remainingValue: partiallyRedeemedRemaining,
        },
        {
          status: "Active",
          count: activeCount,
          totalValue: activeValue,
          remainingValue: activeValue,
        },
      ],
    },
    redemption: {
      fullyRedeemed: fullyRedeemedCount,
      partiallyRedeemed: partiallyRedeemedCount,
      redemptionRate,
      totalUsedValue,
      totalIssuedValue: totalValue,
      dailyTrend: [], // Can be populated separately if needed
    },
  };
}

// ✅ OPTIMIZATION 3: Process settlement data in memory
function processSettlementMetrics(settlements) {
  let pendingCount = 0,
    pendingAmount = 0;
  let paidCount = 0,
    paidAmount = 0;
  let inReviewCount = 0,
    inReviewAmount = 0;
  let totalPayable = 0,
    totalCommission = 0,
    totalVat = 0;

  const byBrandMap = new Map();

  for (const s of settlements) {
    totalPayable += s.netPayable;
    totalCommission += s.commissionAmount;
    totalVat += s.vatAmount || 0;

    if (s.status === "Pending") {
      pendingCount++;
      pendingAmount += s.netPayable;
    } else if (s.status === "Paid") {
      paidCount++;
      paidAmount += s.netPayable;
    } else if (s.status === "InReview") {
      inReviewCount++;
      inReviewAmount += s.netPayable;
    }

    // Track by brand
    const key = `${s.brandId}-${s.status}`;
    if (!byBrandMap.has(key)) {
      byBrandMap.set(key, {
        brandId: s.brandId,
        brandName: s.brand.brandName,
        brandLogo: s.brand.logo,
        status: s.status,
        _count: 0,
        _sum: { netPayable: 0, commissionAmount: 0 },
      });
    }
    const entry = byBrandMap.get(key);
    entry._count++;
    entry._sum.netPayable += s.netPayable;
    entry._sum.commissionAmount += s.commissionAmount;
  }

  // Sort and take top 10
  const byBrand = Array.from(byBrandMap.values())
    .sort((a, b) => b._sum.netPayable - a._sum.netPayable)
    .slice(0, 10);

  return {
    pending: { count: pendingCount, amount: pendingAmount },
    paid: { count: paidCount, amount: paidAmount },
    inReview: { count: inReviewCount, amount: inReviewAmount },
    totals: {
      netPayable: totalPayable,
      commission: totalCommission,
      vat: totalVat,
    },
    byBrand,
  };
}

// ✅ OPTIMIZATION 4: Optimized customer metrics
async function getCustomerMetrics(dateRange, brandId, orderWhere) {
  const userDateFilter = dateRange.start
    ? { gte: dateRange.start, lte: dateRange.end }
    : undefined;

  const [totalCustomers, activeCustomers, newCustomers, ordersForRepeat] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          orders: { some: orderWhere },
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: userDateFilter,
        },
      }),
      // Get orders grouped by user to calculate repeat customers
      prisma.order.groupBy({
        by: ["userId"],
        where: orderWhere,
        _count: true,
        having: {
          userId: { _count: { gt: 1 } },
        },
      }),
    ]);

  const repeatCustomers = ordersForRepeat.length;
  const repeatRate =
    activeCustomers > 0
      ? parseFloat(((repeatCustomers / activeCustomers) * 100).toFixed(2))
      : 0;

  return {
    total: totalCustomers,
    active: activeCustomers,
    new: newCustomers,
    repeat: repeatCustomers,
    repeatRate,
  };
}

// ✅ OPTIMIZATION 5: Simplified monthly trends
async function getMonthlyTrends(dateRange, brandId) {
  const where = {
    paymentStatus: "COMPLETED",
    ...(brandId && { brandId }),
    ...(dateRange.start && {
      createdAt: { gte: dateRange.start, lte: dateRange.end },
    }),
  };

  const orders = await prisma.order.findMany({
    where,
    select: {
      createdAt: true,
      totalAmount: true,
      quantity: true,
      discount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by month in memory
  const monthMap = new Map();

  for (const order of orders) {
    const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        monthLabel: new Date(monthKey + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        orderCount: 0,
        totalAmount: 0,
        totalQuantity: 0,
        totalDiscount: 0,
      });
    }
    const entry = monthMap.get(monthKey);
    entry.orderCount++;
    entry.totalAmount += order.totalAmount;
    entry.totalQuantity += order.quantity;
    entry.totalDiscount += order.discount;
  }

  // Convert to array and calculate averages and growth
  const trends = Array.from(monthMap.values())
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12);

  return trends.reverse().map((trend, index, arr) => {
    const avgOrderValue = trend.orderCount > 0 ? trend.totalAmount / trend.orderCount : 0;
    const growth =
      index > 0 ? calculateGrowthRate(trend.totalAmount, arr[index - 1].totalAmount) : null;

    return { ...trend, avgOrderValue, growth };
  });
}

// ✅ OPTIMIZATION 6: Weekly performance - handles both local timezone and database timezone
async function getWeeklyPerformance(dateRange, brandId) {
  let { start, end } = dateRange;

  // For weekly view: Always show last 7 days regardless of period filter
  // This ensures we always have weekly data even when filtering by month/year
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);
  
  // Use last 7 days for weekly chart, but apply period filter to the data
  const weekStart = sevenDaysAgo;
  const weekEnd = today;

  const where = {
    paymentStatus: "COMPLETED",
    ...(brandId && { brandId }),
    createdAt: { gte: weekStart, lte: weekEnd },
  };

  const orders = await prisma.order.findMany({
    where,
    select: {
      createdAt: true,
      totalAmount: true,
      quantity: true,
    },
  });

  // Create date series for the last 7 days
  const dayMap = new Map();
  const currentDate = new Date(weekStart.getTime());

  while (currentDate <= weekEnd) {
    // Use local date to match what frontend expects
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()];
    
    dayMap.set(dateKey, {
      date: dateKey,
      dayName: dayOfWeek,
      orderCount: 0,
      totalAmount: 0,
      totalQuantity: 0,
      avgOrderValue: 0,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Populate with actual data
  for (const order of orders) {
    // Convert to local date to match the map keys
    const orderDate = new Date(order.createdAt);
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    if (dayMap.has(dateKey)) {
      const entry = dayMap.get(dateKey);
      entry.orderCount++;
      entry.totalAmount += order.totalAmount;
      entry.totalQuantity += order.quantity;
    }
  }

  // Calculate average order value for each day
  const daily = Array.from(dayMap.values()).map((d) => ({
    ...d,
    avgOrderValue: d.orderCount > 0 ? d.totalAmount / d.orderCount : 0,
  }));

  const currentWeekTotal = daily.reduce((sum, day) => sum + day.totalAmount, 0);

  // Get previous week
  const previousWeekStart = new Date(weekStart);
  previousWeekStart.setDate(weekStart.getDate() - 7);
  const previousWeekEnd = new Date(weekEnd);
  previousWeekEnd.setDate(weekEnd.getDate() - 7);

  const previousWeekData = await prisma.order.aggregate({
    where: {
      paymentStatus: "COMPLETED",
      ...(brandId && { brandId }),
      createdAt: { gte: previousWeekStart, lte: previousWeekEnd },
    },
    _sum: { totalAmount: true },
  });

  const previousWeekTotal = previousWeekData._sum.totalAmount || 0;

  return {
    daily,
    summary: {
      currentWeekTotal,
      previousWeekTotal,
      weekOverWeekGrowth: calculateGrowthRate(currentWeekTotal, previousWeekTotal),
    },
  };
}

// ✅ OPTIMIZATION 7: Simplified top brands
async function getTopPerformingBrands(dateRange, brandId = null, limit = 10) {
  const dateFilter = buildDateFilter(dateRange);
  const where = {
    ...dateFilter,
    paymentStatus: "COMPLETED",
    ...(brandId && { brandId }),
  };

  const topBrands = await prisma.order.groupBy({
    by: ["brandId"],
    where,
    _count: { id: true },
    _sum: { totalAmount: true, quantity: true, discount: true },
    _avg: { totalAmount: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  const brandIds = topBrands.map((b) => b.brandId);
  if (brandIds.length === 0) return [];

  const [brands, voucherData] = await Promise.all([
    prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: {
        id: true,
        brandName: true,
        logo: true,
        categoryName: true,
        isActive: true,
        isFeature: true,
      },
    }),
    prisma.voucherCode.findMany({
      where: {
        order: {
          brandId: { in: brandIds },
          paymentStatus: "COMPLETED",
          ...dateFilter,
        },
      },
      select: {
        order: { select: { brandId: true } },
        isRedeemed: true,
        originalValue: true,
        remainingValue: true,
        _count: { select: { redemptions: true } },
      },
    }),
  ]);

  // Group vouchers by brand
  const vouchersByBrand = new Map();
  for (const vc of voucherData) {
    const bId = vc.order.brandId;
    if (!vouchersByBrand.has(bId)) {
      vouchersByBrand.set(bId, []);
    }
    vouchersByBrand.get(bId).push(vc);
  }

  return topBrands.map((brand) => {
    const brandDetails = brands.find((b) => b.id === brand.brandId);
    const vcs = vouchersByBrand.get(brand.brandId) || [];

    let totalIssuedValue = 0,
      totalUsedValue = 0;
    for (const vc of vcs) {
      totalIssuedValue += vc.originalValue;
      if (
        vc._count.redemptions > 0 ||
        vc.isRedeemed ||
        vc.remainingValue < vc.originalValue
      ) {
        totalUsedValue += vc.originalValue - vc.remainingValue;
      }
    }

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
  });
}

// ✅ Active Brand Partners (unchanged, already optimized)
async function getActiveBrandPartners(brandId = null) {
  if (brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        isActive: true,
        isFeature: true,
        categoryName: true,
        createdAt: true,
      },
    });

    if (!brand) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        featured: 0,
        recentPartners: 0,
        byCategory: [],
      };
    }

    return {
      total: 1,
      active: brand.isActive ? 1 : 0,
      inactive: brand.isActive ? 0 : 1,
      featured: brand.isFeature ? 1 : 0,
      recentPartners:
        brand.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 1 : 0,
      byCategory: brand.categoryName ? [{ category: brand.categoryName, count: 1 }] : [],
    };
  }

  const [total, active, inactive, featured, byCategory, recentPartners] =
    await Promise.all([
      prisma.brand.count(),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isActive: false } }),
      prisma.brand.count({ where: { isActive: true, isFeature: true } }),
      prisma.brand.groupBy({
        by: ["categoryName"],
        where: { isActive: true },
        _count: true,
        orderBy: { _count: { categoryName: "desc" } },
      }),
      prisma.brand.count({
        where: {
          isActive: true,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

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

// ✅ Occasion Metrics (simplified)
async function getOccasionMetrics(dateRange, brandId = null) {
  const where = {
    ...buildDateFilter(dateRange),
    paymentStatus: "COMPLETED",
    ...(brandId && { brandId }),
  };

  const count = await prisma.order.count({ where });
  if (count === 0) return [];

  const topOccasions = await prisma.order.groupBy({
    by: ["occasionId"],
    where,
    _count: true,
    _sum: { totalAmount: true },
    orderBy: { _count: { occasionId: "desc" } },
    take: 10,
  });

  if (topOccasions.length === 0) return [];

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

// ==================== HELPER FUNCTIONS ====================

function getDateRange(period, startDate, endDate) {
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    switch (period) {
      case "day":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
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

function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return null;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

function getEmptyDashboardResponse(period, dateRange) {
  return {
    success: true,
    period: {
      type: period,
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    metrics: {
      giftCards: {
        totalIssued: 0,
        totalValue: 0,
        averageValue: 0,
        growthRate: null,
        byStatus: [],
      },
      redemption: {
        fullyRedeemed: 0,
        partiallyRedeemed: 0,
        redemptionRate: 0,
        totalUsedValue: 0,
        totalIssuedValue: 0,
        dailyTrend: [],
      },
      settlements: {
        pending: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        inReview: { count: 0, amount: 0 },
        totals: { netPayable: 0, commission: 0, vat: 0 },
        byBrand: [],
      },
      revenue: {
        totalRevenue: 0,
        totalSubtotal: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
        orderCount: 0,
        byPaymentMethod: [],
      },
      customers: {
        total: 0,
        active: 0,
        new: 0,
        repeat: 0,
        repeatRate: 0,
      },
      occasions: [],
      activeBrandPartners: {
        total: 0,
        active: 0,
        inactive: 0,
        featured: 0,
        recentPartners: 0,
        byCategory: [],
      },
    },
    trends: {
      monthly: [],
      weekly: {
        daily: [],
        summary: {
          currentWeekTotal: 0,
          previousWeekTotal: 0,
          weekOverWeekGrowth: null,
        },
      },
    },
    topPerformers: {
      brands: [],
    },
  };
}