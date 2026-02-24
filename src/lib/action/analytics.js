"use server"

import { prisma } from '../db'

export async function fetchAnalyticsData(params = {}) {
  try {
    const { 
      period = "lastMonth", 
      brandId = null,
      dateFrom = null,
      dateTo = null,
      filterMonth = null
    } = params;

    // Calculate date range - filterMonth takes priority, then custom dates, then period
    let dateRange;
    
    if (filterMonth) {
      // Month filter provided (format: "YYYY-MM")
      const [year, month] = filterMonth.split('-').map(Number);
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      dateRange = { start, end };
    } else if (dateFrom && dateTo) {
      // Both dates provided - use custom range
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      
      dateRange = { start, end };
    } else if (dateFrom || dateTo) {
      // Only one date provided - use period-based range but adjust
      const periodRange = getDateRange(period);
      
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        dateRange = { start, end: periodRange.end };
      } else {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateRange = { start: periodRange.start, end };
      }
    } else {
      // Use period-based date range
      dateRange = getDateRange(period);
    }

    // Fetch analytics data in parallel
    const [brandRedemptions, settlements] = await Promise.all([
      getBrandRedemptionMetrics(dateRange, brandId),
      getSettlementData(dateRange, brandId),
    ]);

    return {
      success: true,
      brandRedemptions,
      settlements,
      period: filterMonth || period,
      filterMonth,
      dateRange: {
        start: dateRange.start?.toISOString(),
        end: dateRange.end?.toISOString(),
      }
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      success: false,
      brandRedemptions: [],
      settlements: [],
      period: "lastMonth",
      filterMonth: null,
      error: error.message
    };
  }
}

// Get brand redemption metrics - formatted for frontend
async function getBrandRedemptionMetrics(dateRange, brandIdFilter = null) {
  const dateFilter = buildDateFilter(dateRange);

  // Build brand where clause
  const brandWhere = {
    isActive: true,
  };
  
  // If specific brand is filtered, only get that brand
  if (brandIdFilter) {
    brandWhere.id = brandIdFilter;
  }

  // Get all active brands (or specific brand if filtered)
  const brands = await prisma.brand.findMany({
    where: brandWhere,
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
            paymentStatus: "COMPLETED",
            ...dateFilter,
          },
        },
      });

      // Get all voucher codes with their redemption data
      const voucherCodesWithRedemptions = await prisma.voucherCode.findMany({
        where: {
          order: {
            brandId: brand.id,
            paymentStatus: "COMPLETED",
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

      // Calculate total issued value
      const totalIssuedValue = voucherCodesWithRedemptions.reduce(
        (sum, vc) => sum + vc.originalValue,
        0
      );

      // Count redeemed vouchers using multiple criteria
      const redeemedVouchers = voucherCodesWithRedemptions.filter((vc) => {
        const hasRedemptionRecords = vc._count.redemptions > 0;
        const isMarkedRedeemed = vc.isRedeemed === true;
        const hasBeenUsed = vc.remainingValue < vc.originalValue;

        return hasRedemptionRecords || isMarkedRedeemed || hasBeenUsed;
      }).length;

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

      // Calculate redemption rate
      const redemptionRate =
        totalIssuedValue > 0
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
    "bg-gray-100",
    "bg-pink-50",
    "bg-yellow-50",
    "bg-red-50",
    "bg-blue-50",
    "bg-red-50",
    "bg-gray-100",
    "bg-orange-50",
  ];

  return filteredBrands.map((brand, index) => ({
    ...brand,
    bgColor: bgColors[index],
  }));
}

// Get settlement data - formatted for frontend with proper calculation
async function getSettlementData(dateRange, brandIdFilter = null) {
  const { start, end } = dateRange;
  
  // If no date range, default to last month
  let startDate = start;
  let endDate = end;
  
  if (!startDate || !endDate) {
    const now = new Date();
    const lastMonth = now.getMonth() - 1;
    const yearForLastMonth = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
    
    startDate = new Date(yearForLastMonth, adjustedLastMonth, 1, 0, 0, 0, 0);
    endDate = new Date(yearForLastMonth, adjustedLastMonth + 1, 0, 23, 59, 59, 999);
  }

  // Build where clause
  const whereClause = {
    OR: [
      {
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      {
        periodEnd: {
          gte: startDate,
          lte: endDate,
        },
      },
      {
        AND: [
          {
            periodStart: {
              lte: startDate,
            },
          },
          {
            periodEnd: {
              gte: endDate,
            },
          },
        ],
      },
    ],
  };

  // Add brand filter if provided
  if (brandIdFilter) {
    whereClause.brandId = brandIdFilter;
  }

  // Get settlements with brand details and terms
  const settlements = await prisma.settlements.findMany({
    where: whereClause,
    include: {
      brand: {
        select: {
          id: true,
          brandName: true,
          logo: true,
          currency: true,
          brandTerms: {
            select: {
              settlementTrigger: true,
              commissionType: true,
              commissionValue: true,
              breakageShare: true,
              vatRate: true,
            },
          },
        },
      },
    },
    orderBy: {
      periodStart: "desc",
    },
  });

  // Process settlements with proper calculation logic
  const processedSettlements = settlements.map((settlement) => {
    const brandTerms = settlement.brand?.brandTerms;
    const currency = settlement.brand?.currency || "USD";

    const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";
    const baseAmount =
      settlementTrigger === "onRedemption"
        ? settlement.redeemedAmount
        : settlement.totalSoldAmount;

    // Commission calculation
    let calculatedCommission = 0;
    if (brandTerms && baseAmount > 0) {
      if (brandTerms.commissionType === "Percentage") {
        calculatedCommission = Math.round(
          (baseAmount * brandTerms.commissionValue) / 100
        );
      } else if (brandTerms.commissionType === "Fixed") {
        const itemCount =
          settlementTrigger === "onRedemption"
            ? settlement.totalRedeemed
            : settlement.totalSold;
        calculatedCommission = Math.round(
          brandTerms.commissionValue * itemCount
        );
      }
    }

    const commissionAmount =
      settlement.commissionAmount === 0 && baseAmount > 0
        ? calculatedCommission
        : (settlement.commissionAmount ?? calculatedCommission);

    // VAT calculation
    const vatRate = brandTerms?.vatRate || 0;
    const calculatedVatAmount = Math.round(
      (commissionAmount * vatRate) / 100
    );

    const vatAmount =
      settlement.vatAmount === 0 && commissionAmount > 0
        ? calculatedVatAmount
        : (settlement.vatAmount ?? calculatedVatAmount);

    // Breakage calculation
    let calculatedBreakageAmount = 0;
    if (brandTerms?.breakageShare && settlement.outstandingAmount > 0) {
      calculatedBreakageAmount = Math.round(
        (settlement.outstandingAmount * brandTerms.breakageShare) / 100
      );
    }

    const breakageAmount =
      settlement.breakageAmount === 0 && settlement.outstandingAmount > 0 && brandTerms?.breakageShare
        ? calculatedBreakageAmount
        : (settlement.breakageAmount ?? calculatedBreakageAmount);

    // Net payable calculation
    let calculatedNetPayable = 0;
    if (baseAmount > 0) {
      calculatedNetPayable =
        baseAmount - commissionAmount + vatAmount - breakageAmount;
    }

    const netPayable =
      settlement.netPayable === 0 && baseAmount > 0
        ? calculatedNetPayable
        : (settlement.netPayable ?? calculatedNetPayable);

    // Calculate dynamic status
    const totalPaid = settlement.totalPaid || 0;
    const remainingAmount = Math.max(0, netPayable - totalPaid);
    
    let dynamicStatus;
    if (remainingAmount === 0 && totalPaid > 0) {
      dynamicStatus = "Paid";
    } else if (totalPaid > 0 && remainingAmount > 0) {
      dynamicStatus = "Partial";
    } else {
      dynamicStatus = settlement.status || "Pending";
    }

    return {
      brand: settlement.brand.brandName,
      amount: Math.round(netPayable),
      status: dynamicStatus,
      currency,
      periodStart: settlement.periodStart,
      periodEnd: settlement.periodEnd,
      settlementPeriod: settlement.settlementPeriod,
      totalPaid: Math.round(totalPaid),
      remainingAmount: Math.round(remainingAmount),
      baseAmount: Math.round(baseAmount),
      commissionAmount: Math.round(commissionAmount),
      vatAmount: Math.round(vatAmount),
      breakageAmount: Math.round(breakageAmount),
    };
  });

  return processedSettlements;
}

// Helper function to get all brands for filter dropdown
export async function getBrandsForAnalytics() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        brandName: true,
      },
      orderBy: {
        brandName: 'asc',
      },
    });

    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    console.error("Failed to get brands:", error);
    return {
      success: false,
      message: "Failed to fetch brands.",
      data: [],
    };
  }
}

export async function fetchBrandAnalytics({ filterMonth = null, filterYear = null, search = null } = {}) {
  try {
    console.log("*******", filterMonth, filterYear, search);
    
    // Parse filterMonth if provided (format: "YYYY-MM")
    let parsedYear = filterYear;
    let parsedMonth = filterMonth;
    
    if (filterMonth && typeof filterMonth === 'string' && filterMonth.includes('-')) {
      const [year, month] = filterMonth.split('-');
      parsedYear = parseInt(year);
      parsedMonth = parseInt(month);
    }

    // ==================== DATE RANGE FILTER ====================
    let startDate, endDate;

    if (parsedMonth && parsedYear) {
      startDate = new Date(parsedYear, parsedMonth - 1, 1);
      endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);
    } else if (parsedYear) {
      startDate = new Date(parsedYear, 0, 1);
      endDate = new Date(parsedYear, 11, 31, 23, 59, 59, 999);
    } else {
      // Default to last month if no filters
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    };

    // Build search filter
    const searchFilter = search && typeof search === 'string' ? {
      brandName: {
        contains: search,
        mode: 'insensitive'
      }
    } : {};

    // Get all active brands with their complete details
    const brands = await prisma.brand.findMany({
      where: { 
        isActive: true,
        ...searchFilter
      },
      select: {
        id: true,
        brandName: true,
        logo: true,
        currency: true,
        brandTerms: {
          select: {
            settlementTrigger: true,
            commissionType: true,
            commissionValue: true,
            breakageShare: true,
            vatRate: true,
          },
        },
      },
      orderBy: { brandName: "asc" },
    });
    
    // Get analytics data for each brand
    const brandAnalytics = await Promise.all(
      brands.map(async (brand) => {
        const brandTerms = brand.brandTerms;
        const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";
        const commissionType = brandTerms?.commissionType || "Percentage";
        const commissionValue = brandTerms?.commissionValue || 0;
        const breakageShare = brandTerms?.breakageShare || 0;
        const vatRate = brandTerms?.vatRate || 0;
        const currency = brand.currency || "ZAR";

        // Get existing settlements for this brand in the period
        const settlements = await prisma.settlements.findMany({
          where: { 
            brandId: brand.id,
            periodStart: {
              gte: startDate,
              lte: endDate,
            }
          },
          select: {
            id: true,
            status: true,
            totalSold: true,
            totalSoldAmount: true,
            totalRedeemed: true,
            redeemedAmount: true,
            outstanding: true,
            outstandingAmount: true,
            commissionAmount: true,
            breakageAmount: true,
            vatAmount: true,
            netPayable: true,
            totalPaid: true,
            remainingAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const latestSettlement = settlements[0] || null;

        let totalIssued = 0;
        let totalIssuedValue = 0;
        let totalRedeemed = 0;
        let totalRedeemedValue = 0;
        let outstandingCount = 0;
        let outstandingAmount = 0;
        let expiredCount = 0;
        let totalBreakageValue = 0;

        if (latestSettlement) {
          totalIssued = latestSettlement.totalSold || 0;
          totalIssuedValue = latestSettlement.totalSoldAmount || 0;
          totalRedeemed = latestSettlement.totalRedeemed || 0;
          totalRedeemedValue = latestSettlement.redeemedAmount || 0;
          outstandingCount = latestSettlement.outstanding || 0;
          outstandingAmount = latestSettlement.outstandingAmount || 0;
          totalBreakageValue = latestSettlement.breakageAmount || 0;
        } else {
          const voucherCodes = await prisma.voucherCode.findMany({
            where: {
              order: {
                brandId: brand.id,
                paymentStatus: "COMPLETED",
                ...dateFilter,
              },
            },
            select: {
              id: true,
              isRedeemed: true,
              originalValue: true,
              remainingValue: true,
              expiresAt: true,
              _count: {
                select: { redemptions: true },
              },
            },
          });

          totalIssued = voucherCodes.length;

          const totalIssuedValueAgg = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { 
              brandId: brand.id, 
              paymentStatus: "COMPLETED",
              ...dateFilter 
            },
          });
          totalIssuedValue = totalIssuedValueAgg._sum.totalAmount || 0;

          const redeemedVouchers = voucherCodes.filter(
            (vc) =>
              vc._count.redemptions > 0 ||
              vc.isRedeemed ||
              vc.remainingValue < vc.originalValue
          );
          totalRedeemed = redeemedVouchers.length;

          totalRedeemedValue = voucherCodes.reduce(
            (sum, vc) => sum + (vc.originalValue - vc.remainingValue),
            0
          );

          const outstandingVouchers = voucherCodes.filter(
            (vc) => vc.remainingValue > 0 && vc._count.redemptions === 0
          );
          outstandingCount = outstandingVouchers.length;
          outstandingAmount = voucherCodes.reduce(
            (sum, vc) => sum + vc.remainingValue,
            0
          );

          const now = new Date();
          const expiredVouchers = voucherCodes.filter(
            (vc) => vc.expiresAt && new Date(vc.expiresAt) < now && vc.remainingValue > 0
          );
          expiredCount = expiredVouchers.length;
          totalBreakageValue = expiredVouchers.reduce(
            (sum, vc) => sum + vc.remainingValue,
            0
          );
        }

        let baseAmount = 0;
        let commissionAmount = 0;
        let vatAmount = 0;
        let breakageAmount = 0;
        let netPayable = 0;

        if (latestSettlement) {
          baseAmount = settlementTrigger === "onRedemption" 
            ? (latestSettlement.redeemedAmount || 0)
            : (latestSettlement.totalSoldAmount || 0);
          
          commissionAmount = latestSettlement.commissionAmount || 0;
          vatAmount = latestSettlement.vatAmount || 0;
          breakageAmount = latestSettlement.breakageAmount || 0;
          netPayable = latestSettlement.netPayable || 0;
        } else {
          baseAmount = settlementTrigger === "onRedemption" 
            ? totalRedeemedValue 
            : totalIssuedValue;

          if (baseAmount > 0) {
            if (commissionType === "Percentage") {
              commissionAmount = Math.round((baseAmount * commissionValue) / 100);
            } else if (commissionType === "Fixed") {
              const itemCount = settlementTrigger === "onRedemption"
                ? totalRedeemed
                : totalIssued;
              commissionAmount = Math.round(commissionValue * itemCount);
            }
          }

          vatAmount = Math.round((commissionAmount * vatRate) / 100);

          breakageAmount = breakageShare && totalBreakageValue > 0
            ? Math.round((totalBreakageValue * breakageShare) / 100)
            : 0;

          netPayable = baseAmount - commissionAmount + vatAmount - breakageAmount;
        }

        const totalPaidAmount = settlements
          .filter((s) => s.status === "Paid")
          .reduce((sum, s) => sum + (s.totalPaid || 0), 0);

        const pendingSettlement = Math.max(0, netPayable - totalPaidAmount);

        const redemptionRate = totalIssuedValue > 0
          ? Math.round((totalRedeemedValue / totalIssuedValue) * 100)
          : 0;

        return {
          brandId: brand.id,
          brandName: brand.brandName,
          logo: brand.logo,
          currency,
          settlementTrigger,
          totalIssued,
          totalRedeemed,
          outstanding: outstandingCount,
          expired: expiredCount,
          totalIssuedValue,
          totalRedeemedValue,
          outstandingAmount,
          redemptionRate,
          settlementCalculation: {
            baseAmount,
            commissionAmount,
            commissionType,
            commissionValue,
            commissionPercentage: commissionType === "Percentage" ? commissionValue : null,
            commissionFixed: commissionType === "Fixed" ? commissionValue : null,
            breakageAmount,
            totalBreakageValue,
            breakageShare,
            vatAmount,
            vatRate,
            netPayable,
            trigger: settlementTrigger,
          },
          totalPaidAmount,
          pendingSettlement,
          settlementDetails: latestSettlement ? {
            id: latestSettlement.id,
            status: latestSettlement.status,
            netPayable: latestSettlement.netPayable,
            totalPaid: latestSettlement.totalPaid || 0,
            remainingAmount: latestSettlement.remainingAmount || 0,
            createdAt: latestSettlement.createdAt,
          } : null,
          hasSettlement: pendingSettlement > 0,
        };
      })
    );

    const filteredBrands = brandAnalytics
      .filter((b) => b.totalIssued > 0 || b.totalIssuedValue > 0)
      .sort((a, b) => b.totalIssuedValue - a.totalIssuedValue);

    let filterLabel;
    if (parsedMonth && parsedYear) {
      filterLabel = new Date(parsedYear, parsedMonth - 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (parsedYear) {
      filterLabel = parsedYear.toString();
    } else {
      filterLabel = startDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return {
      success: true,
      data: filteredBrands,
      summary: {
        totalBrands: filteredBrands.length,
        totalVouchersIssued: filteredBrands.reduce((sum, b) => sum + b.totalIssued, 0),
        totalVouchersRedeemed: filteredBrands.reduce((sum, b) => sum + b.totalRedeemed, 0),
        totalIssuedValue: filteredBrands.reduce((sum, b) => sum + b.totalIssuedValue, 0),
        totalRedeemedValue: filteredBrands.reduce((sum, b) => sum + b.totalRedeemedValue, 0),
        totalOutstandingAmount: filteredBrands.reduce((sum, b) => sum + b.outstandingAmount, 0),
        totalCommissionAmount: filteredBrands.reduce((sum, b) => sum + b.settlementCalculation.commissionAmount, 0),
        totalVatAmount: filteredBrands.reduce((sum, b) => sum + b.settlementCalculation.vatAmount, 0),
        totalBreakageAmount: filteredBrands.reduce((sum, b) => sum + b.settlementCalculation.breakageAmount, 0),
        totalNetPayable: filteredBrands.reduce((sum, b) => sum + b.settlementCalculation.netPayable, 0),
        totalPaidAmount: filteredBrands.reduce((sum, b) => sum + b.totalPaidAmount, 0),
        totalPendingSettlements: filteredBrands.reduce((sum, b) => sum + b.pendingSettlement, 0),
        onPurchaseBrands: filteredBrands.filter(b => b.settlementTrigger === "onPurchase").length,
        onRedemptionBrands: filteredBrands.filter(b => b.settlementTrigger === "onRedemption").length,
      },
      filters: {
        appliedMonth: filterMonth,
        appliedYear: filterYear,
        appliedSearch: search,
        period: filterLabel,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Brand Analytics Error:", error);
    return {
      success: false,
      data: [],
      summary: {
        totalBrands: 0,
        totalVouchersIssued: 0,
        totalVouchersRedeemed: 0,
        totalIssuedValue: 0,
        totalRedeemedValue: 0,
        totalOutstandingAmount: 0,
        totalCommissionAmount: 0,
        totalVatAmount: 0,
        totalBreakageAmount: 0,
        totalNetPayable: 0,
        totalPaidAmount: 0,
        totalPendingSettlements: 0,
        onPurchaseBrands: 0,
        onRedemptionBrands: 0,
      },
      filters: {
        appliedMonth: filterMonth,
        appliedYear: filterYear,
        appliedSearch: search,
        period: 'all',
      },
      error: error.message,
    };
  }
}

export async function processSettlement(settlementId, partialAmount, notes) {
  try {
    if (!settlementId) {
      return { success: false, message: "Settlement ID is required" };
    }

    const partialAmountNum = parseFloat(partialAmount);
    if (isNaN(partialAmountNum) || partialAmountNum <= 0) {
      return { success: false, message: "Valid numeric payment amount is required" };
    }

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

    const brandTerms = await prisma.brandTerms.findUnique({
      where: { brandId: settlement.brandId },
    });

    const vatRate = brandTerms?.vatRate ?? 0;
    const commissionValue = brandTerms?.commissionValue ?? 0;
    const commissionType = brandTerms?.commissionType ?? "Percentage";

    const commissionAmount =
      commissionType === "Fixed"
        ? commissionValue
        : (settlement.totalSoldAmount * commissionValue) / 100;

    const vatAmount = ((settlement.totalSoldAmount - commissionAmount) * vatRate) / 100;

    const netPayable = settlement.totalSoldAmount - commissionAmount + vatAmount;

    const tolerance = 0.01;
    let paymentToApply = partialAmountNum;
    if (paymentToApply > netPayable + tolerance) {
      paymentToApply = netPayable;
    }

    const remainingAmount = Math.max(0, netPayable - paymentToApply);
    const isFullPayment = remainingAmount <= tolerance;

    const paymentReference = `PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const existingHistory = Array.isArray(settlement.paymentHistory) 
      ? settlement.paymentHistory 
      : [];

    const newPaymentRecord = {
      id: `PAYMENT-${Date.now()}`,
      settlementId: settlementId,
      amount: paymentToApply,
      paidAt: new Date().toISOString(),
      reference: paymentReference,
      notes: notes || `Payment of ${paymentToApply} processed.`,
    };

    const updatedPaymentHistory = [...existingHistory, newPaymentRecord];

    if (isFullPayment) {
      const updatedSettlement = await prisma.settlements.update({
        where: { id: settlementId },
        data: {
          status: "Paid",
          totalPaid: netPayable,
          remainingAmount: 0,
          paidAt: new Date(),
          lastPaymentDate: new Date(),
          paymentCount: (settlement.paymentCount || 0) + 1,
          paymentReference: paymentReference,
          paymentHistory: updatedPaymentHistory,
        },
      });

      return {
        success: true,
        message: "Full payment processed successfully",
        data: updatedSettlement,
      };
    } else {
      const updatedTotalPaid = (settlement.totalPaid || 0) + paymentToApply;

      const updatedSettlement = await prisma.settlements.update({
        where: { id: settlementId },
        data: {
          status: "Partial",
          totalPaid: updatedTotalPaid,
          remainingAmount: remainingAmount,
          lastPaymentDate: new Date(),
          paymentCount: (settlement.paymentCount || 0) + 1,
          paymentReference: paymentReference,
          paymentHistory: updatedPaymentHistory,
        },
      });

      return {
        success: true,
        message: `Partial payment of ${paymentToApply} processed successfully. Remaining: ${remainingAmount.toFixed(2)}`,
        data: updatedSettlement,
      };
    }
  } catch (error) {
    console.error("Error processing settlement:", error);
    return {
      success: false,
      message: "An error occurred while processing the settlement.",
      error: error.message,
    };
  }
}

/* Helper Functions */
function getDateRange(period) {
  const now = new Date();
  let start, end;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      // Current month
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "lastMonth":
      // Previous month
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "all":
      start = null;
      end = null;
      break;
    default:
      // Default to last month
      const defaultLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = new Date(defaultLastMonth.getFullYear(), defaultLastMonth.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(defaultLastMonth.getFullYear(), defaultLastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
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