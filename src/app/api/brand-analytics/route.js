import { NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "year";

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

        // 🔹 Total sold value (sum of all settlements for this brand)
        const totalSoldAgg = await prisma.settlements.aggregate({
          _sum: { totalSoldAmount: true },
          where: { brandId: brand.id, ...dateFilter },
        });
        const totalIssuedValue = totalSoldAgg._sum.totalSoldAmount || 0;

        // 🔹 Count redeemed vouchers
        const redeemedVouchers = voucherCodes.filter(
          (vc) =>
            vc._count.redemptions > 0 ||
            vc.isRedeemed ||
            vc.remainingValue < vc.originalValue
        );
        const totalRedeemed = redeemedVouchers.length;

        // 🔹 Calculate total redeemed value
        const totalRedeemedValue = voucherCodes.reduce(
          (sum, vc) => sum + (vc.originalValue - vc.remainingValue),
          0
        );

        // 🔹 Redemption rate
        const redemptionRate =
          totalIssued > 0
            ? parseFloat(((totalRedeemed / totalIssued) * 100).toFixed(2))
            : 0.0;

        // 🔹 Aggregate settlements to compute paid vs sold
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

        // 🔹 Pending settlement dynamically
        const pendingSettlement = totalSoldAmount - totalPaidAmount;

        // 🔹 Latest settlement for details
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

    // 🔹 Filter & sort brands
    const filteredBrands = brandAnalytics
      .filter((b) => b.totalIssued > 0 || b.totalIssuedValue > 0)
      .sort((a, b) => b.totalIssuedValue - a.totalIssuedValue);

    // 🔹 Summary totals
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Brand Analytics API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch brand analytics data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ================================
   POST: Process Partial Settlement
================================ */
export async function POST(request) {
  try {
    const body = await request.json();
    const { settlementId, partialAmount, notes } = body;

    // 🔹 Validation
    if (!settlementId) {
      return NextResponse.json(
        { success: false, message: "Settlement ID is required" },
        { status: 400 }
      );
    }

    const partialAmountNum = parseFloat(partialAmount);
    if (isNaN(partialAmountNum) || partialAmountNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid numeric payment amount is required" },
        { status: 400 }
      );
    }

    // 🔹 Fetch settlement + brand
    const settlement = await prisma.settlements.findUnique({
      where: { id: settlementId },
      include: { brand: true },
    });

    if (!settlement) {
      return NextResponse.json(
        { success: false, message: "Settlement not found" },
        { status: 404 }
      );
    }

    if (settlement.status === "Paid") {
      return NextResponse.json(
        { success: false, message: "Settlement already fully paid" },
        { status: 400 }
      );
    }

    // 🔹 Fetch brand terms for commission + VAT
    const brandTerms = await prisma.brandTerms.findUnique({
      where: { brandId: settlement.brandId },
    });

    const vatRate = brandTerms?.vatRate ?? 0;
    const commissionValue = brandTerms?.commissionValue ?? 0;
    const commissionType = brandTerms?.commissionType ?? "Percentage";

    // 🔹 Commission calculation
    const commissionAmount =
      commissionType === "Fixed"
        ? commissionValue
        : (settlement.totalSoldAmount * commissionValue) / 100;

    // 🔹 VAT calculation
    const vatAmount = ((settlement.totalSoldAmount - commissionAmount) * vatRate) / 100;

    // 🔹 Net payable (includes VAT)
    const netPayable = settlement.totalSoldAmount - commissionAmount + vatAmount;

    // 🔹 Handle rounding & overpayment
    const tolerance = 0.01;
    let paymentToApply = partialAmountNum;
    if (paymentToApply > netPayable + tolerance) {
      paymentToApply = netPayable;
    }

    const remainingAmount = Math.max(0, netPayable - paymentToApply);
    const isFullPayment = remainingAmount <= tolerance;

    // 🔹 Generate unique payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // ✅ FULL PAYMENT
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

      return NextResponse.json({
        success: true,
        message: `Full settlement of ${paymentToApply} processed successfully for ${settlement.brand.brandName}`,
        paymentType: "full",
        data: {
          settlement: updatedSettlement,
          amountPaid: paymentToApply,
          remainingAmount: 0,
          paymentReference,
        },
      });
    }

    // ✅ PARTIAL PAYMENT
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Process Settlement Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process settlement",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ================================
   Helper Functions
================================ */
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
