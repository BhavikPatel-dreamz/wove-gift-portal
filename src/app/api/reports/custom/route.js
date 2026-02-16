import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { startDate, endDate, brand, status, reports, format, shop } = body;

    // Validation
    if (!startDate || !endDate || !reports || reports.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Build base where clause
    const whereClause = {
      createdAt: { gte: start, lte: end },
    };

    if (shop) {
      whereClause.brand = { domain: shop };
    }

    if (brand && brand !== "all") {
      whereClause.brandId = brand;
    }

    if (status && status !== "all") {
      whereClause.paymentStatus = status.toUpperCase();
    }

    // Generate selected reports in parallel for better performance
    const reportPromises = {};
    
    for (const reportType of reports) {
      switch (reportType) {
        case "salesSummary":
          reportPromises.salesSummary = generateSalesSummary(whereClause);
          break;
        case "redemptionDetails":
          reportPromises.redemptionDetails = generateRedemptionDetails(whereClause);
          break;
        case "settlementReports":
          reportPromises.settlementReports = generateSettlementReports(start, end, brand, shop, status);
          break;
        case "transactionLog":
          reportPromises.transactionLog = generateTransactionLog(whereClause);
          break;
        case "brandPerformance":
          reportPromises.brandPerformance = generateBrandPerformance(whereClause);
          break;
        case "liabilitySnapshot":
          reportPromises.liabilitySnapshot = generateLiabilitySnapshot(brand, shop);
          break;
      }
    }

    // Execute all report queries in parallel
    const reportData = await Promise.all(
      Object.entries(reportPromises).map(async ([key, promise]) => [key, await promise])
    ).then(results => Object.fromEntries(results));

    // Format response based on requested format
    if (format === "csv") {
      const csvData = convertToCSV(reportData, start, end);

      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="custom-report-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      period: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      },
      filters: {
        brand: brand || "all",
        status: status || "all",
        shop: shop || "all",
      },
      format,
      generatedAt: new Date().toISOString(),
      data: reportData,
    });
  } catch (error) {
    console.error("Custom Report API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate custom report",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// ==================== OPTIMIZED REPORT GENERATORS ====================

async function generateSalesSummary(whereClause) {
  // Single optimized query with select to reduce data transfer
  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      orderNumber: true,
      totalAmount: true,
      discount: true,
      quantity: true,
      paymentMethod: true,
      createdAt: true,
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Use reduce for efficient aggregation
  const { totalRevenue, totalDiscount, totalQuantity, revenueByPaymentMethod, dailyRevenue } = 
    orders.reduce((acc, order) => {
      acc.totalRevenue += order.totalAmount;
      acc.totalDiscount += order.discount;
      acc.totalQuantity += order.quantity;

      // Revenue by payment method
      const method = order.paymentMethod || "Unknown";
      if (!acc.revenueByPaymentMethod[method]) {
        acc.revenueByPaymentMethod[method] = { orders: 0, revenue: 0 };
      }
      acc.revenueByPaymentMethod[method].orders++;
      acc.revenueByPaymentMethod[method].revenue += order.totalAmount;

      // Daily revenue
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc.dailyRevenue[date]) {
        acc.dailyRevenue[date] = { orders: 0, revenue: 0, quantity: 0 };
      }
      acc.dailyRevenue[date].orders++;
      acc.dailyRevenue[date].revenue += order.totalAmount;
      acc.dailyRevenue[date].quantity += order.quantity;

      return acc;
    }, {
      totalRevenue: 0,
      totalDiscount: 0,
      totalQuantity: 0,
      revenueByPaymentMethod: {},
      dailyRevenue: {}
    });

  return {
    summary: {
      totalOrders: orders.length,
      totalRevenue,
      totalDiscount,
      totalQuantity,
      avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    },
    revenueByPaymentMethod: Object.entries(revenueByPaymentMethod).map(([method, data]) => ({
      method,
      ...data,
    })),
    dailyBreakdown: Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data })),
    orders: orders.slice(0, 100).map((o) => ({
      orderNumber: o.orderNumber,
      brandName: o.brand.brandName,
      customer: `${o.user.firstName} ${o.user.lastName}`,
      customerEmail: o.user.email,
      amount: o.totalAmount,
      discount: o.discount,
      quantity: o.quantity,
      paymentMethod: o.paymentMethod,
      date: o.createdAt.toISOString().split("T")[0],
    })),
  };
}

async function generateRedemptionDetails(whereClause) {
  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      orderNumber: true,
      brand: { select: { brandName: true } },
      voucherCodes: {
        select: {
          code: true,
          originalValue: true,
          remainingValue: true,
          isRedeemed: true,
          createdAt: true,
          redeemedAt: true,
          expiresAt: true,
          redemptions: {
            select: {
              amountRedeemed: true,
              balanceAfter: true,
              redeemedAt: true,
              transactionId: true,
            },
            orderBy: { redeemedAt: "desc" },
          },
        },
      },
    },
  });

  let totalIssued = 0;
  let totalRedeemed = 0;
  let totalPartiallyRedeemed = 0;
  let totalActive = 0;
  let totalIssuedValue = 0;
  let totalRedeemedValue = 0;
  const voucherDetails = [];

  orders.forEach((order) => {
    order.voucherCodes.forEach((vc) => {
      totalIssued++;
      totalIssuedValue += vc.originalValue;

      const usedValue = vc.originalValue - vc.remainingValue;
      totalRedeemedValue += usedValue;

      let status = "Active";
      if (vc.isRedeemed || vc.remainingValue === 0) {
        status = "Fully Redeemed";
        totalRedeemed++;
      } else if (vc.remainingValue < vc.originalValue) {
        status = "Partially Redeemed";
        totalPartiallyRedeemed++;
      } else {
        totalActive++;
      }

      voucherDetails.push({
        code: vc.code,
        orderNumber: order.orderNumber,
        brandName: order.brand.brandName,
        originalValue: vc.originalValue,
        remainingValue: vc.remainingValue,
        usedValue,
        status,
        issuedDate: vc.createdAt.toISOString().split("T")[0],
        redeemedDate: vc.redeemedAt ? vc.redeemedAt.toISOString().split("T")[0] : null,
        expiresAt: vc.expiresAt ? vc.expiresAt.toISOString().split("T")[0] : null,
        redemptionCount: vc.redemptions.length,
        redemptions: vc.redemptions.map((r) => ({
          amount: r.amountRedeemed,
          balanceAfter: r.balanceAfter,
          date: r.redeemedAt.toISOString().split("T")[0],
          transactionId: r.transactionId,
        })),
      });
    });
  });

  const redemptionRate =
    totalIssuedValue > 0 ? ((totalRedeemedValue / totalIssuedValue) * 100).toFixed(2) : 0;

  return {
    summary: {
      totalIssued,
      totalRedeemed,
      totalPartiallyRedeemed,
      totalActive,
      totalIssuedValue,
      totalRedeemedValue,
      redemptionRate: parseFloat(redemptionRate),
    },
    vouchers: voucherDetails
      .sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
      .slice(0, 500),
  };
}

async function generateSettlementReports(startDate, endDate, brandFilter, shop, statusFilter) {
  const whereClause = {
    createdAt: { gte: startDate, lte: endDate },
  };

  if (shop) {
    whereClause.brand = { domain: shop };
  }

  if (brandFilter && brandFilter !== "all") {
    whereClause.brandId = brandFilter;
  }

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }

  const settlements = await prisma.settlements.findMany({
    where: whereClause,
    select: {
      id: true,
      brandId: true,
      settlementPeriod: true,
      periodStart: true,
      periodEnd: true,
      totalPaid: true,
      paymentHistory: true,
      status: true,
      paidAt: true,
      paymentReference: true,
      notes: true,
      brand: {
        select: {
          brandName: true,
          brandTerms: {
            select: {
              settlementTrigger: true,
              commissionValue: true,
              vatRate: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Batch fetch redemptions and vouchers for all settlements at once
  const settlementIds = settlements.map(s => s.brandId);
  const periodRanges = settlements.map(s => ({ 
    brandId: s.brandId,
    start: s.periodStart, 
    end: s.periodEnd 
  }));

  // Optimize by fetching all needed data in parallel
  const [allRedemptions, allVouchers] = await Promise.all([
    prisma.voucherRedemption.findMany({
      where: {
        OR: periodRanges.map(({ brandId, start, end }) => ({
          redeemedAt: { gte: start, lte: end },
          voucherCode: { order: { brandId } },
        })),
      },
      select: {
        amountRedeemed: true,
        redeemedAt: true,
        voucherCode: {
          select: {
            order: { select: { brandId: true } },
          },
        },
      },
    }),
    prisma.voucherCode.findMany({
      where: {
        OR: periodRanges.map(({ brandId, start, end }) => ({
          createdAt: { gte: start, lte: end },
          order: { 
            brandId,
            paymentStatus: 'COMPLETED',
          },
        })),
      },
      select: {
        originalValue: true,
        remainingValue: true,
        isRedeemed: true,
        createdAt: true,
        order: {
          select: { brandId: true, createdAt: true },
        },
        redemptions: {
          select: { amountRedeemed: true },
        },
      },
    }),
  ]);

  const recalculatedSettlements = settlements.map((settlement) => {
    const settlementTrigger = settlement.brand.brandTerms?.settlementTrigger || 'onRedemption';
    
    let totalSold = 0;
    let totalSoldAmount = 0;
    let totalRedeemed = 0;
    let redeemedAmount = 0;
    let outstanding = 0;
    let outstandingAmount = 0;

    if (settlementTrigger === 'onRedemption') {
      // Filter redemptions for this settlement
      const redemptions = allRedemptions.filter(r => 
        r.voucherCode.order.brandId === settlement.brandId &&
        r.redeemedAt >= settlement.periodStart &&
        r.redeemedAt <= settlement.periodEnd
      );

      redeemedAmount = redemptions.reduce((sum, r) => sum + r.amountRedeemed, 0);
      totalRedeemed = redemptions.length;

      // Filter vouchers for this settlement
      const issuedVouchers = allVouchers.filter(v =>
        v.order.brandId === settlement.brandId &&
        v.createdAt >= settlement.periodStart &&
        v.createdAt <= settlement.periodEnd
      );

      totalSold = issuedVouchers.length;
      totalSoldAmount = issuedVouchers.reduce((sum, v) => sum + v.originalValue, 0);
      
      outstanding = totalSold - totalRedeemed;
      outstandingAmount = totalSoldAmount - redeemedAmount;

    } else if (settlementTrigger === 'onPurchase') {
      const soldVouchers = allVouchers.filter(v =>
        v.order.brandId === settlement.brandId &&
        v.createdAt >= settlement.periodStart &&
        v.createdAt <= settlement.periodEnd
      );

      totalSold = soldVouchers.length;
      totalSoldAmount = soldVouchers.reduce((sum, v) => sum + v.originalValue, 0);
      redeemedAmount = totalSoldAmount;
      
      totalRedeemed = soldVouchers.filter(v => 
        v.isRedeemed || v.remainingValue === 0 || v.redemptions.length > 0
      ).length;
      
      outstanding = 0;
      outstandingAmount = 0;
    }

    const commissionRate = settlement.brand.brandTerms?.commissionValue ?? 0;
    const commissionAmount = redeemedAmount * (commissionRate / 100);
    const vatRate = settlement.brand.brandTerms?.vatRate ?? 0;
    const vatAmount = commissionAmount * (vatRate / 100);
    const netPayable = redeemedAmount - commissionAmount;

    const totalPaid = settlement.totalPaid || 0;
    const remainingAmount = Math.max(0, netPayable - totalPaid);
    
    // Parse payment history safely
    let paymentHistory = [];
    try {
      if (settlement.paymentHistory) {
        paymentHistory = typeof settlement.paymentHistory === 'string' 
          ? JSON.parse(settlement.paymentHistory)
          : Array.isArray(settlement.paymentHistory) 
            ? settlement.paymentHistory 
            : [];
      }
    } catch (e) {
      console.error('Error parsing payment history:', e);
    }

    const paymentCount = paymentHistory.length;
    
    let lastPaymentDate = null;
    if (paymentHistory.length > 0) {
      const sortedPayments = [...paymentHistory].sort((a, b) => 
        new Date(b.paidAt) - new Date(a.paidAt)
      );
      lastPaymentDate = sortedPayments[0].paidAt;
    }

    return {
      id: settlement.id,
      brandId: settlement.brandId,
      brandName: settlement.brand.brandName,
      settlementTrigger,
      settlementPeriod: settlement.settlementPeriod,
      periodStart: settlement.periodStart,
      periodEnd: settlement.periodEnd,
      totalSold,
      totalSoldAmount,
      totalRedeemed,
      redeemedAmount,
      outstanding,
      outstandingAmount,
      commissionAmount: Math.round(commissionAmount),
      vatAmount: Math.round(vatAmount),
      netPayable: Math.round(netPayable),
      totalPaid: Math.round(totalPaid),
      remainingAmount: Math.round(remainingAmount),
      paymentCount,
      lastPaymentDate,
      paymentHistory,
      status: settlement.status,
      paidAt: settlement.paidAt,
      paymentReference: settlement.paymentReference,
      notes: settlement.notes,
    };
  });

  const statusSummary = recalculatedSettlements.reduce((acc, s) => {
    if (s.status && acc[s.status]) {
      acc[s.status].count++;
      acc[s.status].amount += s.netPayable;
      acc[s.status].paid += s.totalPaid;
      acc[s.status].remaining += s.remainingAmount;
    }
    return acc;
  }, {
    Pending: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Paid: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Partial: { count: 0, amount: 0, paid: 0, remaining: 0 },
    InReview: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Disputed: { count: 0, amount: 0, paid: 0, remaining: 0 },
  });

  return {
    summary: {
      totalSettlements: recalculatedSettlements.length,
      totalAmount: recalculatedSettlements.reduce((sum, s) => sum + s.netPayable, 0),
      totalCommission: recalculatedSettlements.reduce((sum, s) => sum + s.commissionAmount, 0),
      totalVAT: recalculatedSettlements.reduce((sum, s) => sum + (s.vatAmount || 0), 0),
      totalPaid: recalculatedSettlements.reduce((sum, s) => sum + (s.totalPaid || 0), 0),
      totalRemaining: recalculatedSettlements.reduce((sum, s) => sum + (s.remainingAmount || 0), 0),
      byStatus: Object.entries(statusSummary).map(([status, data]) => ({ 
        status, 
        ...data
      })),
    },
    settlements: recalculatedSettlements.map((s) => ({
      id: s.id,
      brandName: s.brandName,
      settlementTrigger: s.settlementTrigger,
      settlementPeriod: s.settlementPeriod,
      periodStart: s.periodStart.toISOString().split("T")[0],
      periodEnd: s.periodEnd.toISOString().split("T")[0],
      totalSold: s.totalSold,
      totalSoldAmount: s.totalSoldAmount,
      totalRedeemed: s.totalRedeemed,
      redeemedAmount: s.redeemedAmount,
      outstanding: s.outstanding,
      outstandingAmount: s.outstandingAmount,
      commissionAmount: s.commissionAmount,
      vatAmount: s.vatAmount,
      netPayable: s.netPayable,
      totalPaid: s.totalPaid,
      remainingAmount: s.remainingAmount,
      paymentCount: s.paymentCount,
      lastPaymentDate: s.lastPaymentDate ? new Date(s.lastPaymentDate).toISOString().split("T")[0] : null,
      paymentHistory: s.paymentHistory,
      status: s.status,
      paidAt: s.paidAt ? s.paidAt.toISOString().split("T")[0] : null,
      paymentReference: s.paymentReference,
      notes: s.notes,
    })),
  };
}

async function generateTransactionLog(whereClause) {
  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      orderNumber: true,
      createdAt: true,
      amount: true,
      quantity: true,
      subtotal: true,
      discount: true,
      totalAmount: true,
      paymentMethod: true,
      paymentStatus: true,
      deliveryMethod: true,
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
      occasion: { select: { name: true } },
      receiverDetail: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      voucherCodes: { 
        select: { 
          code: true, 
          originalValue: true, 
          isRedeemed: true 
        } 
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return {
    totalTransactions: orders.length,
    transactions: orders.map((o) => ({
      orderNumber: o.orderNumber,
      date: o.createdAt.toISOString(),
      brandName: o.brand.brandName,
      customer: {
        name: `${o.user.firstName} ${o.user.lastName}`,
        email: o.user.email,
      },
      receiver: {
        name: o.receiverDetail.name,
        email: o.receiverDetail.email,
        phone: o.receiverDetail.phone,
      },
      occasion: o.occasion?.name,
      amount: o.amount,
      quantity: o.quantity,
      subtotal: o.subtotal,
      discount: o.discount,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      deliveryMethod: o.deliveryMethod,
      voucherCodes: o.voucherCodes.map((vc) => ({
        code: vc.code,
        value: vc.originalValue,
        isRedeemed: vc.isRedeemed,
      })),
    })),
  };
}

async function generateBrandPerformance(whereClause) {
  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      totalAmount: true,
      quantity: true,
      discount: true,
      brand: { 
        select: { 
          id: true, 
          brandName: true, 
          categoryName: true, 
          isActive: true 
        } 
      },
      voucherCodes: {
        select: {
          originalValue: true,
          remainingValue: true,
          isRedeemed: true,
          _count: { select: { redemptions: true } },
        },
      },
    },
  });

  const brandMetrics = orders.reduce((acc, order) => {
    const brandId = order.brand.id;

    if (!acc[brandId]) {
      acc[brandId] = {
        brandId,
        brandName: order.brand.brandName,
        category: order.brand.categoryName,
        isActive: order.brand.isActive,
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        totalDiscount: 0,
        vouchersIssued: 0,
        vouchersRedeemed: 0,
        redemptionValue: 0,
      };
    }

    acc[brandId].totalOrders++;
    acc[brandId].totalRevenue += order.totalAmount;
    acc[brandId].totalQuantity += order.quantity;
    acc[brandId].totalDiscount += order.discount;
    acc[brandId].vouchersIssued += order.voucherCodes.length;

    order.voucherCodes.forEach((vc) => {
      if (vc.isRedeemed || vc.remainingValue === 0 || vc._count.redemptions > 0) {
        acc[brandId].vouchersRedeemed++;
      }
      acc[brandId].redemptionValue += vc.originalValue - vc.remainingValue;
    });

    return acc;
  }, {});

  const brandPerformance = Object.values(brandMetrics).map((brand) => ({
    ...brand,
    avgOrderValue: brand.totalOrders > 0 ? Math.round(brand.totalRevenue / brand.totalOrders) : 0,
    redemptionRate: brand.vouchersIssued > 0
      ? ((brand.vouchersRedeemed / brand.vouchersIssued) * 100).toFixed(2)
      : 0,
  }));

  const totalRevenue = brandPerformance.reduce((sum, b) => sum + b.totalRevenue, 0);
  const avgRedemptionRate = brandPerformance.length > 0
    ? (brandPerformance.reduce((sum, b) => sum + parseFloat(b.redemptionRate), 0) / brandPerformance.length).toFixed(2)
    : 0;

  return {
    summary: {
      totalBrands: brandPerformance.length,
      totalRevenue,
      avgRedemptionRate,
    },
    brands: brandPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue),
  };
}

async function generateLiabilitySnapshot(brandFilter, shop) {
  const whereClause = {
    OR: [{ isRedeemed: false }, { remainingValue: { gt: 0 } }],
  };

  if (shop || brandFilter) {
    whereClause.order = {};
    
    if (shop) {
      whereClause.order.brand = { domain: shop };
    }
    
    if (brandFilter && brandFilter !== "all") {
      whereClause.order.brandId = brandFilter;
    }
  }

  const voucherCodes = await prisma.voucherCode.findMany({
    where: whereClause,
    select: {
      remainingValue: true,
      originalValue: true,
      expiresAt: true,
      order: {
        select: {
          brand: { select: { id: true, brandName: true } },
        },
      },
    },
  });

  const today = new Date();
  
  const liabilityByBrand = voucherCodes.reduce((acc, vc) => {
    const brandId = vc.order.brand.id;
    const brandName = vc.order.brand.brandName;

    if (!acc[brandId]) {
      acc[brandId] = {
        brandId,
        brandName,
        totalVouchers: 0,
        totalLiability: 0,
        active: 0,
        partiallyRedeemed: 0,
        expired: 0,
      };
    }

    const isExpired = vc.expiresAt && new Date(vc.expiresAt) < today;
    const isPartiallyRedeemed = vc.remainingValue < vc.originalValue && vc.remainingValue > 0;

    acc[brandId].totalVouchers++;
    acc[brandId].totalLiability += vc.remainingValue;

    if (isExpired) {
      acc[brandId].expired++;
    } else if (isPartiallyRedeemed) {
      acc[brandId].partiallyRedeemed++;
    } else {
      acc[brandId].active++;
    }

    return acc;
  }, {});

  const brands = Object.values(liabilityByBrand);
  const totalLiability = brands.reduce((sum, b) => sum + b.totalLiability, 0);
  const totalVouchers = brands.reduce((sum, b) => sum + b.totalVouchers, 0);

  return {
    asOfDate: today.toISOString().split("T")[0],
    summary: {
      totalVouchers,
      totalLiability,
      totalBrands: brands.length,
    },
    byBrand: brands.sort((a, b) => b.totalLiability - a.totalLiability),
  };
}


// ==================== CSV CONVERTER (FIXED ENCODING) ====================
function convertToCSV(reportData, startDate, endDate) {
  let csv = "";
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  csv += `Custom Report\n`;
  csv += `Generated: ${new Date().toISOString()}\n`;
  csv += `Period: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}\n\n`;

  // SALES SUMMARY - FIXED: Removed === symbols
  if (reportData.salesSummary) {
    const sd = reportData.salesSummary;
    csv += `\nSALES SUMMARY\n\n`;
    
    if (sd.summary) {
      csv += `Metric,Value\n`;
      csv += `Total Orders,${sd.summary.totalOrders}\n`;
      csv += `Total Revenue,${sd.summary.totalRevenue}\n`;
      csv += `Total Discount,${sd.summary.totalDiscount}\n`;
      csv += `Total Quantity,${sd.summary.totalQuantity}\n`;
      csv += `Avg Order Value,${sd.summary.avgOrderValue}\n\n`;
    }
    if (sd.revenueByPaymentMethod?.length > 0) {
      csv += `\nRevenue by Payment Method\n`;
      csv += `Payment Method,Orders,Revenue\n`;
      sd.revenueByPaymentMethod.forEach(i => {
        csv += `${escape(i.method)},${i.orders},${i.revenue}\n`;
      });
      csv += `\n`;
    }

    if (sd.dailyBreakdown?.length > 0) {
      csv += `\nDaily Breakdown\n`;
      csv += `Date,Orders,Revenue,Quantity\n`;
      sd.dailyBreakdown.forEach(i => {
        csv += `${i.date},${i.orders},${i.revenue},${i.quantity}\n`;
      });
      csv += `\n`;
    }

    if (sd.orders?.length > 0) {
      csv += `\nOrder Details\n`;
      csv += `Order Number,Brand,Customer,Email,Amount,Discount,Quantity,Payment Method,Date\n`;
      sd.orders.forEach(o => {
        csv += `${escape(o.orderNumber)},${escape(o.brandName)},${escape(o.customer)},${escape(o.customerEmail)},${o.amount},${o.discount},${o.quantity},${escape(o.paymentMethod)},${o.date}\n`;
      });
      csv += `\n`;
    }
  }

  // REDEMPTION DETAILS - FIXED: Removed === symbols
  if (reportData.redemptionDetails) {
    const rd = reportData.redemptionDetails;
    csv += `\nREDEMPTION DETAILS\n\n`;
    
    if (rd.summary) {
      csv += `Metric,Value\n`;
      csv += `Total Issued,${rd.summary.totalIssued}\n`;
      csv += `Total Redeemed,${rd.summary.totalRedeemed}\n`;
      csv += `Partially Redeemed,${rd.summary.totalPartiallyRedeemed}\n`;
      csv += `Active,${rd.summary.totalActive}\n`;
      csv += `Issued Value,${rd.summary.totalIssuedValue}\n`;
      csv += `Redeemed Value,${rd.summary.totalRedeemedValue}\n`;
      csv += `Redemption Rate,${rd.summary.redemptionRate}%\n\n`;
    }

    if (rd.vouchers?.length > 0) {
      csv += `\nVoucher Details\n`;
      csv += `Code,Order Number,Brand,Original Value,Remaining Value,Used Value,Status,Issued Date,Redeemed Date,Expires At,Redemption Count\n`;
      rd.vouchers.forEach(v => {
        csv += `${escape(v.code)},${escape(v.orderNumber)},${escape(v.brandName)},${v.originalValue},${v.remainingValue},${v.usedValue},${escape(v.status)},${v.issuedDate},${v.redeemedDate || ""},${v.expiresAt || ""},${v.redemptionCount}\n`;
      });
      csv += `\n`;
    }
  }

  // SETTLEMENT REPORTS - FIXED: Removed === symbols
  if (reportData.settlementReports) {
    const sr = reportData.settlementReports;
    csv += `\nSETTLEMENT REPORTS\n\n`;
    
    if (sr.summary) {
      csv += `Metric,Value\n`;
      csv += `Total Settlements,${sr.summary.totalSettlements}\n`;
      csv += `Total Amount,${sr.summary.totalAmount}\n`;
      csv += `Total Commission,${sr.summary.totalCommission}\n`;
      csv += `Total VAT,${sr.summary.totalVAT}\n\n`;

      if (sr.summary.byStatus?.length > 0) {
        csv += `\nBy Status\n`;
        csv += `Status,Count,Amount\n`;
        sr.summary.byStatus.forEach(s => {
          csv += `${escape(s.status)},${s.count},${s.amount}\n`;
        });
        csv += `\n`;
      }
    }

    if (sr.settlements?.length > 0) {
      csv += `\nSettlement Details\n`;
      csv += `Brand,Settlement Period,Period Start,Period End,Total Sold,Sold Amount,Total Redeemed,Redeemed Amount,Outstanding,Outstanding Amount,Commission,VAT,Net Payable,Status,Paid At,Payment Reference\n`;
      sr.settlements.forEach(s => {
        csv += `${escape(s.brandName)},${escape(s.settlementPeriod)},${s.periodStart},${s.periodEnd},${s.totalSold},${s.totalSoldAmount},${s.totalRedeemed},${s.redeemedAmount},${s.outstanding},${s.outstandingAmount},${s.commissionAmount},${s.vatAmount},${s.netPayable},${escape(s.status)},${s.paidAt || ""},${escape(s.paymentReference) || ""}\n`;
      });
      csv += `\n`;
    }
  }

  // TRANSACTION LOG - FIXED: Removed === symbols
  if (reportData.transactionLog) {
    const tl = reportData.transactionLog;
    csv += `\nTRANSACTION LOG\n\n`;
    csv += `Total Transactions: ${tl.totalTransactions}\n\n`;

    if (tl.transactions?.length > 0) {
      csv += `Order Number,Date,Brand,Customer Name,Customer Email,Receiver Name,Receiver Email,Receiver Phone,Occasion,Amount,Quantity,Subtotal,Discount,Total Amount,Payment Method,Payment Status,Delivery Method,Voucher Codes\n`;
      tl.transactions.forEach(t => {
        const voucherCodes = t.voucherCodes.map(vc => `${vc.code}(${vc.value})`).join("; ");
        csv += `${escape(t.orderNumber)},${t.date},${escape(t.brandName)},${escape(t.customer.name)},${escape(t.customer.email)},${escape(t.receiver.name)},${escape(t.receiver.email)},${escape(t.receiver.phone)},${escape(t.occasion) || ""},${t.amount},${t.quantity},${t.subtotal},${t.discount},${t.totalAmount},${escape(t.paymentMethod)},${escape(t.paymentStatus)},${escape(t.deliveryMethod)},${escape(voucherCodes)}\n`;
      });
      csv += `\n`;
    }
  }

  // BRAND PERFORMANCE - FIXED: Removed === symbols
  if (reportData.brandPerformance) {
    const bp = reportData.brandPerformance;
    csv += `\nBRAND PERFORMANCE\n\n`;
    
    if (bp.summary) {
      csv += `Metric,Value\n`;
      csv += `Total Brands,${bp.summary.totalBrands}\n`;
      csv += `Total Revenue,${bp.summary.totalRevenue}\n`;
      csv += `Avg Redemption Rate,${bp.summary.avgRedemptionRate}%\n\n`;
    }

    if (bp.brands?.length > 0) {
      csv += `\nBrand Details\n`;
      csv += `Brand ID,Brand Name,Category,Active,Total Orders,Total Revenue,Total Quantity,Total Discount,Vouchers Issued,Vouchers Redeemed,Redemption Value,Avg Order Value,Redemption Rate\n`;
      bp.brands.forEach(b => {
        csv += `${b.brandId},${escape(b.brandName)},${escape(b.category)},${b.isActive},${b.totalOrders},${b.totalRevenue},${b.totalQuantity},${b.totalDiscount},${b.vouchersIssued},${b.vouchersRedeemed},${b.redemptionValue},${b.avgOrderValue},${b.redemptionRate}%\n`;
      });
      csv += `\n`;
    }
  }

  // LIABILITY SNAPSHOT - FIXED: Removed === symbols
  if (reportData.liabilitySnapshot) {
    const ls = reportData.liabilitySnapshot;
    csv += `\nLIABILITY SNAPSHOT\n\n`;
    csv += `As of Date: ${ls.asOfDate}\n\n`;
    
    if (ls.summary) {
      csv += `Metric,Value\n`;
      csv += `Total Vouchers,${ls.summary.totalVouchers}\n`;
      csv += `Total Liability,${ls.summary.totalLiability}\n`;
      csv += `Total Brands,${ls.summary.totalBrands}\n\n`;
    }

    if (ls.byBrand?.length > 0) {
      csv += `\nLiability by Brand\n`;
      csv += `Brand ID,Brand Name,Total Vouchers,Total Liability,Active,Partially Redeemed,Expired\n`;
      ls.byBrand.forEach(b => {
        csv += `${b.brandId},${escape(b.brandName)},${b.totalVouchers},${b.totalLiability},${b.active},${b.partiallyRedeemed},${b.expired}\n`;
      });
      csv += `\n`;
    }
  }

  return csv;
}