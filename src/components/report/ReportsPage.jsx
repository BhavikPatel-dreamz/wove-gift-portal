"use client"
import React, { useState } from 'react';
import { Calendar, Download, FileText, AlertCircle, ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-hot-toast';

export default function ReportsPage({ shop }) {
    const [brands, setBrands] = useState([]);
    const [brandLoading, setBrandLoading] = useState(false);

    const [customReport, setCustomReport] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
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

    const [scheduledReport, setScheduledReport] = useState({
        frequency: '',
        deliveryDay: '',
        emailRecipients: '',
        reportTypes: {
            settlementSummary: false,
            performanceReports: false,
        }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loadingFormat, setLoadingFormat] = useState(null); // 'csv' | 'pdf' | null

    // Fetch brands on component mount
    React.useEffect(() => {
        const fetchBrands = async () => {
            try {
                setBrandLoading(true);
                const response = await fetch(`/api/brand?active=true${shop ? `&shop=${shop}` : ''}`);
                const data = await response.json();
                if (data.success) {
                    setBrands(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch brands:', error);
                // setMessage({ type: 'error', text: 'Failed to load brands' });
                toast.error('Failed to load brands');
            } finally {
                setBrandLoading(false);
            }
        };
        fetchBrands();
    }, [shop]);

    const quickReports = [
        {
            id: 'daily-settlement',
            title: 'Daily Settlement',
            description: 'Today\'s settlement summary',
            icon: '📊',
            color: 'bg-blue-50 border-blue-200',
            iconBg: 'bg-blue-100',
            textColor: 'text-blue-700'
        },
        {
            id: 'weekly-summary',
            title: 'Weekly Summary',
            description: 'Last 7 days performance',
            icon: '📈',
            color: 'bg-green-50 border-green-200',
            iconBg: 'bg-green-100',
            textColor: 'text-green-700'
        },
        {
            id: 'monthly-report',
            title: 'Monthly Report',
            description: 'Current month overview',
            icon: '📋',
            color: 'bg-purple-50 border-purple-200',
            iconBg: 'bg-purple-100',
            textColor: 'text-purple-700'
        },
        {
            id: 'unredeemed-liability',
            title: 'Unredeemed Liability',
            description: 'Outstanding voucher value',
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
            const response = await fetch(`/api/reports/quick?type=${reportId}${shop ? `&shop=${shop}` : ''}`);
            const data = await response.json();

            if (response.ok) {
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // setMessage({ type: 'success', text: 'Report downloaded successfully!' });
                toast.success('Report downloaded successfully!');

            } else {
                // setMessage({ type: 'error', text: data.message || 'Failed to generate report' });
                toast.error(data.message || 'Failed to generate report');
            }
        } catch (error) {
            // setMessage({ type: 'error', text: 'An error occurred while generating the report' });
            toast.error('An error occurred while generating the report');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomReportDownload = async (format) => {
        setLoading(true);
        setMessage({ type: "", text: "" });
        setLoadingFormat(format);

        const selectedReports = Object.keys(customReport.reports).filter(
            (key) => customReport.reports[key]
        );

        if (selectedReports.length === 0) {
            // setMessage({ type: "error", text: "Please select at least one report type" });
            toast.error("Please select at least one report type");

            setLoading(false);
            setLoadingFormat(null);
            return;
        }

        if (!customReport.startDate || !customReport.endDate) {
            // setMessage({ type: "error", text: "Please select start and end dates" });
            toast.error("Please select start and end dates");
            setLoading(false);
            setLoadingFormat(null);
            return;
        }

        try {
            const response = await fetch("/api/reports/custom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shop,
                    startDate: customReport.startDate,
                    endDate: customReport.endDate,
                    brand: customReport.brand,
                    status: customReport.status === 'all' ? null : customReport.status,
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
                // setMessage({ type: "success", text: "CSV downloaded successfully!" });
                toast.success("CSV downloaded successfully!");
                setLoadingFormat(null);
                return;
            }

            const data = await response.json();

            // Handle PDF
            if (format === "pdf") {
                const pdf = new jsPDF();
                const pageHeight = pdf.internal.pageSize.getHeight();
                let yPos = 20;

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
                pdf.setFontSize(18);
                pdf.setFont(undefined, 'bold');
                pdf.text(`Custom Report`, 14, yPos);
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                yPos += 6;
                pdf.text(`Period: ${data.period?.startDate} to ${data.period?.endDate}`, 14, yPos);
                yPos += 5;
                pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
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
                            headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.revenueByPaymentMethod?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text("Revenue by Payment Method", 14, yPos);
                        pdf.setFont(undefined, 'normal');
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
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.dailyBreakdown?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text("Daily Breakdown", 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Date", "Orders", "Revenue", "Quantity"]],
                            body: sd.dailyBreakdown.slice(0, 30).map(i => [
                                i.date,
                                i.orders.toLocaleString(),
                                formatCurrency(i.revenue),
                                i.quantity.toLocaleString()
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 8 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sd.orders?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(`Recent Orders (${Math.min(sd.orders.length, 50)})`, 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Order #", "Brand", "Customer", "Amount", "Date"]],
                            body: sd.orders.slice(0, 50).map(o => [
                                o.orderNumber,
                                o.brandName,
                                o.customer,
                                formatCurrency(o.amount),
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
                            headStyles: { fillColor: [46, 204, 113], fontSize: 10 },
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (rd.vouchers?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(`Voucher Details (${Math.min(rd.vouchers.length, 50)})`, 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Code", "Brand", "Original", "Remaining", "Status", "Date"]],
                            body: rd.vouchers.slice(0, 50).map(v => [
                                v.code,
                                v.brandName,
                                formatCurrency(v.originalValue),
                                formatCurrency(v.remainingValue),
                                v.status,
                                v.issuedDate
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
                            headStyles: { fillColor: [230, 126, 34], fontSize: 10 },
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sr.summary?.byStatus?.length > 0) {
                        checkAddPage(40);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text("By Status", 14, yPos);
                        pdf.setFont(undefined, 'normal');
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
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (sr.settlements?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(`Settlement Details (${sr.settlements.length})`, 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Period", "Net Payable", "Status"]],
                            body: sr.settlements.map(s => [
                                s.brandName,
                                s.settlementPeriod,
                                formatCurrency(s.netPayable),
                                s.status
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 8 },
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
                        pdf.setFontSize(10);
                        pdf.text(`Total Transactions: ${tl.totalTransactions}`, 14, yPos);
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Order #", "Brand", "Customer", "Amount", "Date"]],
                            body: tl.transactions.slice(0, 50).map(t => [
                                t.orderNumber,
                                t.brandName,
                                t.customer.name,
                                formatCurrency(t.totalAmount),
                                new Date(t.date).toLocaleDateString()
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
                            headStyles: { fillColor: [155, 89, 182], fontSize: 10 },
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (bp.brands?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(`Brand Details (${bp.brands.length})`, 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Orders", "Revenue", "Redemption Rate"]],
                            body: bp.brands.map(b => [
                                b.brandName,
                                b.totalOrders,
                                formatCurrency(b.totalRevenue),
                                `${b.redemptionRate}%`
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 8 },
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
                            headStyles: { fillColor: [231, 76, 60], fontSize: 10 },
                            styles: { fontSize: 9 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }

                    if (ls.byBrand?.length > 0) {
                        checkAddPage(50);
                        pdf.setFontSize(12);
                        pdf.setFont(undefined, 'bold');
                        pdf.text("Liability by Brand", 14, yPos);
                        pdf.setFont(undefined, 'normal');
                        yPos += 5;
                        autoTable(pdf, {
                            startY: yPos,
                            head: [["Brand", "Vouchers", "Liability", "Active"]],
                            body: ls.byBrand.map(b => [
                                b.brandName,
                                b.totalVouchers.toLocaleString(),
                                formatCurrency(b.totalLiability),
                                b.active
                            ]),
                            theme: 'striped',
                            styles: { fontSize: 8 },
                        });
                        yPos = pdf.lastAutoTable.finalY + 8;
                    }
                }

                pdf.save(`custom-report-${dateStr}.pdf`);
                // setMessage({ type: "success", text: "PDF generated successfully!" });
                toast.success("PDF generated successfully!");
                setLoadingFormat(null);

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
            // setMessage({ type: "success", text: "JSON downloaded successfully!" });
            toast.success("JSON downloaded successfully!");


        } catch (err) {
            console.error(err);
            // setMessage({ type: "error", text: err.message || "Failed to generate report" });
            toast.error("Failed to generate report. Please try again.");

        } finally {
            setLoading(false);
            setLoadingFormat(null);
        }
    };

    const handleScheduleReport = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        const selectedReportTypes = Object.keys(scheduledReport.reportTypes).filter(
            key => scheduledReport.reportTypes[key]
        );

        if (!scheduledReport.frequency || !scheduledReport.deliveryDay || selectedReportTypes.length === 0) {
            // setMessage({ type: 'error', text: 'Please fill all required fields and select at least one report type' });
            toast.error('Please fill all the required fields');
            setLoading(false);
            return;
        }

        if (!scheduledReport.emailRecipients) {
            // setMessage({ type: 'error', text: 'Please enter email recipient(s)' });
            toast.error('Please enter email recipient(s)');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop,
                    frequency: scheduledReport.frequency,
                    deliveryDay: scheduledReport.deliveryDay,
                    emailRecipients: scheduledReport.emailRecipients,
                    reportTypes: selectedReportTypes
                })
            });

            const data = await response.json();

            if (response.ok) {
                // setMessage({ type: 'success', text: 'Report scheduled successfully!' });
                toast.success('Report scheduled successfully!');
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
                // setMessage({ type: 'error', text: data.message || 'Failed to schedule report' });
                toast.error(error.response?.data?.message || 'Failed to schedule report.');
            }
        } catch (error) {
            // setMessage({ type: 'error', text: 'An error occurred while scheduling the report' });
                toast.error('An error occurred while scheduling the report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Generate comprehensive reports and schedule automated deliveries</p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium">{message.text}</p>
                        </div>
                        <button
                            onClick={() => setMessage({ type: '', text: '' })}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Quick Reports Grid */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    Date Range <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={customReport.startDate}
                                            onChange={(e) => setCustomReport({ ...customReport, startDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={customReport.endDate}
                                            onChange={(e) => setCustomReport({ ...customReport, endDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Report Types <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                    {loadingFormat === 'csv' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => handleCustomReportDownload('pdf')}
                                    disabled={loading}
                                    className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                 {loadingFormat === 'pdf' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4" />
                                    )}
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
                                                disabled={brandLoading}
                                            >
                                                <option value="all">All brands</option>
                                                {!brandLoading ? (
                                                    brands.map((data) => (
                                                        <option key={data.id} value={data.id}>
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
                                        <label className="block text-xs text-gray-600 mb-2">Payment Status</label>
                                        <div className="relative">
                                            <select
                                                value={customReport.status}
                                                onChange={(e) => setCustomReport({ ...customReport, status: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="all">All status</option>
                                                <option value="completed">Completed</option>
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Report Tips</p>
                                        <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                            <li>• Select multiple report types for comprehensive analysis</li>
                                            <li>• CSV format is best for data manipulation in Excel</li>
                                            <li>• PDF format provides formatted, print-ready reports</li>
                                            <li>• Filter by brand to get specific merchant insights</li>
                                        </ul>
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
                        <p className="text-gray-600 text-sm mt-1">Setup automated report delivery to your inbox</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Frequency <span className="text-red-500">*</span>
                                </label>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Delivery Day <span className="text-red-500">*</span>
                                </label>
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
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Calendar className="w-4 h-4" />
                                )}
                                Schedule Report
                            </button>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Recipients <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={scheduledReport.emailRecipients}
                                    onChange={(e) => setScheduledReport({ ...scheduledReport, emailRecipients: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Report Types <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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