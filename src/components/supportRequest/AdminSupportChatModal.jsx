'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Send, Loader2, CheckCheck, Check, User, Headset, Package, CreditCard, Mail, Phone, Calendar, Hash, ShoppingBag, Gift, Truck, AlertCircle } from 'lucide-react'
import { getSupportRequestById, sendMessage, markMessagesAsRead, updateSupportStatus, cancelOrder } from '@/lib/action/supportAction'
import { getOrderById } from '@/lib/action/orderAction'
import ModifyRecipientModal from './ModifyRecipientModal';

const AdminSupportChatModal = ({ request, onClose, onStatusChange }) => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingOrder, setLoadingOrder] = useState(false)
    const [sending, setSending] = useState(false)
    const [currentRequest, setCurrentRequest] = useState(request)
    const [orderDetails, setOrderDetails] = useState(null)
    const [showModifyModal, setShowModifyModal] = useState(false);

    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    console.log("orderDetails", orderDetails)

    // Add this handler function
    const handleModifySuccess = useCallback((message) => {
        alert(message);
        // Refresh order details
        if (request.orderNumber) {
            fetchOrderDetails(request.orderNumber);
        }
    }, [request.orderNumber]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Calculate total redeemed amount
    const totalRedeemed = useMemo(() => {
        if (!orderDetails?.voucherCodes) return 0;
        return orderDetails.voucherCodes.reduce((acc, vc) => acc + (vc.totalRedeemed || 0), 0);
    }, [orderDetails]);

    // Calculate total remaining amount
    const totalRemaining = useMemo(() => {
        if (!orderDetails?.voucherCodes) return 0;
        return orderDetails.voucherCodes.reduce((acc, vc) => acc + (vc.remainingAmount || 0), 0);
    }, [orderDetails]);

    // Check if order can be cancelled
    const canCancelOrder = useMemo(() => {
        if (!orderDetails?.voucherCodes) return true;
        return !orderDetails.voucherCodes.some(vc => vc.redemptionCount > 0);
    }, [orderDetails]);

    useEffect(() => {
        const initializeModal = async () => {
            setLoading(true);
            try {
                const promises = [
                    fetchMessages(),
                    markMessagesAsRead(request.id, 'ADMIN')
                ];

                if (request.orderNumber) {
                    promises.push(fetchOrderDetails(request.orderNumber));
                }

                await Promise.all(promises);
            } catch (error) {
                console.error('Error initializing modal:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeModal();
    }, [request.id, request.orderNumber]);

    const fetchMessages = async () => {
        try {
            const response = await getSupportRequestById(request.id);
            if (response.success) {
                setMessages(response.data.messages || []);
                setCurrentRequest(response.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchOrderDetails = async (orderNumber) => {
        setLoadingOrder(true);
        try {
            const response = await getOrderById(orderNumber);
            if (response.success) {
                setOrderDetails(response.data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoadingOrder(false);
        }
    };

    const handleCancelOrder = useCallback(async () => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await cancelOrder(request.orderNumber);
            if (response.success) {
                alert('Order cancelled successfully.');
                await fetchOrderDetails(request.orderNumber);
            } else {
                alert(`Failed to cancel order: ${response.message}`);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('An error occurred while cancelling the order.');
        }
    }, [request.orderNumber]);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);

        try {
            const messageData = {
                supportRequestId: request.id,
                senderType: 'ADMIN',
                senderName: 'Support Team',
                senderEmail: process.env.NEXT_SUPPORT_EMAIL,
                message: newMessage.trim(),
                updatedRequest: request
            };

            const response = await sendMessage(messageData);

            if (response.success) {
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');
            } else {
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred while sending the message.');
        } finally {
            setSending(false);
        }
    }, [newMessage, sending, request]);

    const handleQuickStatusChange = useCallback(async (newStatus) => {
        try {
            const response = await updateSupportStatus(request.id, newStatus);
            if (response.success) {
                setCurrentRequest(prev => ({ ...prev, status: newStatus }));
                onStatusChange(request.id, newStatus);
            } else {
                alert('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('An error occurred while updating the status.');
        }
    }, [request.id, onStatusChange]);

    const formatTime = useCallback((date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const formatDate = useCallback((date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }, []);

    const formatCurrency = useCallback((amount, currency = 'ZAR') => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }, []);

    // Group messages by date
    const messageGroups = useMemo(() => {
        const groups = {};
        messages.forEach(msg => {
            const dateKey = new Date(msg.createdAt).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        return groups;
    }, [messages]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex">
                {/* Left Sidebar - Customer & Order Info */}
                <div className="w-96 bg-gray-50 border-r flex flex-col rounded-l-lg overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b bg-white">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer & Order Details
                        </h3>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Customer Information Section */}
                        <div className="p-4 bg-white border-b">
                            <div className="space-y-3">
                                <InfoField
                                    icon={<User className="w-3.5 h-3.5" />}
                                    label="Customer Name"
                                    value={currentRequest.name}
                                />
                                <InfoField
                                    icon={<Mail className="w-3.5 h-3.5" />}
                                    label="Email"
                                    value={currentRequest.email}
                                />
                                {currentRequest.phone && (
                                    <InfoField
                                        icon={<Phone className="w-3.5 h-3.5" />}
                                        label="Phone"
                                        value={currentRequest.phone}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Support Request Section */}
                        <div className="p-4 bg-white border-b">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                <Headset className="w-3 h-3" />
                                Support Request
                            </h4>
                            <div className="space-y-3">
                                <InfoField
                                    icon={<Hash className="w-3.5 h-3.5" />}
                                    label="Request ID"
                                    value={currentRequest.supportId}
                                    mono
                                />
                                <InfoField
                                    icon={<AlertCircle className="w-3.5 h-3.5" />}
                                    label="Reason"
                                    value={currentRequest.reason}
                                />
                                <InfoField
                                    icon={<Calendar className="w-3.5 h-3.5" />}
                                    label="Created"
                                    value={new Date(currentRequest.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                />
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Status</label>
                                    <StatusBadge status={currentRequest.status} />
                                </div>
                            </div>
                        </div>

                        {/* Order Details Section */}
                        {loadingOrder ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                        ) : orderDetails ? (
                            <>
                                {/* Order Info */}
                                <div className="p-4 bg-white border-b">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        Order Information
                                    </h4>
                                    <div className="space-y-3">
                                        <InfoField
                                            icon={<Hash className="w-3.5 h-3.5" />}
                                            label="Order Number"
                                            value={orderDetails.orderNumber}
                                            mono
                                        />
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Order Status</label>
                                            <OrderStatusBadge status={orderDetails.redemptionStatus} />
                                        </div>
                                        <InfoField
                                            icon={<Gift className="w-3.5 h-3.5" />}
                                            label="Occasion"
                                            value={orderDetails.occasion?.name || 'N/A'}
                                        />
                                        <InfoField
                                            icon={<ShoppingBag className="w-3.5 h-3.5" />}
                                            label="Brand"
                                            value={orderDetails.brand?.brandName || 'N/A'}
                                        />
                                        <InfoField
                                            icon={<Calendar className="w-3.5 h-3.5" />}
                                            label="Order Date"
                                            value={new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        />
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="p-4 bg-white border-b">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" />
                                        Payment Details
                                    </h4>
                                    <div className="space-y-3">

                                        <InfoField
                                            label="Total Amount"
                                            value={formatCurrency(orderDetails.totalAmount, orderDetails.currency)}
                                            highlight
                                        />
                                        <InfoField
                                            label="Payment Status"
                                            value={<PaymentStatusBadge status={orderDetails.paymentStatus} />}
                                        />
                                        {orderDetails.paidAt && (
                                            <InfoField
                                                label="Paid At"
                                                value={new Date(orderDetails.paidAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Voucher Info */}
                                {orderDetails.voucherCodes && orderDetails.voucherCodes.length > 0 && (
                                    <div className="p-4 bg-white border-b">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                            <Gift className="w-3 h-3" />
                                            Voucher Details
                                        </h4>
                                        <div className="space-y-3">
                                            <InfoField
                                                label="Voucher Code"
                                                value={orderDetails.voucherCodes[0].code}
                                                mono
                                            />
                                            <InfoField
                                                label="Voucher Status"
                                                value={<VoucherStatusBadge status={orderDetails.voucherCodes[0].status} />}
                                            />
                                            <InfoField
                                                label="Total Redeemed"
                                                value={formatCurrency(totalRedeemed, orderDetails.currency)}
                                            />
                                            <InfoField
                                                label="Remaining Amount"
                                                value={formatCurrency(totalRemaining, orderDetails.currency)}
                                                highlight
                                            />
                                            {/* <InfoField 
                                                label="Redemption Count" 
                                                value={orderDetails.voucherCodes[0].redemptionCount || 0} 
                                            /> */}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Info */}
                                {orderDetails.deliveryLogs && orderDetails.deliveryLogs.length > 0 && (
                                    <div className="p-4 bg-white border-b">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                            <Truck className="w-3 h-3" />
                                            Delivery Information
                                        </h4>
                                        <div className="space-y-3">
                                            <InfoField
                                                label="Delivery Method"
                                                value={orderDetails.deliveryMethod?.toUpperCase() || 'EMAIL'}
                                            />
                                            <InfoField
                                                label="Recipient"
                                                value={orderDetails.receiverDetail?.email || orderDetails.deliveryLogs[0].recipient}
                                            />
                                            {orderDetails.deliveryLogs[0].deliveredAt && (
                                                <InfoField
                                                    label="Delivered At"
                                                    value={new Date(orderDetails.deliveryLogs[0].deliveredAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : request.orderNumber ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                Unable to load order details
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                No order associated
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="p-4 bg-gray-50">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-3 block">Quick Actions</label>
                            <div className="space-y-2">
                                {/* Modify Recipient Details Button */}
                                {orderDetails && request.orderNumber && (
                                    <ActionButton
                                        onClick={() => setShowModifyModal(true)}
                                        color="blue"
                                    >
                                        Modify Recipient Details
                                    </ActionButton>
                                )}

                              
                                {currentRequest.status !== 'RESOLVED' && (
                                    <ActionButton onClick={() => handleQuickStatusChange('RESOLVED')} color="green">
                                        Mark Resolved
                                    </ActionButton>
                                )}
                                {currentRequest.status !== 'CLOSED' && (
                                    <ActionButton
                                        onClick={() => {
                                            if (confirm('Are you sure you want to close this request?')) {
                                                handleQuickStatusChange('CLOSED');
                                            }
                                        }}
                                        color="gray"
                                    >
                                        Close Request
                                    </ActionButton>
                                )}
                                {orderDetails && request.orderNumber && (
                                    <ActionButton
                                        onClick={handleCancelOrder}
                                        disabled={!canCancelOrder}
                                        color="red"
                                    >
                                        {canCancelOrder ? 'Cancel Order' : 'Cannot Cancel (Redeemed)'}
                                    </ActionButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-tr-lg flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Support Chat</h2>
                            <p className="text-sm text-blue-100 mt-1">
                                Conversation with {currentRequest.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : messages.length === 0 ? (
                            <EmptyState />
                        ) : (
                            Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
                                <div key={dateKey}>
                                    <div className="flex items-center justify-center my-4">
                                        <div className="bg-white px-4 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                                            {formatDate(dateMessages[0].createdAt)}
                                        </div>
                                    </div>
                                    {dateMessages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            formatTime={formatTime}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t px-6 py-4">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <div className="flex-1">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your response..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                                    rows="2"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send
                                    </>
                                )}
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                </div>
            </div>

            {showModifyModal && orderDetails && (
                <ModifyRecipientModal
                    orderDetails={orderDetails}
                    onClose={() => setShowModifyModal(false)}
                    onSuccess={handleModifySuccess}
                />
            )}
        </div>
    );
};

// Sub-components
const InfoField = ({ icon, label, value, mono = false, highlight = false }) => (
    <div>
        <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
            {icon}
            {label}
        </label>
        <div className={`mt-1 text-sm ${mono ? 'font-mono' : 'font-medium'} ${highlight ? 'text-blue-600 text-base' : 'text-gray-900'}`}>
            {value}
        </div>
    </div>
);

const ActionButton = ({ onClick, disabled = false, color, children }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200',
        orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200',
        green: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
        gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300',
        red: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full px-3 py-2 text-sm rounded-md transition-colors font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 ${colorClasses[color]}`}
        >
            {children}
        </button>
    );
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="bg-white rounded-full p-4 mb-4">
            <Send className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm">Start the conversation with the customer</p>
    </div>
);

const MessageBubble = ({ message, formatTime }) => {
    const isAdmin = message.senderType === 'ADMIN';

    return (
        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    {isAdmin ? (
                        <Headset className="w-4 h-4 text-white" />
                    ) : (
                        <User className="w-4 h-4 text-gray-600" />
                    )}
                </div>

                <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                        {isAdmin ? 'You' : message.senderName}
                    </div>

                    <div
                        className={`rounded-2xl px-4 py-3 ${isAdmin
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.message}</p>

                        <div className={`flex items-center gap-1 mt-2 text-xs ${isAdmin ? 'text-blue-100 justify-end' : 'text-gray-500'}`}>
                            <span>{formatTime(message.createdAt)}</span>
                            {isAdmin && (
                                message.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: { label: "Pending", color: "bg-blue-50 text-blue-600 border border-blue-200", dotColor: "bg-blue-600" },
        OPEN: { label: "Open", color: "bg-blue-500/10 text-blue-500 border border-blue-200", dotColor: "bg-blue-500" },
        IN_PROGRESS: { label: "In Progress", color: "bg-orange-50 text-orange-600 border border-orange-200", dotColor: "bg-orange-600" },
        RESOLVED: { label: "Resolved", color: "bg-green-50 text-green-600 border border-green-200", dotColor: "bg-green-600" },
        CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600 border border-gray-200", dotColor: "bg-gray-600" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${config.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}></span>
            {config.label}
        </div>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const config = {
        COMPLETED: { label: "Completed", color: "bg-green-50 text-green-600 border border-green-200" },
        PENDING: { label: "Pending", color: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
        FAILED: { label: "Failed", color: "bg-red-50 text-red-600 border border-red-200" },
    };

    const statusConfig = config[status] || config.PENDING;

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
        </span>
    );
};

const VoucherStatusBadge = ({ status }) => {
    const config = {
        Active: { label: "Active", color: "bg-green-50 text-green-600 border border-green-200", dotColor: "bg-green-600" },
        Redeemed: { label: "Redeemed", color: "bg-blue-50 text-blue-600 border border-blue-200", dotColor: "bg-blue-600" },
        Expired: { label: "Expired", color: "bg-red-50 text-red-600 border border-red-200", dotColor: "bg-red-600" },
        Cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border border-gray-300", dotColor: "bg-gray-600" },
        Inactive: { label: "Inactive", color: "bg-gray-50 text-gray-500 border border-gray-200", dotColor: "bg-gray-500" },
    };

    const statusConfig = config[status] || config.Active;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${statusConfig.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}></span>
            {statusConfig.label}
        </div>
    );
};

const OrderStatusBadge = ({ status }) => {
    const config = {
        Issued: { label: "Issued", color: "bg-blue-50 text-blue-600 border border-blue-200", dotColor: "bg-blue-600" },
        PartiallyRedeemed: { label: "Partially Redeemed", color: "bg-yellow-50 text-yellow-600 border border-yellow-200", dotColor: "bg-yellow-600" },
        Redeemed: { label: "Redeemed", color: "bg-green-50 text-green-600 border border-green-200", dotColor: "bg-green-600" },
        Expired: { label: "Expired", color: "bg-red-50 text-red-600 border border-red-200", dotColor: "bg-red-600" },
        Cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border border-gray-300", dotColor: "bg-gray-600" },
    };

    const statusConfig = config[status] || config.Issued;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${statusConfig.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}></span>
            {statusConfig.label}
        </div>
    );
};


export default AdminSupportChatModal;