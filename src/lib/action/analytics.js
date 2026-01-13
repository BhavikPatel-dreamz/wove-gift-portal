"use server"

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
function getDateRanges(period = null, filterMonth = null, filterYear = null) {
  const now = new Date();
  let start, end;

  // ✅ numeric month + year
  if (filterMonth && filterYear) {
    const year = Number(filterYear);
    const month = Number(filterMonth);

    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59, 999);

    return { start, end };
  }

  if (filterYear) {
    start = new Date(Number(filterYear), 0, 1);
    end = new Date(Number(filterYear), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

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
    default:
      return { start: null, end: null };
  }

  return { start, end };
}


function buildDateFilters(dateRange, field = "createdAt") {
  if (!dateRange.start || !dateRange.end) return {};
  return {
    [field]: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
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

        // Get existing settlements for this brand in the period (FIRST - to match getSettlements logic)
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

        // Get latest settlement for reference
        const latestSettlement = settlements[0] || null;

        // If settlement exists, use its calculated values (like getSettlements does)
        let totalIssued = 0;
        let totalIssuedValue = 0;
        let totalRedeemed = 0;
        let totalRedeemedValue = 0;
        let outstandingCount = 0;
        let outstandingAmount = 0;
        let expiredCount = 0;
        let totalBreakageValue = 0;

        if (latestSettlement) {
          // Use settlement data directly (this is what getSettlements shows)
          totalIssued = latestSettlement.totalSold || 0;
          totalIssuedValue = latestSettlement.totalSoldAmount || 0;
          totalRedeemed = latestSettlement.totalRedeemed || 0;
          totalRedeemedValue = latestSettlement.redeemedAmount || 0;
          outstandingCount = latestSettlement.outstanding || 0;
          outstandingAmount = latestSettlement.outstandingAmount || 0;
          totalBreakageValue = latestSettlement.breakageAmount || 0;
        } else {
          // Fallback: Calculate from voucher codes if no settlement exists
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

          // Total issued value
          const totalIssuedValueAgg = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { 
              brandId: brand.id, 
              paymentStatus: "COMPLETED",
              ...dateFilter 
            },
          });
          totalIssuedValue = totalIssuedValueAgg._sum.totalAmount || 0;

          // Count redeemed vouchers
          const redeemedVouchers = voucherCodes.filter(
            (vc) =>
              vc._count.redemptions > 0 ||
              vc.isRedeemed ||
              vc.remainingValue < vc.originalValue
          );
          totalRedeemed = redeemedVouchers.length;

          // Calculate total redeemed value
          totalRedeemedValue = voucherCodes.reduce(
            (sum, vc) => sum + (vc.originalValue - vc.remainingValue),
            0
          );

          // Calculate outstanding
          const outstandingVouchers = voucherCodes.filter(
            (vc) => vc.remainingValue > 0 && vc._count.redemptions === 0
          );
          outstandingCount = outstandingVouchers.length;
          outstandingAmount = voucherCodes.reduce(
            (sum, vc) => sum + vc.remainingValue,
            0
          );

          // Calculate breakage
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

        // ==================== SETTLEMENT CALCULATIONS ====================
        
        // If settlement exists, use its pre-calculated values (MATCH getSettlements exactly)
        let baseAmount = 0;
        let commissionAmount = 0;
        let vatAmount = 0;
        let breakageAmount = 0;
        let netPayable = 0;

        if (latestSettlement) {
          // Use values from settlement (this is what getSettlements displays)
          baseAmount = settlementTrigger === "onRedemption" 
            ? (latestSettlement.redeemedAmount || 0)
            : (latestSettlement.totalSoldAmount || 0);
          
          commissionAmount = latestSettlement.commissionAmount || 0;
          vatAmount = latestSettlement.vatAmount || 0;
          breakageAmount = latestSettlement.breakageAmount || 0;
          netPayable = latestSettlement.netPayable || 0;
        } else {
          // Calculate if no settlement exists (fallback calculation)
          baseAmount = settlementTrigger === "onRedemption" 
            ? totalRedeemedValue 
            : totalIssuedValue;

          // Calculate commission based on type
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

          // Calculate VAT on commission
          vatAmount = Math.round((commissionAmount * vatRate) / 100);

          // Calculate breakage
          breakageAmount = breakageShare && totalBreakageValue > 0
            ? Math.round((totalBreakageValue * breakageShare) / 100)
            : 0;

          // Calculate net payable
          netPayable = baseAmount - commissionAmount + vatAmount - breakageAmount;
        }

        // Calculate total paid amount (from all Paid settlements)
        const totalPaidAmount = settlements
          .filter((s) => s.status === "Paid")
          .reduce((sum, s) => sum + (s.totalPaid || 0), 0);

        // Calculate pending settlement (what still needs to be paid)
        const pendingSettlement = Math.max(0, netPayable - totalPaidAmount);

        // Redemption rate (always redeemed value / issued value)
        const redemptionRate = totalIssuedValue > 0
          ? Math.round((totalRedeemedValue / totalIssuedValue) * 100)
          : 0;

        return {
          brandId: brand.id,
          brandName: brand.brandName,
          logo: brand.logo,
          currency,
          
          // Settlement configuration
          settlementTrigger,
          
          // Voucher counts (from settlement or calculated)
          totalIssued,
          totalRedeemed,
          outstanding: outstandingCount,
          expired: expiredCount,
          
          // Amounts (from settlement or calculated)
          totalIssuedValue,
          totalRedeemedValue,
          outstandingAmount,
          
          // Performance metrics
          redemptionRate,
          
          // Settlement calculations (MATCHING getSettlements exactly)
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
          
          // Payment tracking
          totalPaidAmount,
          pendingSettlement,
          
          // Settlement details (if exists)
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

    // Filter brands with activity
    const filteredBrands = brandAnalytics
      .filter((b) => b.totalIssued > 0 || b.totalIssuedValue > 0)
      .sort((a, b) => b.totalIssuedValue - a.totalIssuedValue);

    // Determine filter label
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

    // Summary totals
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
          totalPaid: netPayable,
          remainingAmount: 0,
          lastPaymentDate: new Date(),
          paymentCount: { increment: 1 },
          paymentHistory: {
            push: {
              id: settlementId,
              amount: paymentToApply,
              paidAt: new Date(),
              reference: paymentReference,
              notes: notes || `Full payment of ${paymentToApply} processed.`,
            },
          },
        },
      });

      return {
        success: true,
        message: "Full payment processed successfully",
        data: updatedSettlement,
      };
    } else {
      // PARTIAL PAYMENT
      const updatedTotalPaid = (settlement.totalPaid || 0) + paymentToApply;

      const updatedSettlement = await prisma.settlements.update({
        where: { id: settlementId },
        data: {
          status: "Partial",
          totalPaid: updatedTotalPaid,
          remainingAmount: remainingAmount,
          lastPaymentDate: new Date(),
          paymentCount: { increment: 1 },
          paymentHistory: {
            push: {
              id: settlementId,
              amount: paymentToApply,
              paidAt: new Date(),
              reference: paymentReference,
              notes: notes || `Partial payment of ${paymentToApply} processed.`,
            },
          },
        },
      });

      return {
        success: true,
        message: `Partial payment of ${paymentToApply} processed successfully`,
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