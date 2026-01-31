import { useState, useMemo } from 'react';
import { X, Mail, Phone, User, Send, Loader2, Edit, Users, AlertCircle, Search, CheckCircle2 } from 'lucide-react';
import { modifyRecipientAndResend } from '../../lib/action/orderAction';

const ModifyRecipientModal = ({ orderDetails, onClose, onSuccess }) => {
    // Check if this is a bulk order
    const isBulkOrder = orderDetails.bulkRecipients && orderDetails.bulkRecipients.length > 0;
    
    // Initialize form data based on order type
    const [formData, setFormData] = useState(() => {
        if (isBulkOrder) {
            // For bulk orders, create an array of recipient data
            return orderDetails.bulkRecipients.map(recipient => ({
                id: recipient.id,
                voucherCodeId: recipient.voucherCodeId,
                name: recipient.recipientName || '',
                email: recipient.recipientEmail || '',
                phone: recipient.recipientPhone || '',
                originalName: recipient.recipientName || '',
                originalEmail: recipient.recipientEmail || '',
                originalPhone: recipient.recipientPhone || '',
            }));
        } else {
            // For single orders
            return [{
                id: orderDetails.receiverDetailId,
                name: orderDetails.receiverDetail?.name || '',
                email: orderDetails.receiverDetail?.email || '',
                phone: orderDetails.receiverDetail?.phone || '',
            }];
        }
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(isBulkOrder ? null : 0);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRecipient, setExpandedRecipient] = useState(isBulkOrder ? null : 0);

    // Filter recipients based on search term
    const filteredRecipients = useMemo(() => {
        if (!searchTerm.trim() || !isBulkOrder) {
            return formData.map((recipient, index) => ({ ...recipient, originalIndex: index }));
        }

        const search = searchTerm.toLowerCase();
        return formData
            .map((recipient, index) => ({ ...recipient, originalIndex: index }))
            .filter(recipient => 
                recipient.name.toLowerCase().includes(search) ||
                recipient.email.toLowerCase().includes(search) ||
                (recipient.phone && recipient.phone.includes(search)) ||
                (orderDetails.voucherCodes?.[recipient.originalIndex]?.code || '').toLowerCase().includes(search)
            );
    }, [formData, searchTerm, isBulkOrder, orderDetails.voucherCodes]);

    // Check if recipient has changes
    const hasChanges = (recipient) => {
        if (!isBulkOrder) return true;
        return recipient.name !== recipient.originalName ||
               recipient.email !== recipient.originalEmail ||
               recipient.phone !== recipient.originalPhone;
    };

    const validateForm = () => {
        if (selectedRecipientIndex === null && isBulkOrder) return false;
        
        const newErrors = {};
        const recipient = formData[selectedRecipientIndex];
        const index = selectedRecipientIndex;

        if (!recipient.name.trim()) {
            newErrors[`${index}-name`] = 'Name is required';
        }

        if (orderDetails.deliveryMethod === 'email' || orderDetails.deliveryMethod === 'multiple') {
            if (!recipient.email.trim()) {
                newErrors[`${index}-email`] = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
                newErrors[`${index}-email`] = 'Invalid email format';
            }
        }

        if (orderDetails.deliveryMethod === 'whatsapp' || orderDetails.deliveryMethod === 'multiple') {
            if (!recipient.phone.trim()) {
                newErrors[`${index}-phone`] = 'Phone is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (selectedRecipientIndex === null && isBulkOrder) {
            alert('Please select a recipient to update');
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        try {
            const recipientToUpdate = formData[selectedRecipientIndex];

            const result = await modifyRecipientAndResend({
                orderNumber: orderDetails.orderNumber,
                receiverDetailId: isBulkOrder ? null : orderDetails.receiverDetailId,
                recipientData: recipientToUpdate,
                deliveryMethod: orderDetails.deliveryMethod,
                isBulk: isBulkOrder,
            });

            if (result.success) {
                onSuccess(result.message);
                onClose();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error modifying recipient:', error);
            alert('Failed to modify recipient details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
        
        if (errors[`${index}-${field}`]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[`${index}-${field}`];
                return updated;
            });
        }
    };

    const handleSelectRecipient = (index) => {
        setSelectedRecipientIndex(index);
        setExpandedRecipient(index);
        // Clear errors when switching recipients
        setErrors({});
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Edit className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Modify Recipient Details</h2>
                            <p className="text-sm text-blue-100 mt-1">
                                {isBulkOrder 
                                    ? `${formData.length} Recipients • Select one to update`
                                    : 'Update recipient information and resend voucher'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Recipient List (only for bulk orders) */}
                    {isBulkOrder && (
                        <div className="w-80 border-r bg-gray-50 flex flex-col">
                            {/* Search Bar */}
                            <div className="p-4 border-b bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search recipients..."
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {filteredRecipients.length} of {formData.length} recipients
                                    {searchTerm && ` matching "${searchTerm}"`}
                                </p>
                            </div>

                            {/* Recipients List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredRecipients.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">No recipients found</p>
                                        <p className="text-xs mt-1">Try a different search term</p>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredRecipients.map((recipient) => {
                                            const index = recipient.originalIndex;
                                            const isSelected = selectedRecipientIndex === index;
                                            const voucherCode = orderDetails.voucherCodes?.[index]?.code;
                                            const modified = hasChanges(recipient);

                                            return (
                                                <button
                                                    key={recipient.id}
                                                    onClick={() => handleSelectRecipient(index)}
                                                    className={`w-full text-left p-3 rounded-lg transition-all ${
                                                        isSelected
                                                            ? 'bg-blue-500 text-white shadow-md'
                                                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-semibold ${
                                                                    isSelected ? 'text-blue-100' : 'text-gray-500'
                                                                }`}>
                                                                    #{index + 1}
                                                                </span>
                                                                {modified && !isSelected && (
                                                                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                                                        Modified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={`font-medium text-sm truncate ${
                                                                isSelected ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                                {recipient.name}
                                                            </p>
                                                            <p className={`text-xs truncate mt-0.5 ${
                                                                isSelected ? 'text-blue-100' : 'text-gray-500'
                                                            }`}>
                                                                {recipient.email}
                                                            </p>
                                                            {voucherCode && (
                                                                <p className={`text-xs font-mono mt-1 ${
                                                                    isSelected ? 'text-blue-100' : 'text-gray-400'
                                                                }`}>
                                                                    {voucherCode}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Info Footer */}
                            <div className="p-3 border-t bg-blue-50">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800">
                                        Select a recipient to modify their details and resend their voucher
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Panel - Edit Form */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedRecipientIndex !== null ? (
                            <div className="max-w-2xl mx-auto space-y-6">

                                {/* Edit Form */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-5">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-gray-900">
                                            {isBulkOrder ? `Recipient #${selectedRecipientIndex + 1} Details` : 'Recipient Details'}
                                        </h3>
                                    </div>

                                    <RecipientForm
                                        recipient={formData[selectedRecipientIndex]}
                                        index={selectedRecipientIndex}
                                        onChange={handleChange}
                                        errors={errors}
                                        deliveryMethod={orderDetails.deliveryMethod}
                                        voucherCode={orderDetails.voucherCodes?.[selectedRecipientIndex]?.code}
                                    />
                                </div>

                                {/* Warning Message */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-900">
                                            <p className="font-semibold mb-1">Important Notice</p>
                                            <p>
                                                The voucher will be <strong>resent immediately</strong> to the updated recipient details.
                                                {isBulkOrder && ' Only this recipient will receive the voucher.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-500">Select a Recipient</p>
                                    <p className="text-sm mt-2">
                                        Choose a recipient from the list to modify their details
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 border-t px-6 py-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || selectedRecipientIndex === null}
                                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating & Resending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Update & Resend Voucher
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Recipient Form Component
const RecipientForm = ({ 
    recipient, 
    index, 
    onChange, 
    errors, 
    deliveryMethod,
    voucherCode 
}) => {
    return (
        <div className="space-y-4">
            {/* Voucher Code Display */}
            {voucherCode && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                        Voucher Code
                    </label>
                    <p className="font-mono text-sm font-semibold text-gray-900">{voucherCode}</p>
                </div>
            )}

            {/* Name Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => onChange(index, 'name', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors[`${index}-name`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter recipient name"
                />
                {errors[`${index}-name`] && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors[`${index}-name`]}
                    </p>
                )}
            </div>

            {/* Email Field */}
            {(deliveryMethod === 'email' || deliveryMethod === 'multiple') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) => onChange(index, 'email', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors[`${index}-email`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="recipient@example.com"
                    />
                    {errors[`${index}-email`] && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`${index}-email`]}
                        </p>
                    )}
                </div>
            )}

            {/* Phone Field */}
            {(deliveryMethod === 'whatsapp' || deliveryMethod === 'multiple') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={recipient.phone}
                        onChange={(e) => onChange(index, 'phone', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors[`${index}-phone`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="+1234567890"
                    />
                    {errors[`${index}-phone`] && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`${index}-phone`]}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModifyRecipientModal;