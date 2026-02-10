// ==================== COMPLETE FIXED SCHEDULED REPORTS SCRIPT ====================

import { currencyList } from "../src/components/brandsPartner/currency.js";
import { prisma } from "../src/lib/db.js";
import { sendEmail } from "../src/lib/email.js";
import { calculateNextDeliveryDate } from "../src/lib/utils.js";
import pkg from "jspdf";
const { jsPDF } = pkg;
import autoTable from "jspdf-autotable";

const getCurrencySymbol = (code) =>
  currencyList.find((c) => c.code === code)?.symbol || "₹";


function formatCurrencyForPDF(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
}

function calculateSettlementFinancials(settlement) {
  const onRedemption =
    settlement.brand?.brandTerms?.settlementTrigger === "onRedemption";
  const baseAmount = onRedemption
    ? settlement.redeemedAmount || 0
    : settlement.totalSoldAmount || 0;

  const commissionRate = settlement.commissionRate || 0;
  const vatRate = settlement.vatRate || 0;

  const commissionAmount = baseAmount * (commissionRate / 100);
  const vatAmount = commissionAmount * (vatRate / 100);
  const netPayable = baseAmount - commissionAmount - vatAmount;
  const totalPaid = settlement.totalPaid || 0;
  const remainingAmount = netPayable - totalPaid;

  return {
    baseAmount,
    commissionAmount,
    vatAmount,
    netPayable,
    totalPaid,
    remainingAmount,
  };
}

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
        console.log(`  Brand: ${report.brand?.brandName || "N/A"}`);
        console.log(`  Shop: ${report.shop || "N/A"}`);
        console.log(`  Frequency: ${report.frequency}`);
        console.log(`  Report Types:`, report.reportTypes);
        console.log(`  Recipients:`, report.emailRecipients);
        console.log("========================================");

        // Generate report data based on report types
        const reportData = await generateReportData(report);
        console.log("\n✓ Report data generated successfully");
        console.log("  Report data keys:", Object.keys(reportData));

        // Generate PDF attachment
        const pdfAttachment = await generatePDFReport(report, reportData);
        console.log(`✓ PDF generated: ${pdfAttachment.filename}`);
        console.log(
          `  Size: ${(pdfAttachment.content.length / 1024).toFixed(2)} KB`,
        );

        const subject = `Your Scheduled Report: ${report.reportTypes.join(", ")}`;

        const emailOptions = {
          to: report.emailRecipients,
          subject,
          html: generateEmailHTML(report, reportData),
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
          report.deliveryYear,
        );

        await prisma.scheduledReport.update({
          where: { id: report.id },
          data: {
            nextDeliveryDate,
            lastDeliveryDate: new Date(),
          },
        });

        console.log(
          `✓ Updated next delivery date to: ${nextDeliveryDate.toISOString()}`,
        );
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

// ==================== REPORT DATA GENERATORS ====================

async function generateReportData(report) {
  console.log("\n→ Generating report data...");
  const { reportTypes, startDate, endDate, filters } = report;
  const data = {};

  // Build date range based on frequency
  const start = startDate
    ? new Date(startDate)
    : getDateRangeFromFrequency(report.frequency).start;
  const end = endDate
    ? new Date(endDate)
    : getDateRangeFromFrequency(report.frequency).end;
  end.setHours(23, 59, 59, 999);

  console.log("  Date range:");
  console.log(`    Start: ${start.toISOString()}`);
  console.log(`    End: ${end.toISOString()}`);

  // Parse filters if it's a JSON string
  let parsedFilters = filters;
  if (typeof filters === "string") {
    try {
      parsedFilters = JSON.parse(filters);
    } catch (e) {
      console.warn("  ⚠ Could not parse filters, using as-is");
      parsedFilters = {};
    }
  }

  // Build where clause for filters
  const whereClause = {
    createdAt: { gte: start, lte: end },
  };

  // Handle brand filter from report.brandId or filters
  const brandFilter = report.brandId || parsedFilters?.brand;
  if (brandFilter && brandFilter !== "all") {
    whereClause.brandId = brandFilter;
    console.log(`  Brand filter applied: ${brandFilter}`);
  }

  // Handle shop filter
  const shopFilter = report.shop || parsedFilters?.shop;
  if (shopFilter) {
    whereClause.brand = { domain: shopFilter };
    console.log(`  Shop filter applied: ${shopFilter}`);
  }

  if (parsedFilters?.status && parsedFilters.status !== "all") {
    whereClause.paymentStatus = parsedFilters.status.toUpperCase();
    console.log(`  Status filter applied: ${parsedFilters.status}`);
  }

  console.log("  Where clause:", JSON.stringify(whereClause, null, 2));

  // Parse reportTypes if it's a JSON string
  let reportTypesList = reportTypes;
  if (typeof reportTypes === "string") {
    try {
      reportTypesList = JSON.parse(reportTypes);
    } catch (e) {
      console.warn("  ⚠ Could not parse reportTypes, treating as single type");
      reportTypesList = [reportTypes];
    }
  }

  console.log(`  Processing ${reportTypesList.length} report type(s)...`);

  // Generate each requested report type
  for (const reportType of reportTypesList) {
    try {
      console.log(`\n  → Generating ${reportType}...`);

      switch (reportType) {
        case "salesSummary":
          data.salesSummary = await generateSalesSummary(whereClause);
          console.log(
            `    ✓ Sales Summary: ${data.salesSummary.summary.totalOrders} orders`,
          );
          break;
        case "redemptionDetails":
          data.redemptionDetails = await generateRedemptionDetails(whereClause);
          console.log(
            `    ✓ Redemption Details: ${data.redemptionDetails.summary.totalIssued} vouchers`,
          );
          break;
        case "settlementReports":
        case "settlementSummary":
          data.settlementReports = await generateSettlementReports(
            start,
            end,
            brandFilter,
            shopFilter,
          );
          console.log(
            `    ✓ Settlement Reports: ${data.settlementReports.summary.totalSettlements} settlements`,
          );
          break;
        case "transactionLog":
          data.transactionLog = await generateTransactionLog(whereClause);
          console.log(
            `    ✓ Transaction Log: ${data.transactionLog.totalTransactions} transactions`,
          );
          break;
        case "brandPerformance":
        case "performanceReports":
          data.brandPerformance = await generateBrandPerformance(whereClause);
          console.log(
            `    ✓ Brand Performance: ${data.brandPerformance.summary.totalBrands} brands`,
          );
          break;
        case "liabilitySnapshot":
          data.liabilitySnapshot = await generateLiabilitySnapshot(
            brandFilter,
            shopFilter,
          );
          console.log(
            `    ✓ Liability Snapshot: ${data.liabilitySnapshot.summary.totalVouchers} vouchers`,
          );
          break;
        case "daily-settlement":
          data.dailySettlement = await generateDailySettlement();
          console.log(
            `    ✓ Daily Settlement: ${data.dailySettlement.summary.totalOrders} orders`,
          );
          break;
        case "weekly-summary":
          data.weeklySummary = await generateWeeklySummary();
          console.log(
            `    ✓ Weekly Summary: ${data.weeklySummary.summary.totalOrders} orders`,
          );
          break;
        case "monthly-report":
          data.monthlyReport = await generateMonthlyReport();
          console.log(
            `    ✓ Monthly Report: ${data.monthlyReport.summary.totalOrders} orders`,
          );
          break;
        case "yearly-report":
          data.yearlyReport = await generateYearlyReport();
          console.log(
            `    ✓ Yearly Report: ${data.yearlyReport.summary.totalOrders} orders`,
          );
          break;
        case "unredeemed-liability":
          data.unredeemedLiability = await generateUnredeemedLiability();
          console.log(
            `    ✓ Unredeemed Liability: ${data.unredeemedLiability.summary.totalVouchers} vouchers`,
          );
          break;
        default:
          console.warn(`    ⚠ Unknown report type: ${reportType}`);
      }
    } catch (error) {
      console.error(`    ✗ Error generating ${reportType}:`, error.message);
      console.error("    Stack:", error.stack);
    }
  }

  data.period = {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };

  console.log("\n  ✓ All report data generated");
  console.log("  Data structure:", Object.keys(data));

  return data;
}

function getDateRangeFromFrequency(frequency) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);

  switch (frequency) {
    case "Daily":
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case "Weekly":
      start.setDate(today.getDate() - 7);
      end.setDate(today.getDate() - 1);
      break;
    case "Monthly":
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end.setDate(0);
      break;
    case "Quarterly":
      start.setMonth(today.getMonth() - 3);
      end.setDate(today.getDate() - 1);
      break;
    case "Yearly":
      start.setFullYear(today.getFullYear() - 1);
      start.setMonth(0);
      start.setDate(1);
      end.setFullYear(today.getFullYear() - 1);
      end.setMonth(11);
      end.setDate(31);
      break;
    default:
      start.setDate(today.getDate() - 7);
      end.setDate(today.getDate() - 1);
  }

  return { start, end };
}

// ==================== INDIVIDUAL REPORT GENERATORS ====================

async function generateSalesSummary(whereClause) {
  console.log("    Fetching orders from database...");

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`    Found ${orders.length} orders`);

  if (orders.length === 0) {
    return {
      summary: {
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        totalQuantity: 0,
        avgOrderValue: 0,
      },
      revenueByPaymentMethod: [],
      dailyBreakdown: [],
      recentOrders: [],
    };
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);

  const revenueByPaymentMethod = {};
  orders.forEach((order) => {
    const method = order.paymentMethod || "Unknown";
    if (!revenueByPaymentMethod[method]) {
      revenueByPaymentMethod[method] = { orders: 0, revenue: 0 };
    }
    revenueByPaymentMethod[method].orders += 1;
    revenueByPaymentMethod[method].revenue += order.totalAmount || 0;
  });

  const dailyRevenue = {};
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = { orders: 0, revenue: 0, quantity: 0 };
    }
    dailyRevenue[date].orders += 1;
    dailyRevenue[date].revenue += order.totalAmount || 0;
    dailyRevenue[date].quantity += order.quantity || 0;
  });

  return {
    summary: {
      totalOrders: orders.length,
      totalRevenue,
      totalDiscount,
      totalQuantity,
      avgOrderValue:
        orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    },
    revenueByPaymentMethod: Object.entries(revenueByPaymentMethod).map(
      ([method, data]) => ({
        method,
        ...data,
      }),
    ),
    dailyBreakdown: Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data })),
    recentOrders: orders.slice(0, 100).map((o) => ({
      orderNumber: o.orderNumber,
      brandName: o.brand?.brandName || "N/A",
      customer:
        `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || "N/A",
      customerEmail: o.user?.email || "N/A",
      amount: o.totalAmount || 0,
      discount: o.discount || 0,
      quantity: o.quantity || 0,
      paymentMethod: o.paymentMethod || "N/A",
      date: o.createdAt.toISOString().split("T")[0],
    })),
  };
}

async function generateRedemptionDetails(whereClause) {
  console.log("    Fetching voucher codes from database...");

  const voucherCodes = await prisma.voucherCode.findMany({
    where: whereClause,
    include: {
      brand: { select: { brandName: true } },
      order: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      redemptions: {
        orderBy: { redeemedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`    Found ${voucherCodes.length} voucher codes`);

  if (voucherCodes.length === 0) {
    return {
      summary: {
        totalIssued: 0,
        totalRedeemed: 0,
        totalPartiallyRedeemed: 0,
        totalActive: 0,
        redemptionRate: 0,
        totalIssuedValue: 0,
        totalRedeemedValue: 0,
        totalRemainingValue: 0,
      },
      vouchers: [],
    };
  }

  let totalIssuedValue = 0;
  let totalRedeemedValue = 0;
  let totalPartiallyRedeemed = 0;
  let totalActive = 0;

  voucherCodes.forEach((vc) => {
    totalIssuedValue += vc.originalValue || 0;
    const usedValue = (vc.originalValue || 0) - (vc.remainingValue || 0);
    totalRedeemedValue += usedValue;

    if (vc.isRedeemed || vc.remainingValue === 0) {
      // Fully redeemed
    } else if (vc.remainingValue < vc.originalValue) {
      totalPartiallyRedeemed++;
    } else {
      totalActive++;
    }
  });

  const totalIssued = voucherCodes.length;
  const totalRedeemed = voucherCodes.filter(
    (vc) => vc.isRedeemed || vc.remainingValue === 0,
  ).length;
  const redemptionRate =
    totalIssuedValue > 0
      ? ((totalRedeemedValue / totalIssuedValue) * 100).toFixed(1)
      : 0;

  // Mask voucher codes for security
  const maskVoucherCode = (code) => {
    if (!code || code.length <= 8) return code;
    const lastFour = code.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  return {
    summary: {
      totalIssued,
      totalRedeemed,
      totalPartiallyRedeemed,
      totalActive,
      redemptionRate: parseFloat(redemptionRate),
      totalIssuedValue,
      totalRedeemedValue,
      totalRemainingValue: totalIssuedValue - totalRedeemedValue,
    },
    vouchers: voucherCodes.slice(0, 200).map((vc) => {
      let status = "Active";
      if (vc.isRedeemed || vc.remainingValue === 0) {
        status = "Fully Redeemed";
      } else if (vc.remainingValue < vc.originalValue) {
        status = "Partially Redeemed";
      }

      return {
        code: maskVoucherCode(vc.code),
        brandName: vc.brand?.brandName || "N/A",
        customer: vc.order?.user
          ? `${vc.order.user.firstName} ${vc.order.user.lastName}`
          : "N/A",
        issuedDate: vc.createdAt.toISOString().split("T")[0],
        expiryDate: vc.expiresAt
          ? vc.expiresAt.toISOString().split("T")[0]
          : "N/A",
        originalValue: vc.originalValue || 0,
        remainingValue: vc.remainingValue || 0,
        status,
        lastRedemption:
          vc.redemptions[0]?.redeemedAt.toISOString().split("T")[0] || null,
      };
    }),
  };
}

async function generateSettlementReports(
  startDate,
  endDate,
  brandFilter,
  shop,
) {
  console.log("    Fetching settlements from database...");
  console.log(
    `    Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`,
  );

  const whereClause = {
    OR: [
      // Settlements that started during the period
      {
        periodStart: { gte: startDate, lte: endDate },
      },
      // Settlements that ended during the period
      {
        periodEnd: { gte: startDate, lte: endDate },
      },
      // Settlements that span the entire period
      {
        AND: [
          { periodStart: { lte: startDate } },
          { periodEnd: { gte: endDate } },
        ],
      },
    ],
  };

  if (shop) {
    whereClause.brand = { domain: shop };
  }

  if (brandFilter && brandFilter !== "all") {
    whereClause.brandId = brandFilter;
  }

  console.log("    Where clause:", JSON.stringify(whereClause, null, 2));

  const settlements = await prisma.settlements.findMany({
    where: whereClause,
    include: {
      brand: {
        select: {
          brandName: true,
          brandTerms: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`    Found ${settlements.length} settlements`);

  if (settlements.length === 0) {
    return {
      summary: {
        totalSettlements: 0,
        totalBaseAmount: 0,
        totalNetPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalCommission: 0,
        totalVAT: 0,
        byStatus: [],
      },
      settlements: [],
      recentSettlements: [],
    };
  }

  const statusSummary = {};
  let totalBaseAmount = 0;
  let totalNetPayable = 0;
  let totalPaid = 0;
  let totalRemaining = 0;
  let totalCommission = 0;
  let totalVAT = 0;

  settlements.forEach((s) => {
    const financials = calculateSettlementFinancials(s);

    totalBaseAmount += financials.baseAmount;
    totalNetPayable += financials.netPayable;
    totalPaid += financials.totalPaid;
    totalRemaining += financials.remainingAmount;
    totalCommission += financials.commissionAmount;
    totalVAT += financials.vatAmount;

    const status = s.status || "Pending";
    if (!statusSummary[status]) {
      statusSummary[status] = {
        count: 0,
        netPayable: 0,
        paid: 0,
        remaining: 0,
      };
    }
    statusSummary[status].count += 1;
    statusSummary[status].netPayable += financials.netPayable;
    statusSummary[status].paid += financials.totalPaid;
    statusSummary[status].remaining += financials.remainingAmount;
  });

  const settlementDetails = settlements.map((s) => {
    const financials = calculateSettlementFinancials(s);
    const baseLabel =
      s.brand?.brandTerms?.settlementTrigger === "onRedemption"
        ? "Redeemed"
        : "Sold";
    const onRedemption =
      s.brand?.brandTerms?.settlementTrigger === "onRedemption";
    const baseAmount = onRedemption
      ? s.redeemedAmount || 0
      : s.totalSoldAmount || 0;

    let commissionAmount = financials.commissionAmount;
    let vatAmount = financials.vatAmount;
    let netPayable = financials.netPayable;
    let remainingAmount = financials.remainingAmount;

    if (onRedemption) {
      const commissionRate = s.commissionRate || 0;
      const vatRate = s.vatRate || 0;
      commissionAmount = baseAmount * (commissionRate / 100);
      vatAmount = commissionAmount * (vatRate / 100);
      netPayable = baseAmount - commissionAmount - vatAmount;
      remainingAmount = netPayable - (s.totalPaid || 0);
    }

    return {
      brandName: s.brand?.brandName || "N/A",
      currency: s.brand?.currency || "USD",
      settlementPeriod: s.settlementPeriod,
      periodStart: s.periodStart.toISOString().split("T")[0],
      periodEnd: s.periodEnd.toISOString().split("T")[0],
      settlementTrigger: s.brand?.brandTerms?.settlementTrigger || "onPurchase",

      // Voucher metrics
      totalSold: s.totalSold || 0,
      totalSoldAmount: s.totalSoldAmount || 0,
      totalRedeemed: s.totalRedeemed || 0,
      redeemedAmount: s.redeemedAmount || 0,

      totalRemaining,
      totalCommission,
      totalVAT,
      byStatus: Object.entries(statusSummary).map(([status, data]) => ({
        status,
        ...data,
      })),

      // Financials
      baseAmount,
      baseLabel,
      commissionRate: s.commissionRate || 0,
      commissionAmount,
      vatRate: s.vatRate || 0,
      vatAmount,
      netPayable,
      totalPaid: s.totalPaid || 0,
      remainingAmount,
      status: s.status || "Pending",
    };
  });

  console.log(
    `    Settlement summary - Base: ${totalBaseAmount}, Net: ${totalNetPayable}, Paid: ${totalPaid}, Remaining: ${totalRemaining}`,
  );

  return {
    summary: {
      totalSettlements: settlements.length,
      totalBaseAmount,
      totalNetPayable,
      totalPaid,
      totalRemaining,
      totalCommission,
      totalVAT,
      byStatus: Object.entries(statusSummary).map(([status, data]) => ({
        status,
        ...data,
      })),
    },
    settlements: settlementDetails,
    recentSettlements: settlementDetails.slice(0, 50),
  };
}

async function generateTransactionLog(whereClause) {
  console.log("    Fetching transactions from database...");

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      brand: { select: { brandName: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
      occasion: { select: { name: true } },
      receiverDetail: true,
      voucherCodes: {
        select: { code: true, originalValue: true, isRedeemed: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  console.log(`    Found ${orders.length} transactions`);

  if (orders.length === 0) {
    return {
      totalTransactions: 0,
      transactions: [],
      recentTransactions: [],
    };
  }

  const transactionData = orders.map((o) => ({
    orderNumber: o.orderNumber,
    date: o.createdAt.toISOString(),
    brandName: o.brand?.brandName || "N/A",
    customer: {
      name:
        `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || "N/A",
      email: o.user?.email || "N/A",
    },
    receiver: {
      name: o.receiverDetail?.name || "N/A",
      email: o.receiverDetail?.email || "N/A",
      phone: o.receiverDetail?.phone || "N/A",
    },
    occasion: o.occasion?.name || "N/A",
    amount: o.amount || 0,
    quantity: o.quantity || 0,
    subtotal: o.subtotal || 0,
    discount: o.discount || 0,
    totalAmount: o.totalAmount || 0,
    paymentMethod: o.paymentMethod || "N/A",
    paymentStatus: o.paymentStatus,
    deliveryMethod: o.deliveryMethod,
    voucherCodes: o.voucherCodes.map((vc) => ({
      code: vc.code,
      value: vc.originalValue || 0,
      isRedeemed: vc.isRedeemed,
    })),
  }));

  return {
    totalTransactions: orders.length,
    transactions: transactionData,
    recentTransactions: transactionData.slice(0, 100),
  };
}

async function generateBrandPerformance(whereClause) {
  console.log("    Fetching brand performance data...");

  const startDate = whereClause.createdAt?.gte || new Date(0);
  const endDate = whereClause.createdAt?.lte || new Date();

  console.log(
    `    Period: ${startDate.toISOString()} to ${endDate.toISOString()}`,
  );

  // Get brand performance with voucher redemption data
  const performanceResults = await prisma.$queryRaw`
    SELECT
      b.id AS "brandId",
      b."brandName",
      COUNT(DISTINCT o.id)::int AS "totalOrders",
      COALESCE(SUM(o."totalAmount"), 0)::float AS "totalRevenue",
      COUNT(DISTINCT vc.id)::int AS "vouchersIssued",
      COUNT(DISTINCT CASE WHEN vc."isRedeemed" = true OR vc."remainingValue" = 0 THEN vc.id END)::int AS "vouchersRedeemed",
      COUNT(DISTINCT CASE WHEN vc."remainingValue" > 0 AND vc."remainingValue" < vc."originalValue" THEN vc.id END)::int AS "vouchersPartiallyRedeemed",
      COALESCE(SUM(vc."originalValue"), 0)::float AS "totalIssuedValue",
      COALESCE(SUM(vc."originalValue" - vc."remainingValue"), 0)::float AS "totalRedeemedValue"
    FROM
      "Brand" b
    LEFT JOIN
      "Order" o ON o."brandId" = b.id AND o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
    LEFT JOIN
      "VoucherCode" vc ON vc."orderId" = o.id
    WHERE
      b.id IN (SELECT DISTINCT "brandId" FROM "Order" WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate})
    GROUP BY
      b.id, b."brandName"
    ORDER BY
      "totalRevenue" DESC;
  `;

  if (performanceResults.length === 0) {
    return {
      summary: {
        totalBrands: 0,
        totalRevenue: 0,
        totalSettlementAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        avgRedemptionRate: 0,
      },
      brands: [],
      topBrands: [],
    };
  }

  const brandIds = performanceResults.map((p) => p.brandId);
  const settlements = await prisma.settlements.findMany({
    where: {
      brandId: { in: brandIds },
      OR: [
        { periodStart: { gte: startDate, lte: endDate } },
        { periodEnd: { gte: startDate, lte: endDate } },
        {
          AND: [
            { periodStart: { lte: startDate } },
            { periodEnd: { gte: endDate } },
          ],
        },
      ],
    },
    include: {
      brand: {
        select: {
          brandTerms: true,
        },
      },
    },
  });

  const settlementsByBrand = {};
  for (const s of settlements) {
    if (!settlementsByBrand[s.brandId]) {
      settlementsByBrand[s.brandId] = {
        totalSettlementAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      };
    }

    const financials = calculateSettlementFinancials(s);

    settlementsByBrand[s.brandId].totalSettlementAmount += financials.netPayable;
    settlementsByBrand[s.brandId].totalPaid += financials.totalPaid;
    settlementsByBrand[s.brandId].totalPending += financials.remainingAmount;
  }

  const brandsData = performanceResults.map((p) => {
    const settlementData = settlementsByBrand[p.brandId] || {
      totalSettlementAmount: 0,
      totalPaid: 0,
      totalPending: 0,
    };
    
    // Calculate redemption rate by value (amount redeemed / amount issued)
    // This gives more accurate representation of actual redemption
    const redemptionRateByValue =
      p.totalIssuedValue > 0
        ? parseFloat(((p.totalRedeemedValue / p.totalIssuedValue) * 100).toFixed(1))
        : 0;

    // Calculate redemption rate by count (for reference)
    const redemptionRateByCount =
      p.vouchersIssued > 0
        ? parseFloat(((p.vouchersRedeemed / p.vouchersIssued) * 100).toFixed(1))
        : 0;

    // Use value-based redemption rate as primary metric
    // Include partially redeemed vouchers in the calculation
    const totalRedeemedOrPartial = p.vouchersRedeemed + p.vouchersPartiallyRedeemed;
    const redemptionRateWithPartial =
      p.vouchersIssued > 0
        ? parseFloat(((totalRedeemedOrPartial / p.vouchersIssued) * 100).toFixed(1))
        : 0;

    console.log(`    Brand: ${p.brandName}`);
    console.log(`      Issued: ${p.vouchersIssued}, Redeemed: ${p.vouchersRedeemed}, Partial: ${p.vouchersPartiallyRedeemed}`);
    console.log(`      Rate by value: ${redemptionRateByValue}%, Rate by count: ${redemptionRateByCount}%`);

    return {
      brandId: p.brandId,
      brandName: p.brandName,
      totalOrders: p.totalOrders,
      totalRevenue: p.totalRevenue,
      vouchersIssued: p.vouchersIssued,
      vouchersRedeemed: p.vouchersRedeemed,
      vouchersPartiallyRedeemed: p.vouchersPartiallyRedeemed,
      // Use value-based redemption rate (most accurate for gift cards)
      redemptionRate: redemptionRateByValue,
      totalIssuedValue: p.totalIssuedValue,
      totalRedeemedValue: p.totalRedeemedValue,
      totalSettlementAmount: settlementData.totalSettlementAmount,
      totalPaid: settlementData.totalPaid,
      totalPending: settlementData.totalPending,
    };
  });

  const summary = brandsData.reduce(
    (acc, b) => {
      acc.totalRevenue += b.totalRevenue;
      acc.totalSettlementAmount += b.totalSettlementAmount;
      acc.totalPaid += b.totalPaid;
      acc.totalPending += b.totalPending;
      return acc;
    },
    {
      totalBrands: brandsData.length,
      totalRevenue: 0,
      totalSettlementAmount: 0,
      totalPaid: 0,
      totalPending: 0,
    },
  );

  // Calculate average redemption rate by total value redeemed vs issued
  const totalIssuedValue = brandsData.reduce((sum, b) => sum + b.totalIssuedValue, 0);
  const totalRedeemedValue = brandsData.reduce((sum, b) => sum + b.totalRedeemedValue, 0);
  
  summary.avgRedemptionRate =
    totalIssuedValue > 0
      ? parseFloat(((totalRedeemedValue / totalIssuedValue) * 100).toFixed(1))
      : 0;

  return {
    summary,
    brands: brandsData,
    topBrands: brandsData.slice(0, 10),
  };
}


async function generateLiabilitySnapshot(brandFilter, shop) {
  console.log("    Fetching liability snapshot...");

  const now = new Date();
  const whereClause = {
    isRedeemed: false,
    expiresAt: { gt: now },
  };

  if (shop || brandFilter) {
    whereClause.order = {};

    if (shop) {
      whereClause.order.brand = {
        domain: shop,
      };
    }

    if (brandFilter && brandFilter !== "all") {
      whereClause.order.brandId = brandFilter;
    }
  }

  const voucherCodes = await prisma.voucherCode.findMany({
    where: whereClause,
    select: {
      remainingValue: true,
      brand: {
        select: {
          brandName: true,
        },
      },
    },
  });

  console.log(`    Found ${voucherCodes.length} active vouchers`);

  if (voucherCodes.length === 0) {
    return {
      asOfDate: now.toISOString().split("T")[0],
      summary: {
        totalVouchers: 0,
        totalLiability: 0,
      },
      byBrand: [],
    };
  }

  const liabilityByBrand = {};
  let totalLiability = 0;

  voucherCodes.forEach((vc) => {
    totalLiability += vc.remainingValue || 0;
    const brandName = vc.brand?.brandName || "Unknown";
    if (!liabilityByBrand[brandName]) {
      liabilityByBrand[brandName] = { liability: 0, voucherCount: 0 };
    }
    liabilityByBrand[brandName].liability += vc.remainingValue || 0;
    liabilityByBrand[brandName].voucherCount += 1;
  });

  return {
    asOfDate: now.toISOString().split("T")[0],
    summary: {
      totalVouchers: voucherCodes.length,
      totalLiability,
    },
    byBrand: Object.entries(liabilityByBrand)
      .map(([brandName, data]) => ({
        brandName,
        ...data,
      }))
      .sort((a, b) => b.liability - a.liability),
  };
}

// ==================== PDF GENERATOR - SETTLEMENT SECTION ====================

function addSettlementSection(doc, reportData, yPos, margin, pageWidth) {
  if (!reportData.settlementReports || !reportData.settlementReports.summary) {
    return yPos;
  }

  console.log("  → Adding Settlement Reports section...");
  yPos = checkAndAddPage(doc, yPos, 80);
  const sr = reportData.settlementReports;
  
  // Get currency from first settlement or default to INR
  const currency = sr.recentSettlements?.[0]?.currency || "INR";

  doc.setFillColor(240, 249, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Settlement Summary", margin + 2, yPos + 6);
  yPos += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const settlementMetrics = [
    ["Total Settlements", sr.summary.totalSettlements.toLocaleString()],
    ["Base Amount", formatCurrencyForPDF(sr.summary.totalBaseAmount, currency)],
    ["Net Payable", formatCurrencyForPDF(sr.summary.totalNetPayable, currency)],
    ["Total Paid", formatCurrencyForPDF(sr.summary.totalPaid, currency)],
    ["Remaining", formatCurrencyForPDF(sr.summary.totalRemaining, currency)],
    ["Total Commission", formatCurrencyForPDF(sr.summary.totalCommission, currency)],
    ["Total VAT", formatCurrencyForPDF(sr.summary.totalVAT, currency)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: settlementMetrics,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Status breakdown
  if (sr.summary.byStatus?.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 40);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Settlement Status Breakdown", margin, yPos);
    yPos += 5;

    const statusData = sr.summary.byStatus.map((s) => [
      s.status,
      s.count.toLocaleString(),
      formatCurrencyForPDF(s.netPayable, currency),
      formatCurrencyForPDF(s.paid, currency),
      formatCurrencyForPDF(s.remaining, currency),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Status", "Count", "Net Payable", "Paid", "Remaining"]],
      body: statusData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Detailed settlements
  if (sr.recentSettlements?.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 40);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Settlement Details", margin, yPos);
    yPos += 5;

    const settlementData = sr.recentSettlements
      .slice(0, 30)
      .map((s) => [
        s.brandName.substring(0, 15),
        s.settlementPeriod,
        `${s.totalSold}/${s.totalRedeemed}`,
        formatCurrencyForPDF(s.baseAmount, s.currency || currency),
        formatCurrencyForPDF(s.netPayable, s.currency || currency),
        formatCurrencyForPDF(s.totalPaid, s.currency || currency),
        formatCurrencyForPDF(s.remainingAmount, s.currency || currency),
        s.status,
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [
        ["Brand", "Period", "S/R", "Base", "Net", "Paid", "Remain", "Status"],
      ],
      body: settlementData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 7 },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  return yPos;
}

function addBrandPerformanceSection(doc, reportData, yPos, margin, pageWidth) {
  if (!reportData.brandPerformance || !reportData.brandPerformance.summary) {
    return yPos;
  }

  console.log("  → Adding Brand Performance section...");
  yPos = checkAndAddPage(doc, yPos, 80);
  const bp = reportData.brandPerformance;
  
  // Default currency
  const defaultCurrency = "ZAR";

  doc.setFillColor(240, 249, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Brand Performance Summary", margin + 2, yPos + 6);
  yPos += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const brandMetrics = [
    ["Total Brands", bp.summary.totalBrands.toLocaleString()],
    ["Total Revenue", formatCurrencyForPDF(bp.summary.totalRevenue, defaultCurrency)],
    ["Total Settlement Amount", formatCurrencyForPDF(bp.summary.totalSettlementAmount, defaultCurrency)],
    ["Total Paid", formatCurrencyForPDF(bp.summary.totalPaid, defaultCurrency)],
    ["Total Pending", formatCurrencyForPDF(bp.summary.totalPending, defaultCurrency)],
    ["Avg Redemption Rate", `${bp.summary.avgRedemptionRate}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: brandMetrics,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  if (bp.brands?.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 40);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Brand Details (${bp.brands.length})`, margin, yPos);
    yPos += 5;

    const brandData = bp.brands.map((b) => [
      b.brandName.substring(0, 20),
      b.totalOrders?.toLocaleString() || "0",
      formatCurrencyForPDF(Math.round(b.totalRevenue || 0), defaultCurrency),
      `${b.redemptionRate || 0}%`,
      formatCurrencyForPDF(Math.round(b.totalPending || 0), defaultCurrency),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Brand", "Orders", "Revenue", "Redeem %", "Pending"]],
      body: brandData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  return yPos;
}

async function generateDailySettlement() {
  console.log("    Fetching daily settlement data...");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const endOfDay = new Date(yesterday);
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: { gte: yesterday, lte: endOfDay },
    },
    include: {
      brand: { select: { brandName: true, brandTerms: true } },
    },
  });

  console.log(`    Found ${orders.length} orders for yesterday`);

  return {
    reportDate: yesterday.toISOString().split("T")[0],
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    },
  };
}

async function generateWeeklySummary() {
  console.log("    Fetching weekly summary data...");

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: { gte: weekAgo, lte: today },
    },
  });

  console.log(`    Found ${orders.length} orders in last week`);

  return {
    periodStart: weekAgo.toISOString().split("T")[0],
    periodEnd: today.toISOString().split("T")[0],
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    },
  };
}

async function generateMonthlyReport() {
  console.log("    Fetching monthly report data...");

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
    23,
    59,
    59,
  );

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: { gte: lastMonth, lte: lastMonthEnd },
    },
  });

  console.log(`    Found ${orders.length} orders last month`);

  return {
    period: {
      month: lastMonth.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    },
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    },
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


async function generateUnredeemedLiability() {
  console.log("    Fetching unredeemed liability data...");

  const voucherCodes = await prisma.voucherCode.findMany({
    where: {
      OR: [{ isRedeemed: false }, { remainingValue: { gt: 0 } }],
    },
    include: {
      order: {
        include: {
          brand: { select: { brandName: true } },
        },
      },
    },
  });

  console.log(`    Found ${voucherCodes.length} unredeemed vouchers`);

  const totalLiability = voucherCodes.reduce(
    (sum, vc) => sum + (vc.remainingValue || 0),
    0,
  );

  return {
    generatedDate: new Date().toISOString().split("T")[0],
    summary: {
      totalVouchers: voucherCodes.length,
      totalLiability,
    },
  };
}

// ==================== PDF REPORT GENERATOR ====================

async function generatePDFReport(report, reportData) {
  console.log("\n→ Generating PDF...");

  const doc = new jsPDF();
  const { period } = reportData;

  let yPos = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // ==================== HEADER ====================
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  doc.text("Scheduled Report", margin, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 30);

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Report Info
  doc.setFontSize(10);
  doc.text(
    `Report Period: ${period.startDate} to ${period.endDate}`,
    margin,
    yPos,
  );
  yPos += 6;
  doc.text(`Frequency: ${report.frequency}`, margin, yPos);
  yPos += 10;

  console.log("  Added header and report info");

  // ==================== SETTLEMENT REPORTS ====================
  yPos = addSettlementSection(doc, reportData, yPos, margin, pageWidth);

  // ==================== BRAND PERFORMANCE ====================
  yPos = addBrandPerformanceSection(doc, reportData, yPos, margin, pageWidth);

  // ==================== SALES SUMMARY ====================
  if (reportData.salesSummary && reportData.salesSummary.summary) {
    console.log("  → Adding Sales Summary section...");
    yPos = checkAndAddPage(doc, yPos, 60);
    const ss = reportData.salesSummary;

    doc.setFillColor(240, 249, 255);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Sales Summary", margin + 2, yPos + 6);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const metrics = [
      ["Total Orders", ss.summary.totalOrders.toLocaleString()],
      ["Total Revenue", `₹${ss.summary.totalRevenue.toLocaleString()}`],
      ["Avg Order Value", `₹${ss.summary.avgOrderValue.toLocaleString()}`],
      ["Total Discount", `₹${ss.summary.totalDiscount.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: metrics,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: "bold" },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    if (ss.revenueByPaymentMethod?.length > 0) {
      yPos = checkAndAddPage(doc, yPos, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Revenue by Payment Method", margin, yPos);
      yPos += 5;

      const paymentData = ss.revenueByPaymentMethod.map((m) => [
        m.method,
        m.orders.toLocaleString(),
        `₹${m.revenue.toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Payment Method", "Orders", "Revenue"]],
        body: paymentData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (ss.dailyBreakdown?.length > 0) {
      yPos = checkAndAddPage(doc, yPos, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Daily Breakdown", margin, yPos);
      yPos += 5;

      const dailyData = ss.dailyBreakdown.map((d) => [
        d.date,
        d.orders.toLocaleString(),
        `₹${d.revenue.toLocaleString()}`,
        d.quantity.toLocaleString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Date", "Orders", "Revenue", "Quantity"]],
        body: dailyData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (ss.recentOrders?.length > 0) {
      yPos = checkAndAddPage(doc, yPos, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      const orderCount = Math.min(ss.recentOrders.length, 10);
      doc.text(`Recent Orders (${orderCount})`, margin, yPos);
      yPos += 5;

      const orderData = ss.recentOrders
        .slice(0, orderCount)
        .map((o) => [
          o.orderNumber,
          o.brandName.substring(0, 20),
          o.customer.substring(0, 15),
          `₹${o.amount.toLocaleString()}`,
          o.date,
        ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Order #", "Brand", "Customer", "Amount", "Date"]],
        body: orderData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }
  }

  // ==================== REDEMPTION DETAILS ====================
  if (reportData.redemptionDetails && reportData.redemptionDetails.summary) {
    console.log("  → Adding Redemption Details section...");
    yPos = checkAndAddPage(doc, yPos, 60);
    const rd = reportData.redemptionDetails;

    doc.setFillColor(240, 249, 255);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Redemption Details", margin + 2, yPos + 6);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const redemptionMetrics = [
      ["Total Issued", rd.summary.totalIssued.toLocaleString()],
      ["Total Redeemed", rd.summary.totalRedeemed.toLocaleString()],
      [
        "Partially Redeemed",
        rd.summary.totalPartiallyRedeemed.toLocaleString(),
      ],
      ["Active", rd.summary.totalActive.toLocaleString()],
      ["Issued Value", `₹${rd.summary.totalIssuedValue.toLocaleString()}`],
      ["Redeemed Value", `₹${rd.summary.totalRedeemedValue.toLocaleString()}`],
      ["Redemption Rate", `${rd.summary.redemptionRate}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: redemptionMetrics,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    if (rd.vouchers?.length > 0) {
      yPos = checkAndAddPage(doc, yPos, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      const voucherCount = Math.min(rd.vouchers.length, 10);
      doc.text(`Voucher Details (${voucherCount})`, margin, yPos);
      yPos += 5;

      const voucherData = rd.vouchers
        .slice(0, voucherCount)
        .map((v) => [
          v.code,
          v.brandName.substring(0, 15),
          `₹${v.originalValue.toLocaleString()}`,
          `₹${v.remainingValue.toLocaleString()}`,
          v.status,
          v.issuedDate,
        ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Code", "Brand", "Original", "Remaining", "Status", "Date"]],
        body: voucherData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 7 },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }
  }

  // ==================== TRANSACTION LOG ====================
  if (
    reportData.transactionLog &&
    reportData.transactionLog.totalTransactions > 0
  ) {
    console.log("  → Adding Transaction Log section...");
    yPos = checkAndAddPage(doc, yPos, 60);
    const tl = reportData.transactionLog;

    doc.setFillColor(240, 249, 255);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Transaction Log", margin + 2, yPos + 6);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    doc.text(`Total Transactions: ${tl.totalTransactions}`, margin, yPos);
    yPos += 10;

    if (tl.recentTransactions?.length > 0) {
      const transactionData = tl.recentTransactions
        .slice(0, 30)
        .map((t) => [
          t.orderNumber,
          t.date.split("T")[0],
          t.brandName.substring(0, 15),
          t.customer.name.substring(0, 15),
          `₹${t.totalAmount.toLocaleString()}`,
          t.paymentStatus,
        ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Order #", "Date", "Brand", "Customer", "Amount", "Status"]],
        body: transactionData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 7 },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }
  }

  // ==================== LIABILITY SNAPSHOT ====================
  if (reportData.liabilitySnapshot && reportData.liabilitySnapshot.summary) {
    console.log("  → Adding Liability Snapshot section...");
    yPos = checkAndAddPage(doc, yPos, 40);
    const ls = reportData.liabilitySnapshot;

    doc.setFillColor(240, 249, 255);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Liability Snapshot", margin + 2, yPos + 6);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const liabilityMetrics = [
      ["As of Date", ls.asOfDate],
      ["Total Vouchers", ls.summary.totalVouchers.toLocaleString()],
      ["Total Liability", `₹${ls.summary.totalLiability.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: liabilityMetrics,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ==================== FOOTER ====================
  const pageCount = doc.internal.getNumberOfPages();
  console.log(`  Adding footers to ${pageCount} page(s)...`);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  // Generate PDF as buffer
  const pdfOutput = doc.output("arraybuffer");
  const filename = `scheduled-report-${report.frequency.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;

  console.log(`  ✓ PDF generation complete: ${filename}`);
  console.log(`  Total pages: ${pageCount}`);

  return {
    filename: filename,
    content: Buffer.from(pdfOutput),
    contentType: "application/pdf",
  };
}

function checkAndAddPage(doc, currentY, requiredSpace) {
  const pageHeight = doc.internal.pageSize.height;
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return currentY;
}

// ==================== EMAIL HTML GENERATOR ====================

function generateEmailHTML(report, reportData) {
  const { period } = reportData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        h1 { margin: 0; font-size: 24px; }
        .info { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Your Scheduled Report is Ready</h1>
      </div>
      
      <p>Hello,</p>
      
      <p>Your scheduled ${report.frequency.toLowerCase()} report has been generated and is attached to this email.</p>
      
      <div class="info">
        <p><strong>Report Period:</strong> ${period.startDate} to ${period.endDate}</p>
        <p><strong>Report Types:</strong> ${Array.isArray(report.reportTypes) ? report.reportTypes.join(", ") : report.reportTypes}</p>
        <p><strong>Frequency:</strong> ${report.frequency}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <p>Please find the detailed PDF report attached to this email.</p>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>For questions or support, please contact your administrator.</p>
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
