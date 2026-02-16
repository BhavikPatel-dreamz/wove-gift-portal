// ==================== COMPLETE SCHEDULED REPORTS SCRIPT ====================

import { currencyList } from "../src/components/brandsPartner/currency.js";
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

        // Calculate date range based on frequency
        const { startDate, endDate } = calculateDateRange(report.frequency);
        console.log(`  Date Range: ${startDate} to ${endDate}`);

        // Determine brand filter
        const brandFilter = report.brandId || 'all';
        console.log(`  Filtering by: ${brandFilter === 'all' ? 'All brands' : `Brand ${brandFilter}`}`);

        // Generate report data based on frequency
        const reportData = await generateReportData(
          startDate,
          endDate,
          brandFilter
        );
        console.log("\n✓ Report data generated successfully");
        console.log("  Report data keys:", Object.keys(reportData));

        // Generate PDF attachment
        const pdfAttachment = await generatePDFReport(
          report,
          reportData,
          startDate,
          endDate
        );
        console.log(`✓ PDF generated: ${pdfAttachment.filename}`);
        console.log(
          `  Size: ${(pdfAttachment.content.length / 1024).toFixed(2)} KB`
        );

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

        console.log(
          `✓ Updated next delivery date to: ${nextDeliveryDate.toISOString()}`
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
      start.setDate(start.getDate() - 6); // last 7 days inclusive
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }

    case "monthly": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setDate(start.getDate() + 1); // rolling month
      startDate = start.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
      break;
    }

    case "yearly": {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1); // rolling year
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

async function generateReportData(startDate, endDate, brandFilter = 'all') {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  console.log(`  Generating report data from ${start.toISOString()} to ${end.toISOString()}`);
  console.log(`  Brand filter: ${brandFilter === 'all' ? 'All brands' : brandFilter}`);

  // Build brand filter - only add brandId filter if brandFilter is not 'all'
  const brandWhere = brandFilter !== 'all' && brandFilter ? { brandId: brandFilter } : {};

  // Fetch all required data
  const [orders, voucherCodes, settlements, brands, redemptions] = await Promise.all([
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
            _count: {
              select: {
                redemptions: true,
              },
            },
          },
        },
      },
    }),

    prisma.voucherCode.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        order: { 
          paymentStatus: "COMPLETED",
          ...brandWhere 
        },
      },
      include: {
        order: {
          include: {
            brand: {
              select: {
                id: true,
                brandName: true,
              },
            },
          },
        },
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    }),

    prisma.settlements.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(brandFilter !== 'all' && brandFilter ? { brandId: brandFilter } : {}),
      },
      include: {
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    }),

    prisma.brand.findMany({
      where: {
        isActive: true,
        ...(brandFilter !== 'all' && brandFilter ? { id: brandFilter } : {}),
      },
      select: {
        id: true,
        brandName: true,
      },
    }),

    // Fetch redemptions in the period for onRedemption settlement calculation
    prisma.voucherRedemption.findMany({
      where: {
        redeemedAt: { gte: start, lte: end },
      },
      include: {
        voucherCode: {
          include: {
            order: {
              include: {
                brand: {
                  select: {
                    id: true,
                    brandName: true,
                    brandTerms: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  console.log(`  Found ${orders.length} orders, ${voucherCodes.length} vouchers, ${settlements.length} settlements, ${redemptions.length} redemptions`);

  // Generate Sales Summary
  const salesSummary = generateSalesSummary(orders, start, end);

  // Generate Redemption Details
  const redemptionDetails = generateRedemptionDetails(voucherCodes);

  // Generate Settlement Reports (now with redemptions data)
  const settlementReports = generateSettlementReports(orders, settlements, redemptions);

  // Generate Brand Performance
  const brandPerformance = generateBrandPerformance(orders, voucherCodes, brands);

  return {
    salesSummary,
    redemptionDetails,
    settlementReports,
    brandPerformance,
  };
}

function generateSalesSummary(orders, startDate, endDate) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue by payment method
  const paymentMethodRevenue = {};
  orders.forEach((order) => {
    const method = order.paymentMethod || "Unknown";
    if (!paymentMethodRevenue[method]) {
      paymentMethodRevenue[method] = { orders: 0, revenue: 0 };
    }
    paymentMethodRevenue[method].orders += 1;
    paymentMethodRevenue[method].revenue += order.totalAmount || 0;
  });

  const revenueByPaymentMethod = Object.entries(paymentMethodRevenue).map(
    ([method, stats]) => ({
      method,
      orders: stats.orders,
      revenue: stats.revenue,
    })
  );

  // Daily breakdown
  const dailyStats = {};
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { orders: 0, revenue: 0, quantity: 0 };
    }
    dailyStats[date].orders += 1;
    dailyStats[date].revenue += order.totalAmount || 0;
    dailyStats[date].quantity += order.quantity || 0;
  });

  const dailyBreakdown = Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalOrders,
      totalRevenue,
      totalDiscount,
      totalQuantity,
      avgOrderValue,
    },
    revenueByPaymentMethod,
    dailyBreakdown,
  };
}

function generateRedemptionDetails(voucherCodes) {
  const totalIssued = voucherCodes.length;
  
  // Match quick reports logic exactly: isRedeemed OR has redemptions OR remaining is 0
  const fullyRedeemed = voucherCodes.filter(
    (vc) => vc.isRedeemed || vc._count?.redemptions > 0 || vc.remainingValue === 0
  );
  
  // Partially redeemed: has some value used but still has remaining value
  const partiallyRedeemed = voucherCodes.filter(
    (vc) =>
      vc.remainingValue < vc.originalValue &&
      vc.remainingValue > 0
  );

  // Active: full value remaining
  const active = voucherCodes.filter(
    (vc) => vc.remainingValue === vc.originalValue
  );

  const totalRedeemed = fullyRedeemed.length;
  const totalPartiallyRedeemed = partiallyRedeemed.length;
  const totalActive = active.length;

  // Calculate actual monetary values
  const totalIssuedValue = voucherCodes.reduce(
    (sum, vc) => sum + (vc.originalValue || 0),
    0
  );
  
  // Redeemed value = original - remaining for each voucher
  const totalRedeemedValue = voucherCodes.reduce(
    (sum, vc) => sum + ((vc.originalValue || 0) - (vc.remainingValue || 0)),
    0
  );

  // Remaining value = sum of all remaining values
  const totalRemainingValue = voucherCodes.reduce(
    (sum, vc) => sum + (vc.remainingValue || 0),
    0
  );

  const redemptionRate =
    totalIssued > 0 ? ((totalRedeemed / totalIssued) * 100).toFixed(2) : "0.00";

  const redemptionValueRate = 
    totalIssuedValue > 0 ? ((totalRedeemedValue / totalIssuedValue) * 100).toFixed(2) : "0.00";

  // Voucher details
  const vouchers = voucherCodes.map((vc) => {
    const isExpired = vc.expiresAt && new Date(vc.expiresAt) < new Date();
    const isPartiallyRedeemed =
      vc.remainingValue < vc.originalValue && vc.remainingValue > 0;
    const isFullyRedeemed = vc.isRedeemed || vc._count?.redemptions > 0 || vc.remainingValue === 0;

    let status = "Active";
    if (isExpired) status = "Expired";
    else if (isFullyRedeemed) status = "Redeemed";
    else if (isPartiallyRedeemed) status = "Partially Redeemed";

    return {
      code: vc.code,
      brandName: vc.order?.brand?.brandName || "N/A",
      originalValue: vc.originalValue,
      remainingValue: vc.remainingValue,
      redeemedValue: vc.originalValue - vc.remainingValue,
      status,
    };
  });

  return {
    summary: {
      totalIssued,
      totalRedeemed,
      totalPartiallyRedeemed,
      totalActive,
      totalIssuedValue,
      totalRedeemedValue,
      totalRemainingValue,
      redemptionRate: parseFloat(redemptionRate),
      redemptionValueRate: parseFloat(redemptionValueRate),
    },
    vouchers,
  };
}

function generateSettlementReports(orders, settlements, redemptions) {
  const settlementsByBrand = {};
  const redemptionsByBrand = {};

  // ✅ STEP 1: Process redemptions for onRedemption brands
  redemptions.forEach((redemption) => {
    const order = redemption.voucherCode?.order;
    if (!order || !order.brand) return;

    const brandId = order.brand.id;
    const brandName = order.brand.brandName;
    const settlementTrigger = order.brand.brandTerms?.settlementTrigger || "onRedemption";
    const commissionType = order.brand.brandTerms?.commissionType || "Percentage";
    const commissionValue = order.brand.brandTerms?.commissionValue || 0;
    const vatRate = order.brand.brandTerms?.vatRate || 0;

    // Only process if settlement is triggered on redemption
    if (settlementTrigger !== "onRedemption") return;

    if (!redemptionsByBrand[brandId]) {
      redemptionsByBrand[brandId] = {
        brandId,
        brandName,
        settlementTrigger: "onRedemption",
        totalRedeemed: 0,
        totalRedeemedAmount: 0,
        commissionAmount: 0,
        vatAmount: 0,
        netPayable: 0,
      };
    }

    const redeemedAmount = redemption.amountRedeemed || 0;

    // Calculate commission on redeemed amount
    let commission = 0;
    if (commissionType === "Percentage") {
      commission = (redeemedAmount * commissionValue) / 100;
    } else {
      // Fixed commission per redemption transaction
      commission = commissionValue;
    }

    const vat = (commission * vatRate) / 100;
    const netPayable = redeemedAmount - commission - vat;

    redemptionsByBrand[brandId].totalRedeemed += 1;
    redemptionsByBrand[brandId].totalRedeemedAmount += redeemedAmount;
    redemptionsByBrand[brandId].commissionAmount += commission;
    redemptionsByBrand[brandId].vatAmount += vat;
    redemptionsByBrand[brandId].netPayable += netPayable;
  });

  // ✅ STEP 2: Process orders for onPurchase brands
  orders.forEach((order) => {
    const brandId = order.brand.id;
    const brandName = order.brand.brandName;
    const settlementTrigger = order.brand.brandTerms?.settlementTrigger || "onRedemption";
    const commissionType = order.brand.brandTerms?.commissionType || "Percentage";
    const commissionValue = order.brand.brandTerms?.commissionValue || 0;
    const vatRate = order.brand.brandTerms?.vatRate || 0;

    // Only process if settlement is triggered on purchase
    if (settlementTrigger !== "onPurchase") return;

    if (!settlementsByBrand[brandId]) {
      settlementsByBrand[brandId] = {
        brandId,
        brandName,
        settlementTrigger: "onPurchase",
        totalSold: 0,
        totalSoldAmount: 0,
        commissionAmount: 0,
        vatAmount: 0,
        netPayable: 0,
      };
    }

    // Calculate commission on purchase amount
    let commission = 0;
    if (commissionType === "Percentage") {
      commission = (order.totalAmount * commissionValue) / 100;
    } else {
      // Fixed commission is just the value, not multiplied by quantity
      commission = commissionValue;
    }

    const vat = (commission * vatRate) / 100;
    const netPayable = order.totalAmount - commission - vat;

    settlementsByBrand[brandId].totalSold += order.quantity;
    settlementsByBrand[brandId].totalSoldAmount += order.totalAmount;
    settlementsByBrand[brandId].commissionAmount += commission;
    settlementsByBrand[brandId].vatAmount += vat;
    settlementsByBrand[brandId].netPayable += netPayable;
  });

  // ✅ STEP 3: Combine both settlement types
  const allCalculatedSettlements = [
    ...Object.values(settlementsByBrand),
    ...Object.values(redemptionsByBrand),
  ];

  // Summary from existing settlements records
  const totalSettlements = settlements.length;
  const totalAmount = settlements.reduce((sum, s) => sum + (s.totalSoldAmount || 0), 0);
  const totalCommission = settlements.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);
  const totalVAT = settlements.reduce((sum, s) => sum + (s.vatAmount || 0), 0);
  const totalNetPayable = settlements.reduce((sum, s) => sum + (s.netPayable || 0), 0);
  const totalPaid = settlements.reduce(
    (sum, s) => sum + (s.totalPaid || 0),
    0
  );
  const totalRemaining = settlements.reduce(
    (sum, s) => sum + (s.remainingAmount || 0),
    0
  );

  const settlementDetails = settlements.map((s) => ({
    brandName: s.brand?.brandName || "N/A",
    settlementPeriod: s.settlementPeriod,
    totalSoldAmount: s.totalSoldAmount,
    commissionAmount: s.commissionAmount,
    vatAmount: s.vatAmount,
    netPayable: s.netPayable,
    totalPaid: s.totalPaid,
    remainingAmount: s.remainingAmount,
    status: s.status,
  }));

  // Calculate totals from the period (both onPurchase and onRedemption)
  const periodTotalSoldAmount = allCalculatedSettlements.reduce(
    (sum, s) => sum + (s.totalSoldAmount || s.totalRedeemedAmount || 0), 
    0
  );
  const periodTotalCommission = allCalculatedSettlements.reduce(
    (sum, s) => sum + (s.commissionAmount || 0), 
    0
  );
  const periodTotalVAT = allCalculatedSettlements.reduce(
    (sum, s) => sum + (s.vatAmount || 0), 
    0
  );
  const periodTotalNetPayable = allCalculatedSettlements.reduce(
    (sum, s) => sum + (s.netPayable || 0), 
    0
  );

  return {
    summary: {
      // From existing settlement records
      totalSettlements,
      totalAmount,
      totalCommission,
      totalVAT,
      totalNetPayable,
      totalPaid,
      totalRemaining,
      // From orders/redemptions in this period
      periodTotalSoldAmount,
      periodTotalCommission,
      periodTotalVAT,
      periodTotalNetPayable,
    },
    settlements: settlementDetails,
    calculatedSettlements: allCalculatedSettlements,
  };
}

function generateBrandPerformance(orders, voucherCodes, brands) {
  const brandStats = {};

  // Process orders
  orders.forEach((order) => {
    const brandId = order.brand.id;
    const brandName = order.brand.brandName;

    if (!brandStats[brandId]) {
      brandStats[brandId] = {
        brandId,
        brandName,
        totalOrders: 0,
        totalRevenue: 0,
        totalVouchersIssued: 0,
        totalVouchersRedeemed: 0,
      };
    }

    brandStats[brandId].totalOrders += 1;
    brandStats[brandId].totalRevenue += order.totalAmount || 0;
    brandStats[brandId].totalVouchersIssued += order.voucherCodes?.length || 0;

    const redeemedCount = order.voucherCodes?.filter(
      (vc) => vc.isRedeemed || vc.remainingValue === 0 || vc._count.redemptions > 0
    ).length || 0;
    brandStats[brandId].totalVouchersRedeemed += redeemedCount;
  });

  // Calculate redemption rates
  const brandPerformanceData = Object.values(brandStats).map((brand) => ({
    ...brand,
    redemptionRate:
      brand.totalVouchersIssued > 0
        ? ((brand.totalVouchersRedeemed / brand.totalVouchersIssued) * 100).toFixed(2)
        : "0.00",
  }));

  const totalBrands = brandPerformanceData.length;
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
      totalBrands,
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

  // SALES SUMMARY
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
          ["Total Orders", sd.summary.totalOrders.toLocaleString()],
          ["Total Revenue", formatCurrency(sd.summary.totalRevenue)],
          ["Total Discount", formatCurrency(sd.summary.totalDiscount)],
          ["Total Quantity", sd.summary.totalQuantity.toLocaleString()],
          ["Avg Order Value", formatCurrency(sd.summary.avgOrderValue)],
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

  // REDEMPTION DETAILS
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
          ["Total Issued", rd.summary.totalIssued.toLocaleString()],
          ["Total Redeemed", rd.summary.totalRedeemed.toLocaleString()],
          ["Partially Redeemed", rd.summary.totalPartiallyRedeemed.toLocaleString()],
          ["Active", rd.summary.totalActive.toLocaleString()],
          ["Issued Value", formatCurrency(rd.summary.totalIssuedValue)],
          ["Redeemed Value", formatCurrency(rd.summary.totalRedeemedValue)],
          ["Remaining Value", formatCurrency(rd.summary.totalRemainingValue)],
          // ["Redemption Rate", `${rd.summary.redemptionRate}%`],
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

  // SETTLEMENT REPORTS
  if (reportData.settlementReports) {
    const sr = reportData.settlementReports;
    checkAddPage(50);
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("SETTLEMENT REPORTS", 14, yPos);
    pdf.setFont(undefined, "normal");
    yPos += 7;

    // // Existing Settlement Records Summary
    // if (sr.summary && sr.summary.totalSettlements > 0) {
    //   pdf.setFontSize(12);
    //   pdf.setFont(undefined, "bold");
    //   pdf.text("Existing Settlements", 14, yPos);
    //   pdf.setFont(undefined, "normal");
    //   yPos += 5;
      
    //   autoTable(pdf, {
    //     startY: yPos,
    //     head: [["Metric", "Value"]],
    //     body: [
    //       ["Total Settlements", sr.summary.totalSettlements.toLocaleString()],
    //       ["Total Amount", formatCurrency(sr.summary.totalAmount)],
    //       ["Total Commission", formatCurrency(sr.summary.totalCommission)],
    //       ["Total VAT", formatCurrency(sr.summary.totalVAT)],
    //       ["Net Payable", formatCurrency(sr.summary.totalNetPayable)],
    //       ["Total Paid", formatCurrency(sr.summary.totalPaid)],
    //       ["Total Remaining", formatCurrency(sr.summary.totalRemaining)],
    //     ],
    //     theme: "grid",
    //     headStyles: { fillColor: [230, 126, 34], fontSize: 10 },
    //     styles: { fontSize: 9 },
    //   });
    //   yPos = pdf.lastAutoTable.finalY + 8;
    // }

    // Period Calculation Summary
    if (sr.summary) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Period Sales & Settlements", 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      
      autoTable(pdf, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Sold/Redeemed Amount", formatCurrency(sr.summary.periodTotalSoldAmount)],
          ["Commission", formatCurrency(sr.summary.periodTotalCommission)],
          ["VAT", formatCurrency(sr.summary.periodTotalVAT)],
          ["Net Payable", formatCurrency(sr.summary.periodTotalNetPayable)],
        ],
        theme: "grid",
        headStyles: { fillColor: [230, 126, 34], fontSize: 10 },
        styles: { fontSize: 9 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    // Brand-wise Calculated Settlements (now includes both onPurchase and onRedemption)
    if (sr.calculatedSettlements?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text(`Brand-wise Settlements (${sr.calculatedSettlements.length})`, 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Brand", "Type", "Qty/Txns", "Amount", "Commission", "VAT", "Net Payable"]],
        body: sr.calculatedSettlements.map((s) => [
          s.brandName,
          s.settlementTrigger === "onPurchase" ? "Purchase" : "Redemption",
          s.totalSold?.toLocaleString() || s.totalRedeemed?.toLocaleString() || "0",
          formatCurrency(s.totalSoldAmount || s.totalRedeemedAmount || 0),
          formatCurrency(s.commissionAmount),
          formatCurrency(s.vatAmount),
          formatCurrency(s.netPayable),
        ]),
        theme: "striped",
        styles: { fontSize: 7 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }

    // Existing Settlement Details
    if (sr.settlements?.length > 0) {
      checkAddPage(50);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text(`Settlement Records (${sr.settlements.length})`, 14, yPos);
      pdf.setFont(undefined, "normal");
      yPos += 5;
      autoTable(pdf, {
        startY: yPos,
        head: [["Brand", "Period", "Amount", "Net Payable", "Status"]],
        body: sr.settlements.map((s) => [
          s.brandName,
          s.settlementPeriod,
          formatCurrency(s.totalSoldAmount),
          formatCurrency(s.netPayable),
          s.status,
        ]),
        theme: "striped",
        styles: { fontSize: 7 },
      });
      yPos = pdf.lastAutoTable.finalY + 8;
    }
  }

  // BRAND PERFORMANCE
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
          ["Total Brands", bp.summary.totalBrands.toLocaleString()],
          ["Total Revenue", formatCurrency(bp.summary.totalRevenue)],
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
  const dateStr = new Date().toISOString().split("T")[0];
  const brandLabel = report.brand?.brandName ? `-${report.brand.brandName.replace(/\s+/g, '-')}` : '-all-brands';
  const filename = `${report.frequency}-report${brandLabel}-${dateStr}.pdf`;

  return {
    filename,
    content: pdfBuffer,
    contentType: "application/pdf",
  };
}

// ==================== EMAIL HTML GENERATION ====================

function generateEmailHTML(report, reportData, startDate, endDate) {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString("en-IN")}`;
  };

  const salesSummary = reportData.salesSummary?.summary || {};
  const redemptionSummary = reportData.redemptionDetails?.summary || {};
  const settlementSummary = reportData.settlementReports?.summary || {};
  const brandSummary = reportData.brandPerformance?.summary || {};

  const reportScope = report.brand?.brandName 
    ? `for <strong>${report.brand.brandName}</strong>` 
    : 'for <strong>All Brands</strong>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getFrequencyLabel(report.frequency)} Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .summary-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary-section h2 {
      color: #667eea;
      margin-top: 0;
      font-size: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .metric-row:last-child {
      border-bottom: none;
    }
    .metric-label {
      font-weight: 600;
      color: #495057;
    }
    .metric-value {
      color: #212529;
      font-weight: 500;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      font-weight: 600;
    }
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
    <p>For more information, please visit your dashboard.</p>
    <p style="margin-top: 20px; font-size: 12px;">
      This is an automated report. Please do not reply to this email.
    </p>
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