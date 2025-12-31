
import { prisma } from '../db'

export async function fetchAnalyticsData(period = "year", brandId = null) {
  try {
    // Calculate date range
    const dateRange = getDateRange(period);

    // Fetch analytics data in parallel
    const [brandRedemptions, settlements] = await Promise.all([
      getBrandRedemptionMetrics(dateRange),
      getSettlementData(brandId),
    ]);

    return {
      success: true,
      brandRedemptions,
      settlements,
      period,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw new Error("Failed to fetch analytics data");
  }
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

export async function fetchBrandAnalytics(period = "year") {
  try {
    // Calculate date range
    const dateRange = getDateRange(period);
    const dateFilter = buildDateFilter(dateRange);

    // Get all active brands
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        brandName: true,
        logo: true,
        currency: true,
      },
      orderBy: { brandName: "asc" },
    });

    // Get analytics data for each brand
    const brandAnalytics = await Promise.all(
      brands.map(async (brand) => {
        // Get all voucher codes for this brand
        const voucherCodes = await prisma.voucherCode.findMany({
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
              select: { redemptions: true },
            },
          },
        });

        const totalIssued = voucherCodes.length;

        // Total sold value (sum of all settlements for this brand)
        const totalSoldAgg = await prisma.settlements.aggregate({
          _sum: { totalSoldAmount: true },
          where: { brandId: brand.id, ...dateFilter },
        });
        const totalIssuedValue = totalSoldAgg._sum.totalSoldAmount || 0;

        // Count redeemed vouchers
        const redeemedVouchers = voucherCodes.filter(
          (vc) =>
            vc._count.redemptions > 0 ||
            vc.isRedeemed ||
            vc.remainingValue < vc.originalValue
        );
        const totalRedeemed = redeemedVouchers.length;

        // Calculate total redeemed value
        const totalRedeemedValue = voucherCodes.reduce(
          (sum, vc) => sum + (vc.originalValue - vc.remainingValue),
          0
        );

        // Redemption rate
        const redemptionRate =
          totalIssued > 0
            ? Math.round((totalRedeemedValue / totalIssuedValue) * 100)
            : 0.0;

        // Aggregate settlements to compute paid vs sold
        const settlementsAgg = await prisma.settlements.groupBy({
          by: ["status"],
          where: { brandId: brand.id, ...dateFilter },
          _sum: { totalSoldAmount: true, netPayable: true },
        });

        const totalSoldAmount = settlementsAgg.reduce(
          (sum, s) => sum + (s._sum.totalSoldAmount || 0),
          0
        );
        const totalPaidAmount = settlementsAgg
          .filter((s) => s.status === "Paid")
          .reduce((sum, s) => sum + (s._sum.netPayable || 0), 0);

        // Pending settlement dynamically
        const pendingSettlement = totalSoldAmount - totalPaidAmount;

        // Latest settlement for details
        const latestSettlement = await prisma.settlements.findFirst({
          where: { brandId: brand.id, ...dateFilter },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            totalSoldAmount: true,
            redeemedAmount: true,
            commissionAmount: true,
            breakageAmount: true,
            vatAmount: true,
            netPayable: true,
            status: true,
          },
        });

        return {
          brandId: brand.id,
          brandName: brand.brandName,
          logo: brand.logo,
          currency: brand.currency || "ZAR",
          totalIssued,
          totalIssuedValue,
          totalRedeemed,
          totalRedeemedValue,
          redemptionRate,
          pendingSettlement,
          settlementDetails: latestSettlement
            ? {
                id: latestSettlement.id,
                totalSold: latestSettlement.totalSoldAmount,
                redeemed: latestSettlement.redeemedAmount,
                commission: latestSettlement.commissionAmount,
                breakage: latestSettlement.breakageAmount || 0,
                vat: latestSettlement.vatAmount || 0,
                totalPayable: latestSettlement.netPayable,
                status: latestSettlement.status,
                totalSoldAmount,
                totalPaidAmount,
              }
            : null,
          hasSettlement: !!latestSettlement,
        };
      })
    );

    // Filter & sort brands
    const filteredBrands = brandAnalytics
      .filter((b) => b.totalIssued > 0 || b.totalIssuedValue > 0)
      .sort((a, b) => b.totalIssuedValue - a.totalIssuedValue);

    // Summary totals
    return {
      success: true,
      data: filteredBrands,
      period,
      summary: {
        totalBrands: filteredBrands.length,
        totalVouchersIssued: filteredBrands.reduce(
          (sum, b) => sum + b.totalIssued,
          0
        ),
        totalVouchersRedeemed: filteredBrands.reduce(
          (sum, b) => sum + b.totalRedeemed,
          0
        ),
        totalPendingSettlements: filteredBrands.reduce(
          (sum, b) => sum + b.pendingSettlement,
          0
        ),
      },
    };
  } catch (error) {
    console.error("Brand Analytics Error:", error);
    return {
      success: false,
      data: [],
      period,
      summary: {
        totalBrands: 0,
        totalVouchersIssued: 0,
        totalVouchersRedeemed: 0,
        totalPendingSettlements: 0,
      },
    };
  }
}

export async function processSettlement(settlementId, partialAmount, notes) {
  try {
    // Validation
    if (!settlementId) {
      return { success: false, message: "Settlement ID is required" };
    }

    const partialAmountNum = parseFloat(partialAmount);
    if (isNaN(partialAmountNum) || partialAmountNum <= 0) {
      return { success: false, message: "Valid numeric payment amount is required" };
    }

    // Fetch settlement + brand
    const settlement = await prisma.settlements.findUnique({
      where: { id: settlementId },
      include: { brand: true },
    });

    if (!settlement) {
      return { success: false, message: "Settlement not found" };
    }

    if (settlement.status === "Paid") {
      return { success: false, message: "Settlement already fully paid" };
    }

    // Fetch brand terms for commission + VAT
    const brandTerms = await prisma.brandTerms.findUnique({
      where: { brandId: settlement.brandId },
    });

    const vatRate = brandTerms?.vatRate ?? 0;
    const commissionValue = brandTerms?.commissionValue ?? 0;
    const commissionType = brandTerms?.commissionType ?? "Percentage";

    // Commission calculation
    const commissionAmount =
      commissionType === "Fixed"
        ? commissionValue
        : (settlement.totalSoldAmount * commissionValue) / 100;

    // VAT calculation
    const vatAmount = ((settlement.totalSoldAmount - commissionAmount) * vatRate) / 100;

    // Net payable (includes VAT)
    const netPayable = settlement.totalSoldAmount - commissionAmount + vatAmount;

    // Handle rounding & overpayment
    const tolerance = 0.01;
    let paymentToApply = partialAmountNum;
    if (paymentToApply > netPayable + tolerance) {
      paymentToApply = netPayable;
    }

    const remainingAmount = Math.max(0, netPayable - paymentToApply);
    const isFullPayment = remainingAmount <= tolerance;

    // Generate unique payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // FULL PAYMENT
    if (isFullPayment) {
      const updatedSettlement = await prisma.settlements.update({
        where: { id: settlementId },
        data: {
          status: "Paid",
          paidAt: new Date(),
          paymentReference,
          commissionAmount: Math.round(commissionAmount),
          vatAmount: Math.round(vatAmount),
          netPayable: Math.round(netPayable),
          remainingAmount: 0,
          notes:
            notes ||
            `Full payment of ${paymentToApply} processed (Commission: ${commissionAmount}, VAT: ${vatAmount})`,
        },
      });

      return {
        success: true,
        message: `Full settlement of ${paymentToApply} processed successfully for ${settlement.brand.brandName}`,
        paymentType: "full",
        data: {
          settlement: updatedSettlement,
          amountPaid: paymentToApply,
          remainingAmount: 0,
          paymentReference,
        },
      };
    }

    // PARTIAL PAYMENT
    const [updatedSettlement, newSettlement] = await prisma.$transaction([
      prisma.settlements.update({
        where: { id: settlementId },
        data: {
          status: "Paid",
          paidAt: new Date(),
          netPayable: paymentToApply,
          paymentReference,
          commissionAmount: Math.round(commissionAmount),
          vatAmount: Math.round(vatAmount),
          remainingAmount: Math.round(remainingAmount),
          notes:
            notes ||
            `Partial payment of ${paymentToApply} processed. Remaining: ${remainingAmount.toFixed(
              2
            )} (Commission: ${commissionAmount}, VAT: ${vatAmount})`,
        },
      }),
      prisma.settlements.create({
        data: {
          brandId: settlement.brandId,
          settlementPeriod: settlement.settlementPeriod,
          periodStart: settlement.periodStart,
          periodEnd: settlement.periodEnd,
          totalSold: 0,
          totalSoldAmount: 0,
          totalRedeemed: 0,
          redeemedAmount: 0,
          outstanding: 0,
          outstandingAmount: 0,
          commissionAmount: 0,
          breakageAmount: 0,
          vatAmount: 0,
          netPayable: Math.round(remainingAmount),
          remainingAmount: Math.round(remainingAmount),
          status: "Pending",
          notes: `Remaining balance from settlement ${settlementId}. Original: ${netPayable}, Paid: ${paymentToApply}, Remaining: ${remainingAmount}`,
        },
      }),
    ]);

    return {
      success: true,
      message: `Partial payment of ${paymentToApply} processed successfully for ${settlement.brand.brandName}`,
      paymentType: "partial",
      data: {
        paidSettlement: updatedSettlement,
        newSettlement,
        amountPaid: paymentToApply,
        remainingAmount,
        paymentReference,
      },
    };
  } catch (error) {
    console.error("Process Settlement Error:", error);
    return {
      success: false,
      message: "Failed to process settlement",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    };
  }
}

/* Helper Functions */
function getDateRange(period) {
  const now = new Date();
  let start, end;
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

function buildDateFilter(dateRange, field = "createdAt") {
  if (!dateRange.start || !dateRange.end) return {};
  return {
    [field]: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
}