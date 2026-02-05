"use client"
import React, { useState } from 'react';
import { Calendar, Download, FileText, AlertCircle, ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-hot-toast';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default function ReportsPage({ shop, notAllowSchedule }) {
    const [brands, setBrands] = useState([]);
    const [brandLoading, setBrandLoading] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
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
        brandId: 'all',
        frequency: 'weekly',
        deliveryDay: '',
        deliveryMonth: '',
        deliveryYear: new Date().getFullYear().toString(),
        emailRecipients: '',
        reportTypes: {
            settlementSummary: false,
            performanceReports: false,
        }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loadingFormat, setLoadingFormat] = useState(null); // 'csv' | 'pdf' | null
    const [scheduledReports, setScheduledReports] = useState([]);
    const [isEditing, setIsEditing] = useState(null); // Holds ID of report being edited
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch brands on component mount
    React.useEffect(() => {
        const fetchBrands = async () => {
            try {
                setBrandLoading(true);
                const response = await fetch(`/api/brand?active=true${shop ? `&shop=${shop}` : ''}`);
                const data = await response.json();
                if (data.success) {
                    setBrands(data.data);
                    if(notAllowSchedule){
                        setCustomReport({ ...customReport, brand: data?.data?.[0]?.id || 'all' })
                    }
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

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

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
                    pdf.text("SALES SUMMARY", 14, yPos);
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
                    pdf.text("REDEMPTION DETAILS", 14, yPos);
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
                    pdf.text("SETTLEMENT REPORTS", 14, yPos);
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
                                ["Total Paid", formatCurrency(sr.summary.totalPaid)],
                                ["Total Remaining", formatCurrency(sr.summary.totalRemaining)],
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
                            head: [["Status", "Count", "Amount", "Paid", "Remaining"]],
                            body: sr.summary.byStatus.map(s => [
                                s.status,
                                s.count.toLocaleString(),
                                formatCurrency(s.amount),
                                formatCurrency(s.paid),
                                formatCurrency(s.remaining)
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
                            head: [["Brand", "Period", "Net Payable", "Paid", "Remaining", "Status"]],
                            body: sr.settlements.map(s => [
                                s.brandName,
                                s.settlementPeriod,
                                formatCurrency(s.netPayable),
                                formatCurrency(s.totalPaid),
                                formatCurrency(s.remainingAmount),
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
                    pdf.text("TRANSACTION LOG", 14, yPos);
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
                    pdf.text("BRAND PERFORMANCE", 14, yPos);
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
                    pdf.text("LIABILITY SNAPSHOT", 14, yPos);
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
            const payload = {
                shop,
                brandId: scheduledReport.brandId,
                frequency: scheduledReport.frequency,
                deliveryDay: scheduledReport.deliveryDay,
                deliveryMonth: scheduledReport.frequency !== 'weekly' ? scheduledReport.deliveryMonth : null,
                deliveryYear: scheduledReport.frequency === 'yearly' ? scheduledReport.deliveryYear : null,
                emailRecipients: scheduledReport.emailRecipients,
                reportTypes: selectedReportTypes
            };

            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log("response", data, response)
            if (response.ok) {
                // setMessage({ type: 'success', text: 'Report scheduled successfully!' });
                toast.success('Report scheduled successfully!');
                setScheduledReport({
                    frequency: 'weekly',
                    deliveryDay: '',
                    emailRecipients: '',
                    reportTypes: {
                        settlementSummary: false,
                        performanceReports: false,
                    }
                });
                fetchScheduledReports();
            } else {
                // setMessage({ type: 'error', text: data.message || 'Failed to schedule report' });
                toast.error(data.message || 'Failed to schedule report.');
            }
        } catch (error) {
            // setMessage({ type: 'error', text: 'An error occurred while scheduling the report' });
            console.log("error", error)
            toast.error('An error occurred while scheduling the report');
        } finally {
            setLoading(false);
        }
    };

    const getDeliveryDayOptions = () => {
        if (scheduledReport.frequency === 'weekly') {
            return [
                { value: 'monday', label: 'Monday' },
                { value: 'tuesday', label: 'Tuesday' },
                { value: 'wednesday', label: 'Wednesday' },
                { value: 'thursday', label: 'Thursday' },
                { value: 'friday', label: 'Friday' },
                { value: 'saturday', label: 'Saturday' },
                { value: 'sunday', label: 'Sunday' }
            ];
        } else {
            // For monthly and yearly, return days 1-28
            return Array.from({ length: 28 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `${i + 1}${getOrdinalSuffix(i + 1)}`
            }));
        }
    };

    const getOrdinalSuffix = (num) => {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    };


    const formatScheduleDisplay = (report) => {
        let display = '';
        if (report.frequency === 'weekly') {
            display = `Every ${report.deliveryDay}`;
        } else if (report.frequency === 'monthly') {
            const monthName = months.find(m => m.value === report.deliveryMonth)?.label || '';
            display = `${report.deliveryDay}${getOrdinalSuffix(parseInt(report.deliveryDay))} of ${monthName}`;
        } else if (report.frequency === 'yearly') {
            const monthName = months.find(m => m.value === report.deliveryMonth)?.label || '';
            display = `${monthName} ${report.deliveryDay}${getOrdinalSuffix(parseInt(report.deliveryDay))}, ${report.deliveryYear}`;
        }
        return display;
    };


    // Fetch scheduled reports
    const fetchScheduledReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reports/schedule`);
            const data = await response.json();
            if (data.success) {
                setScheduledReports(data.data);
            } else {
                toast.error(data.message || 'Failed to load scheduled reports');
            }
        } catch (error) {
            console.error('Failed to fetch scheduled reports:', error);
            toast.error('Failed to load scheduled reports');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (notAllowSchedule) return;
        fetchScheduledReports();
    }, []);

    // Handle Delete Schedule
    const confirmDeleteSchedule = async (id) => {
        if (!scheduleToDelete) return;

        try {
            const response = await fetch(`/api/reports/schedule?id=${scheduleToDelete}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Scheduled report cancelled successfully!');
                fetchScheduledReports();
                setScheduleToDelete(null);
                setShowDeleteModal(false);
            } else {
                toast.error(data.message || 'Failed to cancel scheduled report');
            }
        } catch (error) {
            console.error('Failed to delete scheduled report:', error);
            toast.error('An error occurred while cancelling the report');
        } finally {
            setScheduleToDelete(null);
            setShowDeleteModal(false);
        }
    };


    const handleDeleteSchedule = (id) => {
        setScheduleToDelete(id);
        setShowDeleteModal(true);
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
                            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
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
                    {/* <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h2> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickReports.map((report) => (
                            <button
                                key={report.id}
                                // onClick={() => handleQuickReport(report.id)}
                                disabled={loading}
                                className={`${report.color} border-2 rounded-xl p-6 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                                checked={customReport.reports.salesSummary || false}
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
                                                checked={customReport.reports.redemptionDetails || false}
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
                                                checked={customReport.reports.settlementReports || false}
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
                                                checked={customReport.reports.transactionLog || false}
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
                                                checked={customReport.reports.brandPerformance || false}
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
                                                checked={customReport.reports.liabilitySnapshot || false}
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
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
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

                {!notAllowSchedule && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Scheduled Report' : 'Schedule New Report'}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Automate report delivery to your inbox</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                                    <div className="relative">
                                        <select
                                            value={scheduledReport.brandId}
                                            onChange={(e) => setScheduledReport({ ...scheduledReport, brandId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            disabled={brandLoading}
                                        >
                                            <option value="all">All brands</option>
                                            {brands.map((data) => (
                                                <option key={data.id} value={data.id}>
                                                    {data.brandName}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Frequency <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={scheduledReport.frequency}
                                            onChange={(e) => setScheduledReport({
                                                ...scheduledReport,
                                                frequency: e.target.value,
                                                deliveryDay: '',
                                                deliveryMonth: '',
                                                deliveryYear: new Date().getFullYear().toString()
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            {/* <option value="yearly">Yearly</option> */}
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
                                            {getDeliveryDayOptions().map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {(scheduledReport.frequency === 'monthly' || scheduledReport.frequency === 'yearly') && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Delivery Month <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={scheduledReport.deliveryMonth}
                                                onChange={(e) => setScheduledReport({ ...scheduledReport, deliveryMonth: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select Month</option>
                                                {months.map(month => (
                                                    <option key={month.value} value={month.value}>
                                                        {month.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {scheduledReport.frequency === 'yearly' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Delivery Year <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={new Date().getFullYear()}
                                            max={new Date().getFullYear() + 10}
                                            value={scheduledReport.deliveryYear}
                                            onChange={(e) => setScheduledReport({ ...scheduledReport, deliveryYear: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2026"
                                        />
                                    </div>
                                )}

                                <div className={scheduledReport.frequency === 'weekly' ? 'md:col-span-2 lg:col-span-3' : ''}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Recipient(s) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="email@example.com, another@example.com"
                                        value={scheduledReport.emailRecipients}
                                        onChange={(e) => setScheduledReport({ ...scheduledReport, emailRecipients: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Report Types <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.keys(scheduledReport.reportTypes).map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={scheduledReport.reportTypes[type] || false}
                                                    onChange={(e) => setScheduledReport({
                                                        ...scheduledReport,
                                                        reportTypes: { ...scheduledReport.reportTypes, [type]: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
                                    {isEditing && (
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleScheduleReport}
                                        disabled={loading}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Calendar className="w-5 h-5" />
                                        )}
                                        {isEditing ? 'Update Schedule' : 'Schedule Report'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Active Schedules</h2>
                                <p className="text-gray-600 text-sm mt-1">Manage your existing automated report schedules</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Brand</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Schedule</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Recipients</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Report Types</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Next Delivery</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {scheduledReports.length > 0 ? scheduledReports.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {report.brand?.brandName || 'All Brands'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium capitalize">{report.frequency}</div>
                                                    <div className="text-xs text-gray-500">{formatScheduleDisplay(report)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate" title={report.emailRecipients}>
                                                        {report.emailRecipients}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {Array.isArray(report.reportTypes) && report.reportTypes.map((rt, idx) => (
                                                            <div key={idx} className="text-xs">
                                                                • {rt.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(report.nextDeliveryDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(report.nextDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => handleDeleteSchedule(report.id)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                                                        <p className="text-gray-500 font-medium">No scheduled reports found</p>
                                                        <p className="text-gray-400 text-sm mt-1">Create your first scheduled report above</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                )}


                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setScheduleToDelete(null);
                    }}
                    onConfirm={confirmDeleteSchedule}
                    title="Cancel Scheduled Report"
                    message="Are you sure you want to cancel this scheduled report? This action cannot be undone."
                    confirmText="Yes, Cancel"
                    cancelText="No, Keep"
                />
            </div>
        </div >
    );
}