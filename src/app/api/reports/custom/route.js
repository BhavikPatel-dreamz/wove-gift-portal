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

    // Build where clause
    const whereClause = {
      createdAt: { gte: start, lte: end },
    };

    // Add shop filter if provided
    if (shop) {
      whereClause.brand = {
        domain: shop
      };
    }

    // Add brand filter
    if (brand && brand !== "all") {
      whereClause.brandId = brand;
    }

    // Add status filter
    if (status && status !== "all") {
      whereClause.paymentStatus = status.toUpperCase();
    }

    // Generate selected reports
    const reportData = {};

    for (const reportType of reports) {
      switch (reportType) {
        case "salesSummary":
          reportData.salesSummary = await generateSalesSummary(whereClause, start, end);
          break;
        case "redemptionDetails":
          reportData.redemptionDetails = await generateRedemptionDetails(whereClause, start, end);
          break;
        case "settlementReports":
          reportData.settlementReports = await generateSettlementReports(start, end, brand, shop, status);
          break;
        case "transactionLog":
          reportData.transactionLog = await generateTransactionLog(whereClause);
          break;
        case "brandPerformance":
          reportData.brandPerformance = await generateBrandPerformance(whereClause);
          break;
        case "liabilitySnapshot":
          reportData.liabilitySnapshot = await generateLiabilitySnapshot(brand, shop);
          break;
      }
    }

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

// ==================== REPORT GENERATORS ====================

async function generateSalesSummary(whereClause) {
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discount, 0);
  const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);

  const revenueByPaymentMethod = {};
  orders.forEach((order) => {
    const method = order.paymentMethod || "Unknown";
    if (!revenueByPaymentMethod[method]) {
      revenueByPaymentMethod[method] = { orders: 0, revenue: 0 };
    }
    revenueByPaymentMethod[method].orders += 1;
    revenueByPaymentMethod[method].revenue += order.totalAmount;
  });

  const dailyRevenue = {};
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = { orders: 0, revenue: 0, quantity: 0 };
    }
    dailyRevenue[date].orders += 1;
    dailyRevenue[date].revenue += order.totalAmount;
    dailyRevenue[date].quantity += order.quantity;
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
    include: {
      brand: { select: { brandName: true } },
      voucherCodes: {
        include: {
          redemptions: { orderBy: { redeemedAt: "desc" } },
        },
      },
    },
  });

  const voucherDetails = [];
  let totalIssued = 0;
  let totalRedeemed = 0;
  let totalPartiallyRedeemed = 0;
  let totalActive = 0;
  let totalIssuedValue = 0;
  let totalRedeemedValue = 0;

  orders.forEach((order) => {
    order.voucherCodes.forEach((vc) => {
      totalIssued += 1;
      totalIssuedValue += vc.originalValue;

      const usedValue = vc.originalValue - vc.remainingValue;
      totalRedeemedValue += usedValue;

      let status = "Active";
      if (vc.isRedeemed || vc.remainingValue === 0) {
        status = "Fully Redeemed";
        totalRedeemed += 1;
      } else if (vc.remainingValue < vc.originalValue) {
        status = "Partially Redeemed";
        totalPartiallyRedeemed += 1;
      } else {
        totalActive += 1;
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
    whereClause.brand = {
      domain: shop
    };
  }

  if (brandFilter && brandFilter !== "all") {
    whereClause.brandId = brandFilter;
  }

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }

  const settlements = await prisma.settlements.findMany({
    where: whereClause,
    include: {
      brand: {
        include: {
          brandTerms: true,
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const recalculatedSettlements = [];
  
  for (const settlement of settlements) {
    const settlementTrigger = settlement.brand.brandTerms?.settlementTrigger || 'onRedemption';
    
    let totalSold = 0;
    let totalSoldAmount = 0;
    let totalRedeemed = 0;
    let redeemedAmount = 0;
    let outstanding = 0;
    let outstandingAmount = 0;

    if (settlementTrigger === 'onRedemption') {
      // For onRedemption: Only count redeemed amounts
      const redemptions = await prisma.voucherRedemption.findMany({
        where: {
          redeemedAt: { gte: settlement.periodStart, lte: settlement.periodEnd },
          voucherCode: {
            order: {
              brandId: settlement.brandId,
            },
          },
        },
        include: {
          voucherCode: true
        }
      });

      redeemedAmount = redemptions.reduce((sum, r) => sum + r.amountRedeemed, 0);
      totalRedeemed = redemptions.length;

      // Get all vouchers issued in this period for outstanding calculation
      const issuedVouchers = await prisma.voucherCode.findMany({
        where: {
          createdAt: { gte: settlement.periodStart, lte: settlement.periodEnd },
          order: {
            brandId: settlement.brandId,
          },
        },
      });

      totalSold = issuedVouchers.length;
      totalSoldAmount = issuedVouchers.reduce((sum, v) => sum + v.originalValue, 0);
      
      outstanding = totalSold - totalRedeemed;
      outstandingAmount = totalSoldAmount - redeemedAmount;

    } else if (settlementTrigger === 'onPurchase') {
      // For onPurchase: Settlement based on vouchers sold
      const soldVouchers = await prisma.voucherCode.findMany({
        where: {
          createdAt: { gte: settlement.periodStart, lte: settlement.periodEnd },
          order: {
            brandId: settlement.brandId,
            paymentStatus: 'COMPLETED',
          },
        },
        include: {
          redemptions: true
        }
      });

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
    const netPayable = redeemedAmount - commissionAmount - vatAmount;

    // FIXED: Properly calculate payment details
    const totalPaid = settlement.totalPaid || 0;
    const remainingAmount = Math.max(0, netPayable - totalPaid);
    
    // Parse payment history safely
    let paymentHistory = [];
    try {
      if (settlement.paymentHistory) {
        if (typeof settlement.paymentHistory === 'string') {
          paymentHistory = JSON.parse(settlement.paymentHistory);
        } else if (Array.isArray(settlement.paymentHistory)) {
          paymentHistory = settlement.paymentHistory;
        }
      }
    } catch (e) {
      console.error('Error parsing payment history:', e);
      paymentHistory = [];
    }

    // Calculate payment count
    const paymentCount = paymentHistory.length || 0;
    
    // Get last payment date
    let lastPaymentDate = null;
    if (paymentHistory.length > 0) {
      const sortedPayments = [...paymentHistory].sort((a, b) => 
        new Date(b.paidAt) - new Date(a.paidAt)
      );
      lastPaymentDate = sortedPayments[0].paidAt;
    }

    recalculatedSettlements.push({
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
    });
  }

  const statusSummary = {
    Pending: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Paid: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Partial: { count: 0, amount: 0, paid: 0, remaining: 0 },
    InReview: { count: 0, amount: 0, paid: 0, remaining: 0 },
    Disputed: { count: 0, amount: 0, paid: 0, remaining: 0 },
  };

  recalculatedSettlements.forEach((s) => {
    if (s.status && statusSummary[s.status]) {
      statusSummary[s.status].count += 1;
      statusSummary[s.status].amount += s.netPayable;
      statusSummary[s.status].paid += s.totalPaid;
      statusSummary[s.status].remaining += s.remainingAmount;
    }
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
        count: data.count,
        amount: data.amount,
        paid: data.paid,
        remaining: data.remaining
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
    include: {
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
      occasion: { select: { name: true } },
      receiverDetail: true,
      voucherCodes: { select: { code: true, originalValue: true, isRedeemed: true } },
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
    include: {
      brand: { select: { id: true, brandName: true, categoryName: true, isActive: true } },
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

  const brandMetrics = {};

  orders.forEach((order) => {
    const brandId = order.brand.id;
    const brandName = order.brand.brandName;

    if (!brandMetrics[brandId]) {
      brandMetrics[brandId] = {
        brandId,
        brandName,
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

    brandMetrics[brandId].totalOrders += 1;
    brandMetrics[brandId].totalRevenue += order.totalAmount;
    brandMetrics[brandId].totalQuantity += order.quantity;
    brandMetrics[brandId].totalDiscount += order.discount;
    brandMetrics[brandId].vouchersIssued += order.voucherCodes.length;

    order.voucherCodes.forEach((vc) => {
      if (vc.isRedeemed || vc.remainingValue === 0 || vc._count.redemptions > 0) {
        brandMetrics[brandId].vouchersRedeemed += 1;
      }
      brandMetrics[brandId].redemptionValue += vc.originalValue - vc.remainingValue;
    });
  });

  const brandPerformance = Object.values(brandMetrics).map((brand) => ({
    ...brand,
    avgOrderValue:
      brand.totalOrders > 0 ? Math.round(brand.totalRevenue / brand.totalOrders) : 0,
    redemptionRate:
      brand.vouchersIssued > 0
        ? ((brand.vouchersRedeemed / brand.vouchersIssued) * 100).toFixed(2)
        : 0,
  }));

  return {
    summary: {
      totalBrands: brandPerformance.length,
      totalRevenue: brandPerformance.reduce((sum, b) => sum + b.totalRevenue, 0),
      avgRedemptionRate:
        brandPerformance.length > 0
          ? (
              brandPerformance.reduce((sum, b) => sum + parseFloat(b.redemptionRate), 0) /
              brandPerformance.length
            ).toFixed(2)
          : 0,
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
      whereClause.order.brand = {
        domain: shop
      };
    }
    
    if (brandFilter && brandFilter !== "all") {
      whereClause.order.brandId = brandFilter;
    }
  }

  const voucherCodes = await prisma.voucherCode.findMany({
    where: whereClause,
    include: {
      order: {
        include: {
          brand: { select: { id: true, brandName: true } },
        },
      },
    },
  });

  const liabilityByBrand = {};
  const today = new Date();

  voucherCodes.forEach((vc) => {
    const brandId = vc.order.brand.id;
    const brandName = vc.order.brand.brandName;

    if (!liabilityByBrand[brandId]) {
      liabilityByBrand[brandId] = {
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
    const isPartiallyRedeemed =
      vc.remainingValue < vc.originalValue && vc.remainingValue > 0;

    liabilityByBrand[brandId].totalVouchers += 1;
    liabilityByBrand[brandId].totalLiability += vc.remainingValue;

    if (isExpired) {
      liabilityByBrand[brandId].expired += 1;
    } else if (isPartiallyRedeemed) {
      liabilityByBrand[brandId].partiallyRedeemed += 1;
    } else {
      liabilityByBrand[brandId].active += 1;
    }
  });

  const brands = Object.values(liabilityByBrand);
  const totalLiability = brands.reduce((sum, b) => sum + b.totalLiability, 0);

  return {
    asOfDate: today.toISOString().split("T")[0],
    summary: {
      totalVouchers: brands.reduce((sum, b) => sum + b.totalVouchers, 0),
      totalLiability,
      totalBrands: brands.length,
    },
    byBrand: brands.sort((a, b) => b.totalLiability - a.totalLiability),
  };
}

// ==================== CSV CONVERTER ====================
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

  // SALES SUMMARY
  if (reportData.salesSummary) {
    const sd = reportData.salesSummary;
    csv += `\n=== SALES SUMMARY ===\n\n`;
    
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

  // REDEMPTION DETAILS
  if (reportData.redemptionDetails) {
    const rd = reportData.redemptionDetails;
    csv += `\n=== REDEMPTION DETAILS ===\n\n`;
    
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

  // SETTLEMENT REPORTS
  if (reportData.settlementReports) {
    const sr = reportData.settlementReports;
    csv += `\n=== SETTLEMENT REPORTS ===\n\n`;
    
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

  // TRANSACTION LOG
  if (reportData.transactionLog) {
    const tl = reportData.transactionLog;
    csv += `\n=== TRANSACTION LOG ===\n\n`;
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

  // BRAND PERFORMANCE
  if (reportData.brandPerformance) {
    const bp = reportData.brandPerformance;
    csv += `\n=== BRAND PERFORMANCE ===\n\n`;
    
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

  // LIABILITY SNAPSHOT
  if (reportData.liabilitySnapshot) {
    const ls = reportData.liabilitySnapshot;
    csv += `\n=== LIABILITY SNAPSHOT ===\n\n`;
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