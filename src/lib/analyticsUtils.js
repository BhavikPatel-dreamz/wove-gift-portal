import prisma from "./db";

// Helper function to get date range
export function getDateRange(period) {
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
export function buildDateFilter(dateRange, field = "createdAt") {
  if (!dateRange.start || !dateRange.end) return {};

  return {
    [field]: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
}

// Get all active brands
export async function getAllActiveBrands() {
  return prisma.brand.findMany({
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
}

// Get voucher codes with redemptions for a brand
export async function getVoucherCodesWithRedemptions(brandId, dateFilter) {
  return prisma.voucherCode.findMany({
    where: {
      order: {
        brandId,
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
}

// Count total voucher codes for a brand
export async function countTotalVouchers(brandId, dateFilter) {
  return prisma.voucherCode.count({
    where: {
      order: {
        brandId,
        ...dateFilter,
      },
    },
  });
}

// Get brand redemption metrics
export async function getBrandRedemptionMetrics(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  // Get all active brands
  const brands = await getAllActiveBrands();

  // Get redemption data for each brand
  const brandRedemptions = await Promise.all(
    brands.map(async (brand) => {
      // Count total voucher codes for this brand from completed orders
      const totalVouchers = await countTotalVouchers(brand.id, dateFilter);

      // Get all voucher codes with their redemption data
      const voucherCodesWithRedemptions = await getVoucherCodesWithRedemptions(
        brand.id,
        dateFilter
      );

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

      // �� Calculate total used (sum of used amounts for vouchers that have been redeemed or partially used)
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

  // Return with background colors
  return filteredBrands.map((brand, index) => ({
    ...brand,
    bgColor: bgColors[index],
  }));
}

// Get pending settlements
export async function getPendingSettlements(dateRange) {
  const dateFilter = buildDateFilter(dateRange);

  return prisma.settlements.findMany({
    where: {
      status: "Pending",
      ...dateFilter,
    },
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
    take: 6, // Top 6 pending settlements
  });
}

// Get settlement data - formatted for frontend
export async function getSettlementData(dateRange) {
  // Get pending settlements with brand details
  const pendingSettlements = await getPendingSettlements(dateRange);

  // Format settlements to match frontend expectations
  return pendingSettlements.map((settlement) => ({
    brand: settlement.brand.brandName,
    amount: Math.round(settlement.netPayable),
    status: settlement.status,
  }));
}
