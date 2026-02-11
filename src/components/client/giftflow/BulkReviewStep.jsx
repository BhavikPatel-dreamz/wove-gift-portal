import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { goBack, goNext, setIsConfirmed, setCompanyInfo } from '../../../redux/giftFlowSlice';
import { updateBulkCompanyInfo, addToBulk, addToBulkInCart } from '../../../redux/cartSlice';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { ShoppingBasket } from 'lucide-react';

const BulkReviewStep = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { selectedBrand, isConfirmed, companyInfo: companyInfoFromRedux } = useSelector((state) => state.giftFlowReducer);
    const { bulkItems } = useSelector((state) => state.cart);

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const isBulkMode = mode === 'bulk';

    // Get the most recent bulk item (last added)
    const currentBulkOrder = bulkItems[bulkItems.length - 1];

    // Local state only for form validation errors
    const [errors, setErrors] = useState({});
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvError, setCsvError] = useState('');
    const [isProcessingFile, setIsProcessingFile] = useState(false);

    useEffect(() => {
        if (!companyInfoFromRedux && currentBulkOrder?.companyInfo) {
            dispatch(setCompanyInfo(currentBulkOrder.companyInfo));
        }
    }, [companyInfoFromRedux, currentBulkOrder, dispatch]);

    const companyInfo = companyInfoFromRedux || currentBulkOrder?.companyInfo || {
        companyName: '',
        vatNumber: '',
        contactNumber: '',
        contactEmail: ''
    };

    const deliveryOption = currentBulkOrder?.deliveryOption || 'email';

    // Memoize preview data to avoid re-rendering issues
    const previewData = useMemo(() => csvData.slice(0, 5), [csvData]);
    const remainingCount = useMemo(() => Math.max(0, csvData.length - 5), [csvData.length]);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const readFileAsync = (file, fileExtension) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (evt) => {
                resolve(evt.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            if (fileExtension === 'csv') {
                reader.readAsBinaryString(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    };

    // Improved file upload handler with quantity validation
    const handleFileUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
            setCsvError('Please upload a CSV or Excel file');
            return;
        }

        setIsProcessingFile(true);
        setCsvFile(file);
        setCsvError('');
        setCsvData([]);

        try {
            const data = await readFileAsync(file, fileExtension);
            let parsedData;

            if (fileExtension === 'csv') {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            } else {
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            }

            if (!parsedData || parsedData.length === 0) {
                setCsvError('File is empty or has no data');
            }

            if (parsedData.length > 1000) {
                setCsvError('Maximum 1000 recipients allowed per upload');
            }

            const requiredColumns = ['name', 'email'];
            const firstRow = parsedData[0];
            const hasRequiredColumns = requiredColumns.every(col =>
                Object.keys(firstRow).some(key => key.toLowerCase() === col)
            );

            if (!hasRequiredColumns) {
                setCsvError('CSV must contain "name" and "email" columns (case-insensitive)');
            }

            const normalizedData = [];
            const errors = [];
            const seenEmails = new Set();

            for (let index = 0; index < parsedData.length; index++) {
                const row = parsedData[index];
                const rowNumber = index + 2;

                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.toLowerCase().trim()] = row[key];
                });

                const name = normalizedRow.name?.toString().trim();
                const email = normalizedRow.email?.toString().trim().toLowerCase();
                const phone = normalizedRow.phone?.toString().trim() || '';
                const message = normalizedRow.message?.toString().trim() || '';

                if (!name) {
                    errors.push(`Row ${rowNumber}: Missing name`);
                    continue;
                }

                if (!email) {
                    errors.push(`Row ${rowNumber}: Missing email`);
                    continue;
                }

                if (!emailRegex.test(email)) {
                    errors.push(`Row ${rowNumber}: Invalid email format (${email})`);
                    continue;
                }

                if (seenEmails.has(email)) {
                    errors.push(`Row ${rowNumber}: Duplicate email (${email})`);
                    continue;
                }

                seenEmails.add(email);

                normalizedData.push({
                    name,
                    email,
                    phone,
                    message,
                    rowNumber
                });
            }

            if (errors.length > 0) {
                const errorSummary = errors.length > 10
                    ? `${errors.slice(0, 10).join('\n')}\n...and ${errors.length - 10} more errors`
                    : errors.join('\n');

                if (normalizedData.length === 0) {
                    setCsvError(`All rows have errors:\n${errorSummary}`);
                } else {
                    setCsvError(`Warning: ${errors.length} row(s) skipped due to errors. ${normalizedData.length} valid recipients loaded.`);
                }
            }

            if (normalizedData.length === 0) {
                setCsvError('No valid recipients found in file');
            }

            // ✅ Validate quantity matches the bulk order quantity
            const orderQuantity = currentBulkOrder?.quantity || 0;
            if (normalizedData.length !== orderQuantity) {
                setCsvError(
                    `Recipient count mismatch: Your bulk order is for ${orderQuantity} vouchers, but the uploaded file contains ${normalizedData.length} recipients. Please upload a file with exactly ${orderQuantity} recipients.`
                );
            }

            setCsvData(normalizedData);

            setTimeout(() => {
                dispatch(updateBulkCompanyInfo({
                    companyInfo,
                    deliveryOption,
                    quantity: normalizedData.length,
                    csvRecipients: normalizedData
                }));
            }, 100);

        } catch (error) {
            console.error('File processing error:', error);
            setCsvError(error.message || 'Error parsing file. Please check the format and try again.');
            setCsvData([]);
        } finally {
            setIsProcessingFile(false);
        }
    }, [companyInfo, deliveryOption, dispatch, currentBulkOrder]);

    const validateForm = () => {
        const newErrors = {};

        if (!companyInfo.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        if (!companyInfo.contactNumber?.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        }

        if (!companyInfo.contactEmail?.trim()) {
            newErrors.contactEmail = 'Contact email is required';
        } else if (!emailRegex.test(companyInfo.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }

        if (deliveryOption === 'multiple') {
            if (csvData.length === 0) {
                newErrors.csvFile = 'Please upload a CSV file with recipients';
            }
            // ✅ Check quantity match
            else if (csvData.length !== currentBulkOrder?.quantity) {
                newErrors.csvFile = `Uploaded file must contain exactly ${currentBulkOrder?.quantity} recipients`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = useCallback((field, value) => {
        const newCompanyInfo = { ...companyInfo, [field]: value };

        dispatch(setCompanyInfo(newCompanyInfo));
        dispatch(updateBulkCompanyInfo({
            companyInfo: newCompanyInfo,
            deliveryOption,
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [companyInfo, deliveryOption, errors, dispatch]);

    const handleDeliveryOptionChange = useCallback((value) => {
        dispatch(updateBulkCompanyInfo({
            companyInfo,
            deliveryOption: value
        }));

        if (value !== 'multiple') {
            setCsvData([]);
            setCsvFile(null);
            setCsvError('');
        }
    }, [companyInfo, dispatch]);

    // Add to Cart Handler
    const handleAddToCart = () => {
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!currentBulkOrder) {
            toast.error('No bulk order found');
            return;
        }

        dispatch(addToBulkInCart(currentBulkOrder));
        toast.success('Bulk order added to cart!');
        router.push('/cart');
    };

    const handleProceedToCheckout = () => {
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }
        dispatch(goNext(2));
    };

    const handleBack = () => {
        dispatch(goBack());
    };

    const downloadSampleCSV = useCallback(() => {
        const orderQuantity = currentBulkOrder?.quantity || 3;
        const sampleData = [['name', 'email', 'phone', 'message']];

        // Generate sample rows based on order quantity (max 10 for sample)
        const sampleRowCount = Math.min(orderQuantity, 10);
        for (let i = 1; i <= sampleRowCount; i++) {
            sampleData.push([
                `Recipient ${i}`,
                `recipient${i}@example.com`,
                `+123456789${i}`,
                `Gift message ${i}`
            ]);
        }

        const csv = sampleData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample_recipients_${orderQuantity}_vouchers.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }, [currentBulkOrder]);

    if (!currentBulkOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-30">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No bulk order found</p>
                    <button
                        onClick={() => router.push('/gift?mode=bulk')}
                        className="text-pink-500 hover:text-pink-600 font-semibold"
                    >
                        Create Bulk Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 px-4 py-30 md:px-8 md:py-30">
                <div className="max-w-7xl mx-auto sm:px-6">
                    {/* Back Button and Bulk Mode Indicator */}
                    <div className="relative flex flex-col items-start gap-4 mb-6
                                md:flex-row md:items-center md:justify-between md:gap-0">

                        {/* Previous Button */}
                        <button
                            className="
                              relative inline-flex items-center justify-center gap-2
                              px-5 py-3 rounded-full font-semibold text-base
                              text-[#4A4A4A] bg-white border border-transparent
                              transition-all duration-300 overflow-hidden group cursor-pointer
                            "
                            onClick={() => dispatch(goBack())}
                        >
                            <span
                                className="
                                absolute inset-0 rounded-full p-[1.5px]
                                bg-linear-to-r from-[#ED457D] to-[#FA8F42]
                              "
                            ></span>
                            <span
                                className="
                                absolute inset-0.5 rounded-full bg-white
                                transition-all duration-300
                                group-hover:bg-linear-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
                              "
                            ></span>

                            <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
                                <svg
                                    width="8"
                                    height="9"
                                    viewBox="0 0 8 9"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="transition-all duration-300 group-hover:[&>path]:fill-white"
                                >
                                    <path
                                        d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                                        fill="url(#paint0_linear_584_1923)"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="paint0_linear_584_1923"
                                            x1="7.5"
                                            y1="3.01721"
                                            x2="-9.17006"
                                            y2="13.1895"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stopColor="#ED457D" />
                                            <stop offset="1" stopColor="#FA8F42" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                Previous
                            </div>
                        </button>

                        {/* Bulk Gifting Indicator */}
                        {isBulkMode && (
                            <div
                                className="
                        flex items-center gap-3 justify-center w-full
                        md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2
                      "
                            >
                                <div className="md:block w-30 h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

                                <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                                    <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                                        <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                                            Bulk Gifting
                                        </span>
                                    </div>
                                </div>

                                <div className="md:block w-30 h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
                            </div>
                        )}

                        <div className="md:block w-35" />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6 fontPoppins text-center">
                            Review your bulk gifting order
                        </h1>
                        <p className="text-[#4A4A4A] font-medium text-base">
                            Once confirmed, you'll receive all voucher codes via email in a CSV file within minutes
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    <div className="max-w-172 mx-auto bg-[#F9F9F9] rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            Order Summary
                        </h3>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                                {selectedBrand?.logo ? (
                                    <img
                                        src={selectedBrand.logo}
                                        alt={selectedBrand.brandName || selectedBrand.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl sm:text-2xl">
                                            {(selectedBrand?.brandName || selectedBrand?.name || 'B')
                                                .substring(0, 1)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div className="md:border-r border-[#1a1a1a28] pr-0 md:pr-4">
                                    <p className="text-[#1A1A1A] font-poppins text-sm sm:text-base font-semibold mb-1">
                                        Brand
                                    </p>
                                    <p className="text-[#4A4A4A] font-inter text-sm sm:text-base">
                                        {selectedBrand?.brandName || selectedBrand?.name}
                                    </p>
                                </div>

                                <div className="md:border-r border-[#1a1a1a28] pr-0 md:pr-4">
                                    <p className="text-[#1A1A1A] font-poppins text-sm sm:text-base font-semibold mb-1">
                                        Denomination
                                    </p>
                                    <p className="text-[#4A4A4A] font-inter text-sm sm:text-base">
                                        {currentBulkOrder.selectedAmount.currency}
                                        {currentBulkOrder.selectedAmount.value}
                                    </p>
                                </div>

                                <div className="md:border-r border-[#1a1a1a28] pr-0 md:pr-4">
                                    <p className="text-[#1A1A1A] font-poppins text-sm sm:text-base font-semibold mb-1">
                                        Quantity
                                    </p>
                                    <p className="text-[#4A4A4A] font-inter text-sm sm:text-base">
                                        {currentBulkOrder.quantity}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[#1A1A1A] font-poppins text-sm sm:text-base font-semibold mb-1">
                                        Total Amount
                                    </p>
                                    <p className="font-inter text-lg sm:text-xl font-bold bg-linear-to-r from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent">
                                        {currentBulkOrder.selectedAmount.currency}
                                        {currentBulkOrder.totalSpend?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Company Information Card */}
                    <div className="max-w-172 m-auto p-px rounded-[20px] shadow-sm mb-6" style={{ background: 'linear-gradient(114.06deg, #ED457D 11.36%, #FA8F42 90.28%)' }}>

                        <div className="p-6 bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)] rounded-[20px]">
                            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 fontPoppins">Company Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Your Company Name*"
                                        value={companyInfo.companyName || ''}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className={`w-full px-4 py-3 border bg-white ${errors.companyName ? 'border-red-500' : 'border-[#1A1A1A33]'} text-black rounded-[15px] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                    />
                                    {errors.companyName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        placeholder="Vat Number (e.g., 4001234567)"
                                        value={companyInfo.vatNumber || ''}
                                        onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                                        className="w-full px-4 py-3 border bg-white border-[#1A1A1A33] rounded-[15px]  focus:outline-none text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="tel"
                                            placeholder="Your Contact No.*"
                                            value={companyInfo.contactNumber || ''}
                                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white border ${errors.contactNumber ? 'border-red-500' : 'border-[#1A1A1A33]'} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                        />
                                        {errors.contactNumber && (
                                            <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Your Contact Email*"
                                            value={companyInfo.contactEmail || ''}
                                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white border ${errors.contactEmail ? 'border-red-500' : 'border-[#1A1A1A33]'} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                        />
                                        {errors.contactEmail && (
                                            <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                                        )}
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.385 4.10536L10.2305 0.660492C9.8465 0.250084 9.308 0.00447932 8.693 0.00447932H4.15325C2.99975 -0.0779223 2 0.988499 2 2.21892V13.7031C1.99951 14.005 2.05489 14.304 2.16297 14.5829C2.27106 14.8619 2.42971 15.1153 2.62984 15.3287C2.82996 15.5421 3.06762 15.7113 3.32917 15.8265C3.59073 15.9417 3.87103 16.0006 4.154 16H11.846C12.129 16.0006 12.4093 15.9417 12.6708 15.8265C12.9324 15.7113 13.17 15.5421 13.3702 15.3287C13.5703 15.1153 13.7289 14.8619 13.837 14.5829C13.9451 14.304 14.0005 14.005 14 13.7031V5.66459C14 5.09018 13.769 4.51577 13.385 4.10536ZM5.69225 6.48461H8C8.3075 6.48461 8.615 6.73101 8.615 7.14062C8.615 7.55103 8.38475 7.79663 8 7.79663H5.69225C5.61118 7.79782 5.53071 7.78166 5.45559 7.74911C5.38048 7.71656 5.31224 7.66828 5.25491 7.60713C5.19758 7.54598 5.15232 7.47319 5.1218 7.39306C5.09129 7.31293 5.07614 7.2271 5.07725 7.14062C5.07725 6.73021 5.38475 6.48461 5.69225 6.48461ZM10.3077 11.0783H5.69225C5.38475 11.0783 5.07725 10.8319 5.07725 10.4223C5.07725 10.0127 5.3075 9.76627 5.69225 9.76627H10.3077C10.6152 9.76627 10.9227 10.0119 10.9227 10.4223C10.9227 10.8327 10.6152 11.0783 10.3077 11.0783Z" fill="#39AE41" />
                                    </svg>
                                    <span className="text-[#1A1A1A] font-inter text-xs font-medium leading-4">
                                        CSV file with voucher codes will be sent to your Contact email</span>
                                </div>

                                {/* Delivery Options */}
                                <div className="pt-4 space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="email"
                                            checked={deliveryOption === 'email'}
                                            onChange={(e) => handleDeliveryOptionChange(e.target.value)}
                                            className="mt-1 w-4 h-4 focus:ring-pink-500 text-black"
                                        />
                                        <div className="flex-1">
                                            <span className="text-gray-900 font-medium">Send bulk codes to my email.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deliveryOption"
                                            value="multiple"
                                            checked={deliveryOption === 'multiple'}
                                            onChange={(e) => handleDeliveryOptionChange(e.target.value)}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <span className="text-gray-900 font-medium">
                                            Upload CSV/Excel and send individual emails
                                        </span>
                                    </label>

                                    {/* CSV Upload Section */}
                                    {deliveryOption === 'multiple' && (
                                        <div className="mt-4 p-4 text-black bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    Upload Recipient List
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={downloadSampleCSV}
                                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Download Sample CSV
                                                </button>
                                            </div>

                                            {/* ✅ Show required quantity */}
                                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm font-semibold text-yellow-800">
                                                    ⚠️ Required: Exactly {currentBulkOrder?.quantity || 0} recipients
                                                </p>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    Your bulk order is for {currentBulkOrder?.quantity || 0} vouchers.
                                                    Please upload a file with exactly {currentBulkOrder?.quantity || 0} recipients.
                                                </p>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">
                                                Upload a CSV or Excel file with columns: <strong>name</strong>, <strong>email</strong>, phone (optional), message (optional)
                                            </p>

                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".csv,.xlsx,.xls"
                                                    onChange={handleFileUpload}
                                                    disabled={isProcessingFile}
                                                    className={`w-full text-sm ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                                {isProcessingFile && (
                                                    <div className="absolute right-2 top-2">
                                                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {csvError && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-red-700 text-sm whitespace-pre-wrap">{csvError}</p>
                                                </div>
                                            )}

                                            {errors.csvFile && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-red-700 text-sm">{errors.csvFile}</p>
                                                </div>
                                            )}

                                            {csvData.length > 0 && !isProcessingFile && (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{csvData.length} recipients loaded successfully</span>
                                                    </div>

                                                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-gray-100 sticky top-0">
                                                                <tr>
                                                                    <th className="p-2 text-left font-semibold">#</th>
                                                                    <th className="p-2 text-left font-semibold">Name</th>
                                                                    <th className="p-2 text-left font-semibold">Email</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {previewData.map((row, idx) => (
                                                                    <tr key={idx} className="border-t hover:bg-gray-50">
                                                                        <td className="p-2 text-gray-500">{idx + 1}</td>
                                                                        <td className="p-2">{row.name}</td>
                                                                        <td className="p-2 text-gray-600">{row.email}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {remainingCount > 0 && (
                                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                                            ...and {remainingCount} more recipient{remainingCount !== 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 justify-center my-3">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isConfirmed || false}
                                onChange={(e) => dispatch(setIsConfirmed(e.target.checked))}
                                className="sr-only"
                            />
                            <div className={`
                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                    ${isConfirmed
                                    ? 'bg-linear-to-r from-pink-500 to-orange-400 border-transparent'
                                    : 'bg-white border-gray-300'
                                }
                                  `}>
                                {isConfirmed && (
                                    <svg
                                        className="w-3.5 h-3.5 text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-gray-700 font-inter text-sm font-medium leading-relaxed flex-1">
                                I have reviewed and confirmed all recipient and gift details are correct.
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="max-w-172 m-auto space-y-4">

                        <div className={`p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block w-full ${csvError === "" && isConfirmed
                            ? 'hover:bg-rose-50 hover:shadow-md cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                            }
                                              `}>
                            <button
                                disabled={csvError !== "" || !isConfirmed || isProcessingFile}
                                onClick={handleAddToCart}
                                className={`
    w-full h-14 flex items-center justify-center gap-3 px-5 rounded-full 
    bg-white text-pink-500 font-bold transition-all duration-200
    ${csvError === "" && isConfirmed && !isProcessingFile
                                        ? 'hover:shadow-xl cursor-pointer hover:opacity-95'
                                        : 'opacity-50 cursor-not-allowed'
                                    }
  `}
                            >
                                {isProcessingFile ? 'Processing file...' : 'Add to Cart'}
                                <ShoppingBasket className="w-5 h-5" />
                            </button>

                        </div>


                        {/* Proceed to Checkout Button */}
                        <button
                            disabled={csvError !== "" || !isConfirmed || isProcessingFile}
                            onClick={handleProceedToCheckout}
                            className={`w-full bg-linear-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600
                         text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 
                         ${csvError === "" && isConfirmed && !isProcessingFile
                                    ? 'hover:shadow-xl cursor-pointer hover:opacity-95'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            {isProcessingFile ? 'Processing file...' : 'Proceed to Checkout'}
                            <span className="text-xl"><svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                            </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkReviewStep;