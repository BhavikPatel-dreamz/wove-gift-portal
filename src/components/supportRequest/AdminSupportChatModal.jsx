'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2, CheckCheck, Check, User, Headset } from 'lucide-react'
import { getSupportRequestById, sendMessage, markMessagesAsRead, updateSupportStatus } from '@/lib/action/supportAction'

const AdminSupportChatModal = ({ request, onClose, onStatusChange }) => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentRequest, setCurrentRequest] = useState(request)
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
        markMessagesAsRead(request.id, 'ADMIN')
    }, [request.id])

    const fetchMessages = async () => {
        setLoading(true)
        const response = await getSupportRequestById(request.id)
        if (response.success) {
            setMessages(response.data.messages || [])
            setCurrentRequest(response.data)
        }
        setLoading(false)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!newMessage.trim() || sending) return

        setSending(true)

        const messageData = {
            supportRequestId: request.id,
            senderType: 'ADMIN',
            senderName: 'Support Team', // You can get this from admin session
            senderEmail: process.env.NEXT_SUPPORT_EMAIL, // Admin email
            message: newMessage.trim(),
            updatedRequest:request
        }

        const response = await sendMessage(messageData)

        if (response.success) {
            setMessages(prev => [...prev, response.data])
            setNewMessage('')
        }

        setSending(false)
    }

    const handleQuickStatusChange = async (newStatus) => {
        const response = await updateSupportStatus(request.id, newStatus)
        if (response.success) {
            setCurrentRequest(prev => ({ ...prev, status: newStatus }))
            onStatusChange(request.id, newStatus)
        }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-[90vh] flex">
                {/* Left Sidebar - Customer Info */}
                <div className="w-80 bg-gray-50 border-r flex flex-col rounded-l-lg">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b bg-white">
                        <h3 className="font-semibold text-gray-900">Customer Information</h3>
                    </div>

                    {/* Customer Details */}
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Customer Name</label>
                            <p className="mt-1 text-sm font-medium text-gray-900">{currentRequest.name}</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{currentRequest.email}</p>
                        </div>

                        {currentRequest.phone && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                                <p className="mt-1 text-sm text-gray-900">{currentRequest.phone}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Request ID</label>
                            <p className="mt-1 text-sm font-mono text-gray-900">{currentRequest.supportId}</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Order Number</label>
                            <p className="mt-1 text-sm text-gray-900">{currentRequest.orderNumber || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Reason</label>
                            <p className="mt-1 text-sm text-gray-900">{currentRequest.reason}</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {new Date(currentRequest.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Status</label>
                            <StatusBadge status={currentRequest.status} />
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 border-t">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Quick Actions</label>
                            <div className="space-y-2">
                                {currentRequest.status !== 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                                        className="w-full px-3 py-2 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors font-medium"
                                    >
                                        Mark In Progress
                                    </button>
                                )}
                                {currentRequest.status !== 'RESOLVED' && (
                                    <button
                                        onClick={() => handleQuickStatusChange('RESOLVED')}
                                        className="w-full px-3 py-2 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-medium"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                                {currentRequest.status !== 'CLOSED' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to close this request?')) {
                                                handleQuickStatusChange('CLOSED')
                                            }
                                        }}
                                        className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Close Request
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-tr-lg flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Support Chat</h2>
                            <p className="text-sm text-blue-100 mt-1">
                                Conversation with {currentRequest.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
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
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="bg-white rounded-full p-4 mb-4">
                                    <Send className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm">Start the conversation with the customer</p>
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
                                        <AdminMessageBubble
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
                    <div className="bg-white border-t px-6 py-4 text-black">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <div className="flex-1">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your response..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="2"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage(e)
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
        </div>
    )
}

const AdminMessageBubble = ({ message, formatTime }) => {
    const isAdmin = message.senderType === 'ADMIN'

    return (
        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                    {isAdmin ? (
                        <Headset className="w-4 h-4 text-white" />
                    ) : (
                        <User className="w-4 h-4 text-gray-600" />
                    )}
                </div>

                <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name */}
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                        {isAdmin ? 'You' : message.senderName}
                    </div>

                    {/* Message Bubble */}
                    <div
                        className={`rounded-2xl px-4 py-3 ${isAdmin
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

                        {/* Time and Status */}
                        <div className={`flex items-center gap-1 mt-2 text-xs ${isAdmin ? 'text-blue-100 justify-end' : 'text-gray-500'
                            }`}>
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
    )
}

const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: {
            label: "Pending",
            color: "bg-blue-50 text-blue-600 border border-blue-200",
            dotColor: "bg-blue-600",
        },
        OPEN: {
            label: "Open",
            color: "bg-blue-500/10 text-blue-500 border border-blue-200",
            dotColor: "bg-blue-500",
        },
        IN_PROGRESS: {
            label: "In Progress",
            color: "bg-orange-50 text-orange-600 border border-orange-200",
            dotColor: "bg-orange-600",
        },
        RESOLVED: {
            label: "Resolved",
            color: "bg-green-50 text-green-600 border border-green-200",
            dotColor: "bg-green-600",
        },
        CLOSED: {
            label: "Closed",
            color: "bg-gray-100 text-gray-600 border border-gray-200",
            dotColor: "bg-gray-600",
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${config.color}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}></span>
            {config.label}
        </div>
    );
};

export default AdminSupportChatModal