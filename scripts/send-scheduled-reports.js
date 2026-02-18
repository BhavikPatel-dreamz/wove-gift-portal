// ==================== COMPLETE SCHEDULED REPORTS SCRIPT ====================

import { prisma } from "../src/lib/db.js";
import { sendEmail } from "../src/lib/email.js";
import { calculateNextDeliveryDate } from "../src/lib/utils.js";
import pkg from "jspdf";
const { jsPDF } = pkg;
import autoTable from "jspdf-autotable";

async function sendScheduledReports() {
  console.log("========================================");
  console.log("Starting to send scheduled reports...");
  console.log("Current time:", new Date().toISOString());
  console.log("========================================");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  console.log("Date range for query:");
  console.log("  From:", today.toISOString());
  console.log("  To:", tomorrow.toISOString());

  try {
    const reportsToSend = await prisma.scheduledReport.findMany({
      where: {
        status: "Active",
        nextDeliveryDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            domain: true,
          },
        },
      },
    });

    console.log(`\n✓ Found ${reportsToSend.length} reports to send.`);

    if (reportsToSend.length === 0) {
      console.log("No reports scheduled for today. Exiting.");
      return;
    }

    for (const report of reportsToSend) {
      try {
        console.log("\n========================================");
        console.log(`Processing report ID: ${report.id}`);
        console.log(`  Brand: ${report.brand?.brandName || "All Brands"}`);
        console.log(`  Brand ID: ${report.brandId || "All"}`);
        console.log(`  Frequency: ${report.frequency}`);
        console.log(`  Report Types:`, report.reportTypes);
        console.log(`  Recipients:`, report.emailRecipients);
        console.log("========================================");

        const { startDate, endDate } = calculateDateRange(report.frequency);
        console.log(`  Date Range: ${startDate} to ${endDate}`);

        const brandFilter = report.brandId || "all";
        console.log(
          `  Filtering by: ${brandFilter === "all" ? "All brands" : `Brand ${brandFilter}`}`
        );

        const reportData = await generateReportData(startDate, endDate, brandFilter);
        console.log("\n✓ Report data generated successfully");
        console.log("  Report data keys:", Object.keys(reportData));

        const pdfAttachment = await generatePDFReport(report, reportData, startDate, endDate);
        console.log(`✓ PDF generated: ${pdfAttachment.filename}`);
        console.log(`  Size: ${(pdfAttachment.content.length / 1024).toFixed(2)} KB`);

        const subject = `Your Scheduled ${getFrequencyLabel(report.frequency)} Report: ${report.reportTypes.join(", ")}`;

        const emailOptions = {
          to: report.emailRecipients,
          subject,
          html: generateEmailHTML(report, reportData, startDate, endDate),
          attachments: [
            {
              filename: pdfAttachment.filename,
              content: pdfAttachment.content,
              contentType: pdfAttachment.contentType,
            },
          ],
        };

        console.log("\n→ Sending email...");
        const emailResponse = await sendEmail(emailOptions);
        console.log(`✓ Email sent successfully`);
        console.log(`  Message ID: ${emailResponse.messageId}`);

        const nextDeliveryDate = calculateNextDeliveryDate(
          report.frequency,
          report.deliveryDay,
          report.deliveryMonth,
          report.deliveryYear
        );

        await prisma.scheduledReport.update({
          where: { id: report.id },
          data: {
            nextDeliveryDate,
            lastDeliveryDate: new Date(),
          },
        });

        console.log(`✓ Updated next delivery date to: ${nextDeliveryDate.toISOString()}`);
        console.log("✓ Report processing completed successfully");
      } catch (error) {
        console.error(`\n✗ ERROR processing report ID: ${report.id}`);
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
      }
    }

    console.log("\n========================================");
    console.log("Finished sending scheduled reports.");
    console.log("========================================");
  } catch (error) {
    console.error("\n✗ CRITICAL ERROR fetching reports to send:");
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// ==================== HELPER FUNCTIONS ====================

function getFrequencyLabel(frequency) {
  const labels = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };
  return labels[frequency] || frequency;
}

function calculateDateRange(frequency) {
  const now = new Date();
  let startDate, endDate;

  switch (frequency) {
    case "daily": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }
    case "weekly": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }
    case "monthly": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setDate(start.getDate() + 1);
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }
    case "yearly": {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }
    default:
      startDate = now.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
  }

  return { startDate, endDate };
}

// ==================== REPORT DATA GENERATION ====================

async function generateReportData(startDate, endDate, brandFilter = "all") {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  console.log(`  Generating report data from ${start.toISOString()} to ${end.toISOString()}`);
  console.log(`  Brand filter: ${brandFilter === "all" ? "All brands" : brandFilter}`);

  const brandWhere =
    brandFilter !== "all" && brandFilter ? { brandId: brandFilter } : {};

  // ✅ Fetch orders, vouchers, and settlements in parallel
  // Settlements now fetched directly — no recalculation from raw data
  const [orders, voucherCodes, settlements] = await Promise.all([
    // Orders for sales summary + brand performance
    prisma.order.findMany({
      where: {
        paymentStatus: "COMPLETED",
        createdAt: { gte: start, lte: end },
        ...brandWhere,
      },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            categoryName: true,
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
            expiresAt: true,
            createdAt: true,
            _count: { select: { redemptions: true } },
          },
        },
      },
    }),

    // Voucher codes for redemption details
    prisma.voucherCode.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        order: {
          paymentStatus: "COMPLETED",
          ...brandWhere,
        },
      },
      include: {
        order: {
          include: {
            brand: { select: { id: true, brandName: true } },
          },
        },
        _count: { select: { redemptions: true } },
      },
    }),

    // ✅ Settlements fetched directly with all stored fields
    // Filter by period overlap so we catch all relevant settlement rows
    prisma.settlements.findMany({
      where: {
        periodStart: { lte: end },
        periodEnd:   { gte: start },
        ...(brandFilter !== "all" && brandFilter ? { brandId: brandFilter } : {}),
      },
      select: {
        id: true,
        brandId: true,
        settlementPeriod: true,
        periodStart: true,
        periodEnd: true,
        // ── Sales ─────────────────────────────────────────
        totalSold: true,
        totalSoldAmount: true,
        // ── Redemptions ───────────────────────────────────
        totalRedeemed: true,
        redeemedAmount: true,
        // ── Outstanding ───────────────────────────────────
        outstanding: true,
        outstandingAmount: true,
        // ── Financials (maintained by cron/webhook) ───────
        commissionAmount: true,
        vatAmount: true,
        breakageAmount: true,
        netPayable: true,
        // ── Payments ──────────────────────────────────────
        totalPaid: true,
        remainingAmount: true,
        paymentCount: true,
        lastPaymentDate: true,
        paymentHistory: true,
        paymentReference: true,
        // ── Meta ──────────────────────────────────────────
        status: true,
        paidAt: true,
        notes: true,
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
    }),
  ]);

  console.log(
    `  Found ${orders.length} orders, ${voucherCodes.length} vouchers, ${settlements.length} settlements`
  );

  const salesSummary      = generateSalesSummary(orders, start, end);
  const redemptionDetails = generateRedemptionDetails(voucherCodes);
  const settlementReports = generateSettlementReports(settlements);   // ✅ only settlements now
  const brandPerformance  = generateBrandPerformance(orders, voucherCodes);

  return {
    salesSummary,
    redemptionDetails,
    settlementReports,
    brandPerformance,
  };
}

// ==================== INDIVIDUAL REPORT GENERATORS ====================

function generateSalesSummary(orders) {
  const totalOrders   = orders.length;
  const totalRevenue  = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount    || 0), 0);
  const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity    || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const paymentMethodRevenue = {};
  orders.forEach((order) => {
    const method = order.paymentMethod || "Unknown";
    if (!paymentMethodRevenue[method]) {
      paymentMethodRevenue[method] = { orders: 0, revenue: 0 };
    }
    paymentMethodRevenue[method].orders++;
    paymentMethodRevenue[method].revenue += order.totalAmount || 0;
  });

  const dailyStats = {};
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { orders: 0, revenue: 0, quantity: 0 };
    }
    dailyStats[date].orders++;
    dailyStats[date].revenue  += order.totalAmount || 0;
    dailyStats[date].quantity += order.quantity    || 0;
  });

  return {
    summary: {
      totalOrders,
      totalRevenue,
      totalDiscount,
      totalQuantity,
      avgOrderValue,
    },
    revenueByPaymentMethod: Object.entries(paymentMethodRevenue).map(
      ([method, stats]) => ({ method, ...stats })
    ),
    dailyBreakdown: Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

function generateRedemptionDetails(voucherCodes) {
  const totalIssued = voucherCodes.length;

  const fullyRedeemed = voucherCodes.filter(
    (vc) => vc.isRedeemed || vc._count?.redemptions > 0 || vc.remainingValue === 0
  );
  const partiallyRedeemed = voucherCodes.filter(
    (vc) => vc.remainingValue < vc.originalValue && vc.remainingValue > 0
  );
  const active = voucherCodes.filter(
    (vc) => vc.remainingValue === vc.originalValue
  );

  const totalIssuedValue    = voucherCodes.reduce((sum, vc) => sum + (vc.originalValue  || 0), 0);
  const totalRedeemedValue  = voucherCodes.reduce((sum, vc) => sum + ((vc.originalValue || 0) - (vc.remainingValue || 0)), 0);
  const totalRemainingValue = voucherCodes.reduce((sum, vc) => sum + (vc.remainingValue || 0), 0);

  const redemptionRate =
    totalIssued > 0
      ? ((fullyRedeemed.length / totalIssued) * 100).toFixed(2)
      : "0.00";
  const redemptionValueRate =
    totalIssuedValue > 0
      ? ((totalRedeemedValue / totalIssuedValue) * 100).toFixed(2)
      : "0.00";

  const vouchers = voucherCodes.map((vc) => {
    const isExpired           = vc.expiresAt && new Date(vc.expiresAt) < new Date();
    const isPartiallyRedeemed = vc.remainingValue < vc.originalValue && vc.remainingValue > 0;
    const isFullyRedeemed     = vc.isRedeemed || vc._count?.redemptions > 0 || vc.remainingValue === 0;

    let status = "Active";
    if (isExpired)           status = "Expired";
    else if (isFullyRedeemed)     status = "Redeemed";
    else if (isPartiallyRedeemed) status = "Partially Redeemed";

    return {
      code:          vc.code,
      brandName:     vc.order?.brand?.brandName || "N/A",
      originalValue: vc.originalValue,
      remainingValue: vc.remainingValue,
      redeemedValue: vc.originalValue - vc.remainingValue,
      status,
    };
  });

  return {
    summary: {
      totalIssued,
      totalRedeemed:          fullyRedeemed.length,
      totalPartiallyRedeemed: partiallyRedeemed.length,
      totalActive:            active.length,
      totalIssuedValue,
      totalRedeemedValue,
      totalRemainingValue,
      redemptionRate:       parseFloat(redemptionRate),
      redemptionValueRate:  parseFloat(redemptionValueRate),
    },
    vouchers,
  };
}

/**
 * ✅ FIXED: Read stored DB values directly.
 * The purchase cron sets commissionAmount/vatAmount/netPayable for onPurchase brands.
 * The redemption webhook accumulates them for onRedemption brands.
 * No recalculation from raw orders/redemptions needed here.
 */
function generateSettlementReports(settlements) {
  const formattedSettlements = settlements.map((s) => {
    const settlementTrigger = s.brand.brandTerms?.settlementTrigger || "onRedemption";

    // Parse payment history safely
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

    // ✅ Read stored financial values — correct per trigger
    const commissionAmount = s.commissionAmount ?? 0;
    const vatAmount        = s.vatAmount        ?? 0;
    const breakageAmount   = s.breakageAmount   ?? 0;
    const netPayable       = s.netPayable       ?? 0;
    const totalPaid        = s.totalPaid        ?? 0;

    // Recalculate remaining live in case totalPaid changed
    const remainingAmount = Math.max(0, netPayable - totalPaid);

    // Derive lastPaymentDate from paymentHistory if not stored
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
      // ── Sales ──────────────────────────────────────────────────────
      totalSold:        s.totalSold        ?? 0,
      totalSoldAmount:  s.totalSoldAmount  ?? 0,
      // ── Redemptions ────────────────────────────────────────────────
      // onRedemption → incremented per redemption event in webhook
      // onPurchase   → incremented when voucher is redeemed (tracking only)
      totalRedeemed:    s.totalRedeemed    ?? 0,
      redeemedAmount:   s.redeemedAmount   ?? 0,
      // ── Outstanding ────────────────────────────────────────────────
      outstanding:       s.outstanding       ?? 0,
      outstandingAmount: s.outstandingAmount ?? 0,
      // ── Financials ─────────────────────────────────────────────────
      // onPurchase  → set at purchase, webhook skips these
      // onRedemption → 0 at purchase, accumulated by webhook
      commissionAmount,
      vatAmount,
      breakageAmount,
      netPayable,
      // ── Payments ───────────────────────────────────────────────────
      totalPaid,
      remainingAmount,
      paymentCount:    s.paymentCount ?? paymentHistory.length,
      lastPaymentDate,
      paymentHistory,
      // ── Meta ───────────────────────────────────────────────────────
      status:           s.status,
      paidAt:           s.paidAt,
      paymentReference: s.paymentReference,
      notes:            s.notes,
    };
  });

  // ✅ Status summary
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
      status:           s.status,
      paidAt:           s.paidAt ? s.paidAt.toISOString().split("T")[0] : null,
      paymentReference: s.paymentReference,
      notes:            s.notes,
    })),
  };
}

function generateBrandPerformance(orders, voucherCodes) {
  const brandStats = {};

  orders.forEach((order) => {
    const brandId   = order.brand.id;
    const brandName = order.brand.brandName;

    if (!brandStats[brandId]) {
      brandStats[brandId] = {
        brandId,
        brandName,
        totalOrders:           0,
        totalRevenue:          0,
        totalVouchersIssued:   0,
        totalVouchersRedeemed: 0,
      };
    }

    brandStats[brandId].totalOrders++;
    brandStats[brandId].totalRevenue         += order.totalAmount || 0;
    brandStats[brandId].totalVouchersIssued  += order.voucherCodes?.length || 0;
    brandStats[brandId].totalVouchersRedeemed += order.voucherCodes?.filter(
      (vc) => vc.isRedeemed || vc.remainingValue === 0 || vc._count.redemptions > 0
    ).length || 0;
  });

  const brandPerformanceData = Object.values(brandStats).map((brand) => ({
    ...brand,
    redemptionRate:
      brand.totalVouchersIssued > 0
        ? ((brand.totalVouchersRedeemed / brand.totalVouchersIssued) * 100).toFixed(2)
        : "0.00",
  }));

  const totalRevenue = brandPerformanceData.reduce((sum, b) => sum + b.totalRevenue, 0);
  const avgRedemptionRate =
    brandPerformanceData.length > 0
      ? (
          brandPerformanceData.reduce((sum, b) => sum + parseFloat(b.redemptionRate), 0) /
          brandPerformanceData.length
        ).toFixed(2)
      : "0.00";

  return {
    summary: {
      totalBrands: brandPerformanceData.length,
      totalRevenue,
      avgRedemptionRate: parseFloat(avgRedemptionRate),
    },
    brands: brandPerformanceData.sort((a, b) => b.totalRevenue - a.totalRevenue),
  };
}

// ==================== PDF GENERATION ====================

async function generatePDFReport(report, reportData, startDate, endDate) {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString("en-IN")}`;
  };

  const checkAddPage = (space = 40) => {
    if (yPos + space > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  const reportTitle = report.brand?.brandName
    ? `${getFrequencyLabel(report.frequency)} Report - ${report.brand.brandName}`
    : `${getFrequencyLabel(report.frequency)} Report - All Brands`;
  pdf.text(reportTitle, 14, yPos);
  pdf.setFont(undefined, "normal");
  pdf.setFontSize(10);
  yPos += 6;
  pdf.text(`Period: ${startDate} to ${endDate}`, 14, yPos);
  yPos += 6;
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
  yPos += 12;

  // ── SALES SUMMARY ──────────────────────────────────────────────────────
  if (reportData.salesSummary) {
    const sd = reportData.salesSummary;
    checkAddPage(50);
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("SALES SUMMARY", 14, yPos);
    pdf.setFont(undefined, "normal");
    yPos += 7;

    if (sd.summary) {
      autoTable(pdf, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Orders",     sd.summary.totalOrders.toLocaleString()],
          ["Total Revenue",    formatCurrency(sd.summary.totalRevenue)],
          ["Total Discount",   formatCurrency(sd.summary.totalDiscount)],
          ["Total Quantity",   sd.summary.totalQuantity.toLocaleString()],
          ["Avg Order Value",  formatCurrency(sd.summary.avgOrderValue)],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    if (sd.revenueByPaymentMethod?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Revenue by Payment Method", 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Payment Method", "Orders", "Revenue"]],
        body: sd.revenueByPaymentMethod.map((i) => [
          i.method,
          i.orders.toLocaleString(),
          formatCurrency(i.revenue),
        ]),
        theme: "striped",
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    if (sd.dailyBreakdown?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Daily Breakdown", 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Date", "Orders", "Revenue", "Quantity"]],
        body: sd.dailyBreakdown.slice(0, 30).map((i) => [
          i.date,
          i.orders.toLocaleString(),
          formatCurrency(i.revenue),
          i.quantity.toLocaleString(),
        ]),
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }
  }

  // ── REDEMPTION DETAILS ─────────────────────────────────────────────────
  if (reportData.redemptionDetails) {
    const rd = reportData.redemptionDetails;
    checkAddPage(50);
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("REDEMPTION DETAILS", 14, yPos);
    pdf.setFont(undefined, "normal");
    yPos += 7;

    if (rd.summary) {
      autoTable(pdf, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Issued",          rd.summary.totalIssued.toLocaleString()],
          ["Total Redeemed",        rd.summary.totalRedeemed.toLocaleString()],
          ["Partially Redeemed",    rd.summary.totalPartiallyRedeemed.toLocaleString()],
          ["Active",                rd.summary.totalActive.toLocaleString()],
          ["Issued Value",          formatCurrency(rd.summary.totalIssuedValue)],
          ["Redeemed Value",        formatCurrency(rd.summary.totalRedeemedValue)],
          ["Remaining Value",       formatCurrency(rd.summary.totalRemainingValue)],
        ],
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113], fontSize: 10 },
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    if (rd.vouchers?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text(`Voucher Details (${Math.min(rd.vouchers.length, 50)})`, 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Code", "Brand", "Original", "Remaining", "Status"]],
        body: rd.vouchers.slice(0, 50).map((v) => [
          v.code,
          v.brandName,
          formatCurrency(v.originalValue),
          formatCurrency(v.remainingValue),
          v.status,
        ]),
        theme: "striped",
        styles: { fontSize: 7 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }
  }

  // ── SETTLEMENT REPORTS ─────────────────────────────────────────────────
  if (reportData.settlementReports) {
    const sr = reportData.settlementReports;
    checkAddPage(50);
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("SETTLEMENT REPORTS", 14, yPos);
    pdf.setFont(undefined, "normal");
    yPos += 7;

    // Overall summary
    if (sr.summary) {
      autoTable(pdf, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Settlements",   sr.summary.totalSettlements.toLocaleString()],
          ["Total Sold Amount",   formatCurrency(sr.summary.totalSoldAmount)],
          ["Total Redeemed",      formatCurrency(sr.summary.totalRedeemedAmount)],
          ["Total Commission",    formatCurrency(sr.summary.totalCommission)],
          ["Total VAT",           formatCurrency(sr.summary.totalVAT)],
          ["Total Net Payable",   formatCurrency(sr.summary.totalAmount)],
          ["Total Paid",          formatCurrency(sr.summary.totalPaid)],
          ["Total Remaining",     formatCurrency(sr.summary.totalRemaining)],
        ],
        theme: "grid",
        headStyles: { fillColor: [230, 126, 34], fontSize: 10 },
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;

      // By status breakdown
      if (sr.summary.byStatus?.length > 0) {
        checkAddPage(50);
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("Settlement Status Breakdown", 14, yPos);
        pdf.setFont(undefined, "normal");
        yPos += 5;
        autoTable(pdf, {
          startY: yPos,
          head: [["Status", "Count", "Net Payable", "Paid", "Remaining"]],
          body: sr.summary.byStatus.map((s) => [
            s.status,
            s.count,
            formatCurrency(s.amount),
            formatCurrency(s.paid),
            formatCurrency(s.remaining),
          ]),
          theme: "striped",
          styles: { fontSize: 8 },
        });
        yPos = pdf.lastAutoTable.finalY + 8;
      }
    }

    // Settlement detail rows
    if (sr.settlements?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text(`Settlement Records (${sr.settlements.length})`, 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [[
          "Brand", "Trigger", "Period",
          "Sold Amt", "Redeemed Amt",
          "Commission", "VAT", "Net Payable",
          "Paid", "Remaining", "Status",
        ]],
        body: sr.settlements.map((s) => [
          s.brandName,
          s.settlementTrigger === "onPurchase" ? "Purchase" : "Redemption",
          s.settlementPeriod,
          formatCurrency(s.totalSoldAmount),
          formatCurrency(s.redeemedAmount),
          formatCurrency(s.commissionAmount),
          formatCurrency(s.vatAmount),
          formatCurrency(s.netPayable),
          formatCurrency(s.totalPaid),
          formatCurrency(s.remainingAmount),
          s.status,
        ]),
        theme: "striped",
        styles: { fontSize: 6 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }
  }

  // ── BRAND PERFORMANCE ──────────────────────────────────────────────────
  if (reportData.brandPerformance) {
    const bp = reportData.brandPerformance;
    checkAddPage(50);
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("BRAND PERFORMANCE", 14, yPos);
    pdf.setFont(undefined, "normal");
    yPos += 7;

    if (bp.summary) {
      autoTable(pdf, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Brands",        bp.summary.totalBrands.toLocaleString()],
          ["Total Revenue",       formatCurrency(bp.summary.totalRevenue)],
          ["Avg Redemption Rate", `${bp.summary.avgRedemptionRate}%`],
        ],
        theme: "grid",
        headStyles: { fillColor: [155, 89, 182], fontSize: 10 },
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    if (bp.brands?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text(`Brand Details (${bp.brands.length})`, 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Brand", "Orders", "Revenue", "Redemption Rate"]],
        body: bp.brands.map((b) => [
          b.brandName,
          b.totalOrders,
          formatCurrency(b.totalRevenue),
          `${b.redemptionRate}%`,
        ]),
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }
  }

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
  const dateStr   = new Date().toISOString().split("T")[0];
  const brandLabel = report.brand?.brandName
    ? `-${report.brand.brandName.replace(/\s+/g, "-")}`
    : "-all-brands";
  const filename = `${report.frequency}-report${brandLabel}-${dateStr}.pdf`;

  return {
    filename,
    content: pdfBuffer,
    contentType: "application/pdf",
  };
}

// ==================== EMAIL HTML ====================

function generateEmailHTML(report, reportData, startDate, endDate) {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString("en-IN")}`;
  };

  const salesSummary      = reportData.salesSummary?.summary      || {};
  const redemptionSummary = reportData.redemptionDetails?.summary  || {};
  const settlementSummary = reportData.settlementReports?.summary  || {};
  const brandSummary      = reportData.brandPerformance?.summary   || {};

  const reportScope = report.brand?.brandName
    ? `for <strong>${report.brand.brandName}</strong>`
    : "for <strong>All Brands</strong>";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getFrequencyLabel(report.frequency)} Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 5px 0; opacity: 0.9; }
    .summary-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary-section h2 { color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .metric-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { font-weight: 600; color: #495057; }
    .metric-value { color: #212529; font-weight: 500; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 ${getFrequencyLabel(report.frequency)} Report</h1>
    <p>${reportScope}</p>
    <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  </div>

  <div class="footer">
    <p>📎 The complete detailed report is attached as a PDF.</p>
    <p style="margin-top: 20px; font-size: 12px;">This is an automated report. Please do not reply to this email.</p>
  </div>
</body>
</html>
  `;
}

// ==================== RUN ====================

sendScheduledReports().catch((error) => {
  console.error("\n✗ FATAL ERROR:");
  console.error(error);
  process.exit(1);
});