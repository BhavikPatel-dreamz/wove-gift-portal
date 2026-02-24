import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Report type is required" },
        { status: 400 }
      );
    }

    let reportData;

    switch (type) {
      case "daily-settlement":
        reportData = await generateDailySettlement();
        break;
      case "weekly-summary":
        reportData = await generateWeeklySummary();
        break;
      case "monthly-report":
        reportData = await generateMonthlyReport();
        break;
      case "yearly-report":
        reportData = await generateYearlyReport();
        break;
      case "unredeemed-liability":
        reportData = await generateUnredeemedLiability();
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      generatedAt: new Date().toISOString(),
      data: reportData,
    });
  } catch (error) {
    console.error("Quick Report API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// ==================== REPORT GENERATORS ====================

// Daily Settlement Report
async function generateDailySettlement() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      brand: {
        select: {
          id: true,
          brandName: true,
          brandTerms: true,
        },
      },
      voucherCodes: {
        select: {
          id: true,
          code: true,
          originalValue: true,
          remainingValue: true,
          isRedeemed: true,
          _count: {
            select: {
              redemptions: true,
            },
          },
        },
      },
    },
  });

  const settlementsByBrand = {};

  orders.forEach((order) => {
    const brandId = order.brand.id;
    const brandName = order.brand.brandName;
    const commissionType = order.brand.brandTerms?.commissionType || "Percentage";
    const commissionValue = order.brand.brandTerms?.commissionValue || 0;
    const vatRate = order.brand.brandTerms?.vatRate || 0;

    if (!settlementsByBrand[brandId]) {
      settlementsByBrand[brandId] = {
        brandId,
        brandName,
        totalOrders: 0,
        totalSoldAmount: 0,
        totalRedeemed: 0,
        redeemedAmount: 0,
        commissionAmount: 0,
        vatAmount: 0,
        netPayable: 0,
        orders: [],
      };
    }

    let commission = 0;
    if (commissionType === "Percentage") {
      commission = (order.totalAmount * commissionValue) / 100;
    } else {
      commission = commissionValue;
    }

    const vat = (commission * vatRate) / 100;

    const redeemedVouchers = order.voucherCodes.filter(
      (vc) => vc.isRedeemed || vc._count.redemptions > 0 || vc.remainingValue === 0
    );
    const redeemedAmount = redeemedVouchers.reduce(
      (sum, vc) => sum + (vc.originalValue - vc.remainingValue),
      0
    );

    settlementsByBrand[brandId].totalOrders += 1;
    settlementsByBrand[brandId].totalSoldAmount += order.totalAmount;
    settlementsByBrand[brandId].totalRedeemed += redeemedVouchers.length;
    settlementsByBrand[brandId].redeemedAmount += redeemedAmount;
    settlementsByBrand[brandId].commissionAmount += commission;
    settlementsByBrand[brandId].vatAmount += vat;
    settlementsByBrand[brandId].netPayable += order.totalAmount - commission - vat;
    settlementsByBrand[brandId].orders.push({
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      quantity: order.quantity,
      commission,
      vat,
    });
  });

  return {
    reportDate: today.toISOString().split("T")[0],
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalBrands: Object.keys(settlementsByBrand).length,
    },
    settlements: Object.values(settlementsByBrand),
  };
}

// Weekly Summary Report
async function generateWeeklySummary() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [orders, voucherCodes, settlements] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentStatus: "COMPLETED",
        createdAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      include: {
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    }),

    prisma.voucherCode.findMany({
      where: {
        createdAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      select: {
        originalValue: true,
        remainingValue: true,
        isRedeemed: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    }),

    prisma.settlements.findMany({
      where: {
        createdAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      include: {
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    }),
  ]);

  const dailyBreakdown = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(
      (o) => o.createdAt >= date && o.createdAt < nextDate
    );

    dailyBreakdown.push({
      date: date.toISOString().split("T")[0],
      orderCount: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgOrderValue:
        dayOrders.length > 0
          ? Math.round(
              dayOrders.reduce((sum, o) => sum + o.totalAmount, 0) /
                dayOrders.length
            )
          : 0,
    });
  }

  const brandRevenue = {};
  orders.forEach((order) => {
    const brandName = order.brand.brandName;
    if (!brandRevenue[brandName]) {
      brandRevenue[brandName] = 0;
    }
    brandRevenue[brandName] += order.totalAmount;
  });

  const topBrands = Object.entries(brandRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([brandName, revenue]) => ({ brandName, revenue }));

  const totalIssued = voucherCodes.length;
  const totalRedeemed = voucherCodes.filter(
    (vc) => vc.isRedeemed || vc._count.redemptions > 0 || vc.remainingValue === 0
  ).length;
  const redemptionRate =
    totalIssued > 0 ? ((totalRedeemed / totalIssued) * 100).toFixed(2) : 0;

  return {
    periodStart: weekAgo.toISOString().split("T")[0],
    periodEnd: today.toISOString().split("T")[0],
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgOrderValue:
        orders.length > 0
          ? Math.round(
              orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
            )
          : 0,
      totalVouchersIssued: totalIssued,
      totalVouchersRedeemed: totalRedeemed,
      redemptionRate: parseFloat(redemptionRate),
    },
    dailyBreakdown,
    topBrands,
    settlements: settlements.map((s) => ({
      brandName: s.brand.brandName,
      period: s.settlementPeriod,
      amount: s.netPayable,
      status: s.status,
    })),
  };
}

// Monthly Report
async function generateMonthlyReport() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const [orders, voucherCodes, customers, brands] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentStatus: "COMPLETED",
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        brand: {
          select: {
            brandName: true,
            categoryName: true,
          },
        },
        occasion: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.voucherCode.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        isRedeemed: true,
        remainingValue: true,
        originalValue: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),

    prisma.brand.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  const categoryRevenue = {};
  orders.forEach((order) => {
    const category = order.brand.categoryName;
    if (!categoryRevenue[category]) {
      categoryRevenue[category] = { revenue: 0, orders: 0 };
    }
    categoryRevenue[category].revenue += order.totalAmount;
    categoryRevenue[category].orders += 1;
  });

  const occasionStats = {};
  orders.forEach((order) => {
    if (order.occasion) {
      const occasionName = order.occasion.name;
      if (!occasionStats[occasionName]) {
        occasionStats[occasionName] = { orders: 0, revenue: 0 };
      }
      occasionStats[occasionName].orders += 1;
      occasionStats[occasionName].revenue += order.totalAmount;
    }
  });

  const topOccasions = Object.entries(occasionStats)
    .sort(([, a], [, b]) => b.orders - a.orders)
    .slice(0, 5)
    .map(([occasion, stats]) => ({ occasion, ...stats }));

  const totalIssued = voucherCodes.length;
  const fullyRedeemed = voucherCodes.filter(
    (vc) => vc.isRedeemed || vc.remainingValue === 0 || vc._count.redemptions > 0
  ).length;
  const partiallyRedeemed = voucherCodes.filter(
    (vc) =>
      vc.remainingValue < vc.originalValue && vc.remainingValue > 0
  ).length;

  return {
    period: {
      month: monthStart.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
    },
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgOrderValue:
        orders.length > 0
          ? Math.round(
              orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
            )
          : 0,
      totalDiscount: orders.reduce((sum, o) => sum + o.discount, 0),
      newCustomers: customers,
      activeBrands: brands,
    },
    voucherStats: {
      totalIssued,
      fullyRedeemed,
      partiallyRedeemed,
      active: totalIssued - fullyRedeemed - partiallyRedeemed,
      redemptionRate:
        totalIssued > 0
          ? ((fullyRedeemed / totalIssued) * 100).toFixed(2)
          : 0,
    },
    categoryPerformance: Object.entries(categoryRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([category, stats]) => ({ category, ...stats })),
    topOccasions,
  };
}


async function generateYearlyReport(year) {
  console.log(`    Fetching yearly report data for ${year}...`);

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: {
        gte: yearStart,
        lte: yearEnd,
      },
    },
  });

  return {
    period: { year },
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      ),
    },
  };
}

// Unredeemed Liability Report
async function generateUnredeemedLiability() {
  const today = new Date();

  const voucherCodes = await prisma.voucherCode.findMany({
    where: {
      OR: [
        { isRedeemed: false },
        { remainingValue: { gt: 0 } },
      ],
    },
    include: {
      order: {
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
            },
          },
        },
      },
      _count: {
        select: {
          redemptions: true,
        },
      },
    },
  });

  const liabilityByBrand = {};

  voucherCodes.forEach((vc) => {
    // Skip fully redeemed vouchers
    if ((vc.isRedeemed || vc._count.redemptions > 0) && vc.remainingValue === 0) {
      return;
    }

    const brandId = vc.order.brand.id;
    const brandName = vc.order.brand.brandName;

    if (!liabilityByBrand[brandId]) {
      liabilityByBrand[brandId] = {
        brandId,
        brandName,
        totalVouchers: 0,
        totalLiability: 0,
        activeVouchers: 0,
        partiallyRedeemedVouchers: 0,
        expiredVouchers: 0,
        details: [],
      };
    }

    const isExpired = vc.expiresAt && new Date(vc.expiresAt) < today;
    const isPartiallyRedeemed =
      vc.remainingValue < vc.originalValue && vc.remainingValue > 0;
    const isActive =
      vc.remainingValue === vc.originalValue &&
      !vc.isRedeemed &&
      vc._count.redemptions === 0;

    liabilityByBrand[brandId].totalVouchers += 1;
    liabilityByBrand[brandId].totalLiability += vc.remainingValue;

    if (isExpired) {
      liabilityByBrand[brandId].expiredVouchers += 1;
    } else if (isPartiallyRedeemed) {
      liabilityByBrand[brandId].partiallyRedeemedVouchers += 1;
    } else if (isActive) {
      liabilityByBrand[brandId].activeVouchers += 1;
    }

    liabilityByBrand[brandId].details.push({
      code: vc.code,
      originalValue: vc.originalValue,
      remainingValue: vc.remainingValue,
      issuedDate: vc.createdAt.toISOString().split("T")[0],
      expiresAt: vc.expiresAt
        ? vc.expiresAt.toISOString().split("T")[0]
        : null,
      status: isExpired
        ? "Expired"
        : isPartiallyRedeemed
        ? "Partially Redeemed"
        : "Active",
    });
  });

  const totalLiability = voucherCodes.reduce(
    (sum, vc) => sum + vc.remainingValue,
    0
  );
  const totalVouchers = voucherCodes.filter(
    (vc) => !((vc.isRedeemed || vc._count.redemptions > 0) && vc.remainingValue === 0)
  ).length;

  return {
    generatedDate: today.toISOString().split("T")[0],
    summary: {
      totalVouchers,
      totalLiability,
      avgLiabilityPerVoucher:
        totalVouchers > 0 ? Math.round(totalLiability / totalVouchers) : 0,
      totalBrands: Object.keys(liabilityByBrand).length,
    },
    byBrand: Object.values(liabilityByBrand).sort(
      (a, b) => b.totalLiability - a.totalLiability
    ),
  };
}