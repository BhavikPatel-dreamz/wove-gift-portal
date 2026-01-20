// components/support/SupportChatModal.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2, CheckCheck, Check, MessageCircle } from 'lucide-react'
import { getSupportRequestById, markMessagesAsRead } from '@/lib/action/supportAction'

const SupportChatModal = ({ request, onClose }) => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        fetchMessages()
        // Mark messages as read when opening chat
        markMessagesAsRead(request.id, 'CUSTOMER')
    }, [request.id])

    const fetchMessages = async () => {
        setLoading(true)
        const response = await getSupportRequestById(request.id)
        if (response.success) {
            setMessages(response.data.messages || [])
        }
        setLoading(false)
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (date) => {
        const messageDate = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        }
    }

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = {}
        messages.forEach(msg => {
            const dateKey = new Date(msg.createdAt).toDateString()
            if (!groups[dateKey]) {
                groups[dateKey] = []
            }
            groups[dateKey].push(msg)
        })
        return groups
    }

    const messageGroups = groupMessagesByDate(messages)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Support Chat Preview</h2>
                        <p className="text-sm text-blue-100 mt-1">Request ID: {request.supportId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Request Info Bar */}
                <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                            <span className="font-medium">Order:</span> {request.orderNumber || 'N/A'}
                        </span>
                        <span className="text-gray-600">
                            <span className="font-medium">Reason:</span> {request.reason}
                        </span>
                    </div>
                    <StatusBadge status={request.status} />
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
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="bg-white rounded-full p-4 mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm">Waiting for support team to respond</p>
                        </div>
                    ) : (
                        Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
                            <div key={dateKey}>
                                {/* Date Separator */}
                                <div className="flex items-center justify-center my-4">
                                    <div className="bg-white px-4 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                                        {formatDate(dateMessages[0].createdAt)}
                                    </div>
                                </div>

                                {/* Messages */}
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

                {/* Info Footer - Read Only Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                                Chat Preview Mode
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                You can view the conversation history. Our support team will respond to your request via email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const MessageBubble = ({ message, formatTime }) => {
    const isCustomer = message.senderType === 'CUSTOMER'

    return (
        <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isCustomer ? 'order-2' : 'order-1'}`}>
                {/* Sender Name */}
                {!isCustomer && (
                    <div className="text-xs text-gray-500 mb-1 ml-3 font-medium">
                        Support Team
                    </div>
                )}
                
                {/* Message Bubble */}
                <div
                    className={`rounded-2xl px-4 py-3 ${
                        isCustomer
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    
                    {/* Time and Status */}
                    <div className={`flex items-center gap-1 mt-2 text-xs ${
                        isCustomer ? 'text-blue-100 justify-end' : 'text-gray-500'
                    }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {isCustomer && (
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
    )
}

const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: {
            label: "Pending",
            color: "bg-blue-50 text-blue-600",
            dotColor: "bg-blue-600",
        },
        OPEN: {
            label: "Open",
            color: "bg-blue-500/10 text-blue-500",
            dotColor: "bg-blue-500",
        },
        IN_PROGRESS: {
            label: "In Progress",
            color: "bg-orange-50 text-orange-600",
            dotColor: "bg-orange-600",
        },
        RESOLVED: {
            label: "Resolved",
            color: "bg-green-50 text-green-600",
            dotColor: "bg-green-600",
        },
        CLOSED: {
            label: "Closed",
            color: "bg-gray-100 text-gray-600",
            dotColor: "bg-gray-600",
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium ${config.color}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}></span>
            {config.label}
        </div>
    );
};

export default SupportChatModal