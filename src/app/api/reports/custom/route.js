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
  // ✅ Filter by period overlap, not createdAt
  const whereClause = {
    periodStart: { lte: endDate },
    periodEnd:   { gte: startDate },
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

  // ✅ Fetch ALL stored fields — no recalculation needed
  const settlements = await prisma.settlements.findMany({
    where: whereClause,
    select: {
      id: true,
      brandId: true,
      settlementPeriod: true,
      periodStart: true,
      periodEnd: true,
      // ── Sales ─────────────────────────────────────
      totalSold: true,
      totalSoldAmount: true,
      // ── Redemptions ───────────────────────────────
      totalRedeemed: true,
      redeemedAmount: true,
      // ── Outstanding ───────────────────────────────
      outstanding: true,
      outstandingAmount: true,
      // ── Financials (maintained by cron/webhook) ───
      commissionAmount: true,
      vatAmount: true,
      breakageAmount: true,
      netPayable: true,
      // ── Payments ──────────────────────────────────
      totalPaid: true,
      remainingAmount: true,
      paymentCount: true,
      lastPaymentDate: true,
      paymentHistory: true,
      paymentReference: true,
      // ── Meta ──────────────────────────────────────
      status: true,
      paidAt: true,
      notes: true,
      createdAt: true,
      brand: {
        select: {
          brandName: true,
          brandTerms: {
            select: {
              settlementTrigger: true,
              commissionType: true,
              commissionValue: true,
              vatRate: true,
            },
          },
        },
      },
    },
    orderBy: [{ settlementPeriod: "desc" }, { brand: { brandName: "asc" } }],
  });

  const formattedSettlements = settlements.map((s) => {
    const settlementTrigger = s.brand.brandTerms?.settlementTrigger || "onRedemption";

    // ✅ Parse payment history safely
    let paymentHistory = [];
    try {
      if (s.paymentHistory) {
        paymentHistory =
          typeof s.paymentHistory === "string"
            ? JSON.parse(s.paymentHistory)
            : Array.isArray(s.paymentHistory)
            ? s.paymentHistory
            : [];
      }
    } catch (e) {
      console.error(`Error parsing paymentHistory for settlement ${s.id}:`, e);
    }

    // ✅ Read stored financial values — correctly maintained per trigger:
    //    onPurchase  → commissionAmount/vatAmount/netPayable set at purchase, 0 on redemption
    //    onRedemption → commissionAmount/vatAmount/netPayable accumulated per redemption event
    const commissionAmount = s.commissionAmount ?? 0;
    const vatAmount        = s.vatAmount        ?? 0;
    const breakageAmount   = s.breakageAmount   ?? 0;
    const netPayable       = s.netPayable       ?? 0;
    const totalPaid        = s.totalPaid        ?? 0;

    // ✅ Recalculate remainingAmount live in case totalPaid was updated
    const remainingAmount = Math.max(0, netPayable - totalPaid);

    // ✅ Derive lastPaymentDate from paymentHistory if DB field is empty
    let lastPaymentDate = s.lastPaymentDate || null;
    if (!lastPaymentDate && paymentHistory.length > 0) {
      const sorted = [...paymentHistory].sort(
        (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
      );
      lastPaymentDate = sorted[0].paidAt;
    }

    return {
      id:               s.id,
      brandId:          s.brandId,
      brandName:        s.brand.brandName,
      settlementTrigger,
      commissionType:   s.brand.brandTerms?.commissionType  || "Percentage",
      commissionValue:  s.brand.brandTerms?.commissionValue ?? 0,
      vatRate:          s.brand.brandTerms?.vatRate         ?? 0,
      settlementPeriod: s.settlementPeriod,
      periodStart:      s.periodStart,
      periodEnd:        s.periodEnd,
      // ── Sales ────────────────────────────────────────────────────────
      totalSold:        s.totalSold        ?? 0,
      totalSoldAmount:  s.totalSoldAmount  ?? 0,
      // ── Redemptions ──────────────────────────────────────────────────
      // onRedemption: incremented per redemption event
      // onPurchase:   incremented when voucher is redeemed (tracking only)
      totalRedeemed:  s.totalRedeemed  ?? 0,
      redeemedAmount: s.redeemedAmount ?? 0,
      // ── Outstanding ──────────────────────────────────────────────────
      // onRedemption: outstanding = totalSold - totalRedeemed
      // onPurchase:   outstanding decrements on redemption for tracking
      outstanding:       s.outstanding       ?? 0,
      outstandingAmount: s.outstandingAmount ?? 0,
      // ── Financials ───────────────────────────────────────────────────
      commissionAmount,
      vatAmount,
      breakageAmount,
      netPayable,
      // ── Payments ─────────────────────────────────────────────────────
      totalPaid,
      remainingAmount,
      paymentCount:    s.paymentCount ?? paymentHistory.length,
      lastPaymentDate,
      paymentHistory,
      // ── Meta ─────────────────────────────────────────────────────────
      status:           s.status,
      paidAt:           s.paidAt,
      paymentReference: s.paymentReference,
      notes:            s.notes,
    };
  });

  // ✅ Status summary — keys match what frontend/CSV expects
  const statusSummary = formattedSettlements.reduce(
    (acc, s) => {
      const key = s.status;
      if (acc[key]) {
        acc[key].count++;
        acc[key].amount    += s.netPayable;
        acc[key].paid      += s.totalPaid;
        acc[key].remaining += s.remainingAmount;
      }
      return acc;
    },
    {
      Pending:  { count: 0, amount: 0, paid: 0, remaining: 0 },
      Paid:     { count: 0, amount: 0, paid: 0, remaining: 0 },
      Partial:  { count: 0, amount: 0, paid: 0, remaining: 0 },
      InReview: { count: 0, amount: 0, paid: 0, remaining: 0 },
      Disputed: { count: 0, amount: 0, paid: 0, remaining: 0 },
    }
  );

  return {
    summary: {
      totalSettlements:    formattedSettlements.length,
      totalSoldAmount:     formattedSettlements.reduce((sum, s) => sum + s.totalSoldAmount,  0),
      totalRedeemedAmount: formattedSettlements.reduce((sum, s) => sum + s.redeemedAmount,   0),
      totalCommission:     formattedSettlements.reduce((sum, s) => sum + s.commissionAmount, 0),
      totalVAT:            formattedSettlements.reduce((sum, s) => sum + s.vatAmount,        0),
      totalAmount:         formattedSettlements.reduce((sum, s) => sum + s.netPayable,       0),
      totalPaid:           formattedSettlements.reduce((sum, s) => sum + s.totalPaid,        0),
      totalRemaining:      formattedSettlements.reduce((sum, s) => sum + s.remainingAmount,  0),
      byStatus: Object.entries(statusSummary).map(([status, data]) => ({ status, ...data })),
    },
    settlements: formattedSettlements.map((s) => ({
      id:               s.id,
      brandName:        s.brandName,
      settlementTrigger: s.settlementTrigger,
      commissionType:   s.commissionType,
      commissionValue:  s.commissionValue,
      vatRate:          s.vatRate,
      settlementPeriod: s.settlementPeriod,
      periodStart:      s.periodStart.toISOString().split("T")[0],
      periodEnd:        s.periodEnd.toISOString().split("T")[0],
      totalSold:        s.totalSold,
      totalSoldAmount:  s.totalSoldAmount,
      totalRedeemed:    s.totalRedeemed,
      redeemedAmount:   s.redeemedAmount,
      outstanding:      s.outstanding,
      outstandingAmount: s.outstandingAmount,
      commissionAmount: s.commissionAmount,
      vatAmount:        s.vatAmount,
      breakageAmount:   s.breakageAmount,
      netPayable:       s.netPayable,
      totalPaid:        s.totalPaid,
      remainingAmount:  s.remainingAmount,
      paymentCount:     s.paymentCount,
      lastPaymentDate:  s.lastPaymentDate
        ? new Date(s.lastPaymentDate).toISOString().split("T")[0]
        : null,
      paymentHistory:   s.paymentHistory,
      status:           s.status,
      paidAt:           s.paidAt ? s.paidAt.toISOString().split("T")[0] : null,
      paymentReference: s.paymentReference,
      notes:            s.notes,
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