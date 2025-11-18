"use client"
import React, { useState } from 'react';
import { Calendar, Download, FileText, FileSpreadsheet, AlertCircle, ChevronDown } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function ReportsPage() {
    const [brands, setBrands] = useState([]);
    const [customReport, setCustomReport] = useState({
        startDate: '2025-11-05',
        endDate: '2025-11-31',
        brand: 'all',
        status: 'all',
        reports: {
            salesSummary: false,
            redemptionDetails: false,
            settlementReports: false,
            transactionLog: false,
            brandPerformance: false,
            liabilitySnapshot: false,
        }
    });

    // Fetch brands on component mount
    React.useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('/api/brand?active=true');
                const data = await response.json();
                if (data.success) {
                    setBrands(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch brands:', error);
            }
        };
        fetchBrands();
    }, []);



    const [scheduledReport, setScheduledReport] = useState({
        frequency: '',
        deliveryDay: '',
        emailRecipients: 'XYZ@gmail.com',
        reportTypes: {
            settlementSummary: false,
            performanceReports: false,
        }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const quickReports = [
        {
            id: 'daily-settlement',
            title: 'Daily Settlement',
            description: 'Generate and download instant report',
            icon: '📊',
            color: 'bg-blue-50 border-blue-200',
            iconBg: 'bg-blue-100',
            textColor: 'text-blue-700'
        },
        {
            id: 'weekly-summary',
            title: 'Weekly Summary',
            description: 'Generate and download instant report',
            icon: '📈',
            color: 'bg-green-50 border-green-200',
            iconBg: 'bg-green-100',
            textColor: 'text-green-700'
        },
        {
            id: 'monthly-report',
            title: 'Monthly Report',
            description: 'Generate and download instant report',
            icon: '📋',
            color: 'bg-purple-50 border-purple-200',
            iconBg: 'bg-purple-100',
            textColor: 'text-purple-700'
        },
        {
            id: 'unredeemed-liability',
            title: 'Unredeemed Liability',
            description: 'Generate and download instant report',
            icon: '🎁',
            color: 'bg-orange-50 border-orange-200',
            iconBg: 'bg-orange-100',
            textColor: 'text-orange-700'
        }
    ];

    const handleQuickReport = async (reportId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`/api/reports/quick?type=${reportId}`);
            const data = await response.json();

            if (response.ok) {
                // Trigger download
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setMessage({ type: 'success', text: 'Report downloaded successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to generate report' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while generating the report' });
        } finally {
            setLoading(false);
        }
    };

    const handleCustomReportDownload = async (format) => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const selectedReports = Object.keys(customReport.reports).filter(
            (key) => customReport.reports[key]
        );

        if (selectedReports.length === 0) {
            setMessage({ type: "error", text: "Please select at least one report type" });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/reports/custom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: customReport.startDate,
                    endDate: customReport.endDate,
                    brand: customReport.brand,
                    status: customReport.status,
                    reports: selectedReports,
                    format,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to generate report");
            }

            const contentType = response.headers.get("Content-Type") || "";
            const dateStr = new Date().toISOString().split("T")[0];

            // Handle CSV
            if (contentType.includes("text/csv")) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `custom-report-${dateStr}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                setMessage({ type: "success", text: "CSV downloaded successfully!" });
                setLoading(false);
                return;
            }

            const data = await response.json();

            // Handle PDF with detailed data
            if (format === "pdf") {
                const pdf = new jsPDF();
                const pageHeight = pdf.internal.pageSize.getHeight();
                let yPos = 20;

                // Helper function to format currency
                const formatCurrency = (amount) => {
                    if (amount === null || amount === undefined) return 'Rs 0';
                    return `Rs ${Number(amount).toLocaleString('en-IN')}`;
                };

                const checkAddPage = (space = 40) => {
                    if (yPos + space > pageHeight - 20) {
                        pdf.addPage();
                        yPos = 20;
                    }
                };

                // Title
                pdf.setFontSize(16);
                pdf.setFont(undefined, 'bold');
                pdf.text(`Custom Report (${data.period?.startDate} to ${data.period?.endDate})`, 14, yPos);
                pdf.setFont(undefined, 'normal');
                yPos += 10;

                // SALES SUMMARY
                if (data.data?.salesSummary) {
                    const sd = data.data.salesSummary;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("📊 SALES SUMMARY", 14, yPos);
                    pdf.setFont(undefined, 'normal');
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
                            theme: 'grid',
                            headStyles: { fillColor: [41, 128, 185] },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.revenueByPaymentMethod?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text("Revenue by Payment Method", 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Payment Method", "Orders", "Revenue"]],
                            body: sd.revenueByPaymentMethod.map(i => [
                                i.method,
                                i.orders.toLocaleString(),
                                formatCurrency(i.revenue)
                            ]),
                            theme: 'striped',
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.dailyBreakdown?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text("Daily Breakdown", 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Date", "Orders", "Revenue", "Quantity"]],
                            body: sd.dailyBreakdown.map(i => [
                                i.date,
                                i.orders.toLocaleString(),
                                formatCurrency(i.revenue),
                                i.quantity.toLocaleString()
                            ]),
                            theme: 'striped',
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.orders?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text(`Orders Details (${sd.orders.length})`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Order #", "Brand", "Customer", "Email", "Amount", "Discount", "Qty", "Payment", "Date"]],
                            body: sd.orders.map(o => [
                                o.orderNumber,
                                o.brandName,
                                o.customer,
                                o.customerEmail,
                                formatCurrency(o.amount),
                                formatCurrency(o.discount),
                                o.quantity,
                                o.paymentMethod,
                                o.date
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 7 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                // REDEMPTION DETAILS
                if (data.data?.redemptionDetails) {
                    const rd = data.data.redemptionDetails;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("🎫 REDEMPTION DETAILS", 14, yPos);
                    pdf.setFont(undefined, 'normal');
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
                                ["Redemption Rate", `${rd.summary.redemptionRate}%`],
                            ],
                            theme: 'grid',
                            headStyles: { fillColor: [46, 204, 113] },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (rd.vouchers?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text(`Voucher Details (${rd.vouchers.length})`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Code", "Order #", "Brand", "Original", "Remaining", "Used", "Status", "Issued", "Count"]],
                            body: rd.vouchers.slice(0, 100).map(v => [
                                v.code,
                                v.orderNumber,
                                v.brandName,
                                formatCurrency(v.originalValue),
                                formatCurrency(v.remainingValue),
                                formatCurrency(v.usedValue),
                                v.status,
                                v.issuedDate,
                                v.redemptionCount
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 7 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                // SETTLEMENT REPORTS
                if (data.data?.settlementReports) {
                    const sr = data.data.settlementReports;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("💰 SETTLEMENT REPORTS", 14, yPos);
                    pdf.setFont(undefined, 'normal');
                    yPos += 7;

                    if (sr.summary) {
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Metric", "Value"]],
                            body: [
                                ["Total Settlements", sr.summary.totalSettlements.toLocaleString()],
                                ["Total Amount", formatCurrency(sr.summary.totalAmount)],
                                ["Total Commission", formatCurrency(sr.summary.totalCommission)],
                                ["Total VAT", formatCurrency(sr.summary.totalVAT)],
                            ],
                            theme: 'grid',
                            headStyles: { fillColor: [230, 126, 34] },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sr.summary?.byStatus?.length > 0) {
                        checkAddPage(40);
                        pdf.setFontSize(12);
                        pdf.text("By Status", 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Status", "Count", "Amount"]],
                            body: sr.summary.byStatus.map(s => [
                                s.status,
                                s.count.toLocaleString(),
                                formatCurrency(s.amount)
                            ]),
                            theme: 'striped',
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sr.settlements?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text(`Settlement Details (${sr.settlements.length})`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Period", "Sold", "Redeemed", "Outstanding", "Commission", "VAT", "Net", "Status"]],
                            body: sr.settlements.map(s => [
                                s.brandName,
                                s.settlementPeriod,
                                s.totalSold,
                                s.totalRedeemed,
                                s.outstanding,
                                formatCurrency(s.commissionAmount),
                                formatCurrency(s.vatAmount),
                                formatCurrency(s.netPayable),
                                s.status
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 7 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                // TRANSACTION LOG
                if (data.data?.transactionLog) {
                    const tl = data.data.transactionLog;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("📝 TRANSACTION LOG", 14, yPos);
                    pdf.setFont(undefined, 'normal');
                    yPos += 7;

                    if (tl.transactions?.length > 0) {
                        pdf.setFontSize(12);
                        pdf.text(`Total Transactions: ${tl.totalTransactions}`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Order #", "Date", "Brand", "Customer", "Receiver", "Amount", "Payment"]],
                            body: tl.transactions.map(t => [
                                t.orderNumber,
                                new Date(t.date).toLocaleDateString(),
                                t.brandName,
                                t.customer.name,
                                t.receiver.name,
                                formatCurrency(t.totalAmount),
                                t.paymentMethod
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 7 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                // BRAND PERFORMANCE
                if (data.data?.brandPerformance) {
                    const bp = data.data.brandPerformance;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("🏆 BRAND PERFORMANCE", 14, yPos);
                    pdf.setFont(undefined, 'normal');
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
                            theme: 'grid',
                            headStyles: { fillColor: [155, 89, 182] },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (bp.brands?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text(`Brand Details (${bp.brands.length})`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Category", "Orders", "Revenue", "Qty", "Vouchers", "Redeemed", "Rate", "Avg Order"]],
                            body: bp.brands.map(b => [
                                b.brandName,
                                b.category,
                                b.totalOrders,
                                formatCurrency(b.totalRevenue),
                                b.totalQuantity,
                                b.vouchersIssued,
                                b.vouchersRedeemed,
                                `${b.redemptionRate}%`,
                                formatCurrency(b.avgOrderValue)
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 7 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                // LIABILITY SNAPSHOT
                if (data.data?.liabilitySnapshot) {
                    const ls = data.data.liabilitySnapshot;

                    checkAddPage(50);
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text("⚠️ LIABILITY SNAPSHOT", 14, yPos);
                    pdf.setFont(undefined, 'normal');
                    yPos += 7;

                    pdf.setFontSize(10);
                    pdf.text(`As of: ${ls.asOfDate}`, 14, yPos);
                    yPos += 5;

                    if (ls.summary) {
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Metric", "Value"]],
                            body: [
                                ["Total Vouchers", ls.summary.totalVouchers.toLocaleString()],
                                ["Total Liability", formatCurrency(ls.summary.totalLiability)],
                                ["Total Brands", ls.summary.totalBrands.toLocaleString()],
                            ],
                            theme: 'grid',
                            headStyles: { fillColor: [231, 76, 60] },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (ls.byBrand?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.text("Liability by Brand", 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Vouchers", "Liability", "Active", "Partial", "Expired"]],
                            body: ls.byBrand.map(b => [
                                b.brandName,
                                b.totalVouchers.toLocaleString(),
                                formatCurrency(b.totalLiability),
                                b.active,
                                b.partiallyRedeemed,
                                b.expired
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 8 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                pdf.save(`custom-report-${dateStr}.pdf`);
                setMessage({ type: "success", text: "PDF generated successfully!" });
                setLoading(false);
                return;
            }

            // JSON fallback
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `custom-report-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setMessage({ type: "success", text: "JSON downloaded successfully!" });
            setLoading(false);

        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: err.message || "Failed to generate report" });
            setLoading(false);
        }
    };


    const handleScheduleReport = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        const selectedReportTypes = Object.keys(scheduledReport.reportTypes).filter(
            key => scheduledReport.reportTypes[key]
        );

        if (!scheduledReport.frequency || !scheduledReport.deliveryDay || selectedReportTypes.length === 0) {
            setMessage({ type: 'error', text: 'Please fill all required fields and select at least one report type' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    frequency: scheduledReport.frequency,
                    deliveryDay: scheduledReport.deliveryDay,
                    emailRecipients: scheduledReport.emailRecipients,
                    reportTypes: selectedReportTypes
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Report scheduled successfully!' });
                // Reset form
                setScheduledReport({
                    frequency: '',
                    deliveryDay: '',
                    emailRecipients: '',
                    reportTypes: {
                        settlementSummary: false,
                        performanceReports: false,
                    }
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to schedule report' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while scheduling the report' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Quick Reports</h1>
                    <p className="text-gray-600 mt-1">Generate and download instant report</p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <p>{message.text}</p>
                    </div>
                )}

                {/* Quick Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickReports.map((report) => (
                        <button
                            key={report.id}
                            onClick={() => handleQuickReport(report.id)}
                            disabled={loading}
                            className={`${report.color} border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <div className={`${report.iconBg} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4`}>
                                {report.icon}
                            </div>
                            <h3 className={`${report.textColor} font-semibold text-lg mb-1`}>{report.title}</h3>
                            <p className="text-gray-600 text-sm">{report.description}</p>
                        </button>
                    ))}
                </div>

                {/* Custom Report Builder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Custom Report Builder</h2>
                        <p className="text-gray-600 text-sm mt-1">Create customized reports with specific filters and date ranges</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Settlement Frequency<span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">Start Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={customReport.startDate}
                                                onChange={(e) => setCustomReport({ ...customReport, startDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">End Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={customReport.endDate}
                                                onChange={(e) => setCustomReport({ ...customReport, endDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Remittance Email</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.salesSummary}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, salesSummary: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Sales Summary</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.redemptionDetails}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, redemptionDetails: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Redemption Details</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.settlementReports}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, settlementReports: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Settlement Reports</span>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.transactionLog}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, transactionLog: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Transaction Log</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.brandPerformance}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, brandPerformance: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Brand Performance</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customReport.reports.liabilitySnapshot}
                                                onChange={(e) => setCustomReport({
                                                    ...customReport,
                                                    reports: { ...customReport.reports, liabilitySnapshot: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Liability Snapshot</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCustomReportDownload('csv')}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => handleCustomReportDownload('pdf')}
                                    disabled={loading}
                                    className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Filters */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Filters</label>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">Brand</label>
                                        <div className="relative">
                                            <select
                                                value={customReport.brand}
                                                onChange={(e) => setCustomReport({ ...customReport, brand: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="all">All brands</option>

                                                {brands && brands.length > 0 ? (
                                                    brands.map((data) => (
                                                        <option key={data.id} value={data.brandName}>
                                                            {data.brandName}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option disabled>Loading brands...</option>
                                                )}
                                            </select>

                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">Status</label>
                                        <div className="relative">
                                            <select
                                                value={customReport.status}
                                                onChange={(e) => setCustomReport({ ...customReport, status: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="all">All status</option>
                                                <option value="completed">Completed</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Reports */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Scheduled Reports</h2>
                        <p className="text-gray-600 text-sm mt-1">Setup Automated Report Delivery</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                                <div className="relative">
                                    <select
                                        value={scheduledReport.frequency}
                                        onChange={(e) => setScheduledReport({ ...scheduledReport, frequency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select Frequency</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Day</label>
                                <div className="relative">
                                    <select
                                        value={scheduledReport.deliveryDay}
                                        onChange={(e) => setScheduledReport({ ...scheduledReport, deliveryDay: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select Day</option>
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={handleScheduleReport}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                Schedule Report
                            </button>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Recipients</label>
                                <input
                                    type="email"
                                    value={scheduledReport.emailRecipients}
                                    onChange={(e) => setScheduledReport({ ...scheduledReport, emailRecipients: e.target.value })}
                                    placeholder="XYZ@gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Report Types</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={scheduledReport.reportTypes.settlementSummary}
                                            onChange={(e) => setScheduledReport({
                                                ...scheduledReport,
                                                reportTypes: { ...scheduledReport.reportTypes, settlementSummary: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Settlement Summary</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={scheduledReport.reportTypes.performanceReports}
                                            onChange={(e) => setScheduledReport({
                                                ...scheduledReport,
                                                reportTypes: { ...scheduledReport.reportTypes, performanceReports: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Performance Reports</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}