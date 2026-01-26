'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createColumnHelper } from '@tanstack/react-table'
import DynamicTable from '@/components/forms/DynamicTable'
import { MessageCircle, X as CloseIcon, Loader2 } from 'lucide-react'
import AdminSupportChatModal from './AdminSupportChatModal'
import { getSupportRequests, updateSupportStatus } from '../../lib/action/supportAction'
import { useSession } from '@/contexts/SessionContext';

const columnHelper = createColumnHelper()

const StatusBadge = ({ status, onStatusChange, requestId }) => {
    const [isChanging, setIsChanging] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    const statusConfig = useMemo(() => ({
        PENDING: {
            label: "Pending",
            color: "bg-blue-50 text-blue-600 border border-blue-200",
            dotColor: "bg-blue-600",
        },
        OPEN: {
            label: "Open",
            color: "bg-blue-500/10 text-blue-500 border border-blue-300",
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
            color: "bg-gray-100 text-gray-600 border border-gray-300",
            dotColor: "bg-gray-600",
        },
    }), []);

    const config = statusConfig[status] || statusConfig.PENDING;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleStatusChange = useCallback(async (newStatus) => {
        if (newStatus === status) {
            setShowDropdown(false)
            return
        }
        
        setIsChanging(true)
        setShowDropdown(false)
        await onStatusChange(requestId, newStatus)
        setIsChanging(false)
    }, [status, onStatusChange, requestId])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isChanging}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${config.color} hover:opacity-80 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label={`Change status from ${config.label}`}
            >
                {isChanging ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}></span>
                )}
                {config.label}
            </button>

            {showDropdown && !isChanging && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                    {Object.entries(statusConfig).map(([statusKey, statusData]) => (
                        <button
                            key={statusKey}
                            onClick={() => handleStatusChange(statusKey)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                statusKey === status ? 'bg-blue-50 font-semibold' : ''
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${statusData.dotColor}`}></span>
                                {statusData.label}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CloseRequestButton = ({ requestId, currentStatus, onClose }) => {
    const [isClosing, setIsClosing] = useState(false)

    const handleClose = useCallback(async () => {
        if (!confirm('Are you sure you want to close this support request? This action will mark the request as closed.')) {
            return;
        }

        setIsClosing(true)
        await onClose(requestId)
        setIsClosing(false)
    }, [requestId, onClose])

    if (currentStatus === 'CLOSED') {
        return null
    }

    return (
        <button
            onClick={handleClose}
            disabled={isClosing}
            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Close Request"
            aria-label="Close support request"
        >
            {isClosing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <CloseIcon className="w-5 h-5" />
            )}
        </button>
    )
}

export default function AdminSupportManagement({ initialData, pagination }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [data, setData] = useState(initialData)
    const [currentPage, setCurrentPage] = useState(pagination.currentPage)
    const [loading, setLoading] = useState(false)
    const [chatRequest, setChatRequest] = useState(null)
    const session = useSession();
    const user = session?.user;

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page)
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }, [searchParams, pathname, router])

    const handleSearch = useCallback((searchTerm) => {
        const params = new URLSearchParams(searchParams)
        if (searchTerm) {
            params.set('search', searchTerm)
        } else {
            params.delete('search')
        }
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, [searchParams, pathname, router])

    const handleFilter = useCallback((name, value) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(name, value)
        } else {
            params.delete(name)
        }
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, [searchParams, pathname, router])

    const handleOpenChat = useCallback((request) => {
        setChatRequest(request)
    }, [])

    const handleStatusChange = useCallback(async (requestId, newStatus) => {
        try {
            const response = await updateSupportStatus(requestId, newStatus)
            if (response.success) {
                setData(prev => prev.map(req =>
                    req.id === requestId ? { ...req, status: newStatus } : req
                ))
            } else {
                alert('Failed to update status. Please try again.')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('An error occurred while updating the status.')
        }
    }, [])

    const handleCloseRequest = useCallback(async (requestId) => {
        try {
            const response = await updateSupportStatus(requestId, 'CLOSED')
            if (response.success) {
                setData(prev => prev.map(req =>
                    req.id === requestId ? { ...req, status: 'CLOSED' } : req
                ))
            } else {
                alert('Failed to close request. Please try again.')
            }
        } catch (error) {
            console.error('Error closing request:', error)
            alert('An error occurred while closing the request.')
        }
    }, [])

    const columns = useMemo(() => [
        columnHelper.accessor('supportId', {
            header: () => <span className="font-bold text-gray-700">Request ID</span>,
            cell: (info) => <div className="font-semibold text-gray-900">{info.getValue()}</div>,
        }),
        columnHelper.accessor('createdAt', {
            header: () => <span className="font-bold text-gray-700">Date</span>,
            cell: (info) => (
                <div className="text-gray-900 text-sm">
                    {new Date(info.getValue()).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    })}
                </div>
            ),
        }),
        columnHelper.accessor('name', {
            header: () => <span className="font-bold text-gray-700">Customer</span>,
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div>
                        <div className="font-medium text-gray-900">{info.getValue()}</div>
                        <div className="text-sm text-gray-500">{row.email}</div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('orderNumber', {
            header: () => <span className="font-bold text-gray-700">Order #</span>,
            cell: (info) => {
                const value = info.getValue();
                return value ? (
                    <div className="text-gray-900 font-medium">{value}</div>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            },
        }),
        columnHelper.accessor('voucherNumber', {
            header: () => <span className="font-bold text-gray-700">Voucher #</span>,
            cell: (info) => {
                const row = info.row.original;
                const voucherCode = row.order?.voucherCodes?.[0]?.code;
                return voucherCode ? (
                    <div className="text-gray-900 font-medium">{voucherCode}</div>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            },
        }),
        columnHelper.accessor('reason', {
            header: () => <span className="font-bold text-gray-700">Reason</span>,
            cell: (info) => (
                <div className="text-gray-900 max-w-xs truncate" title={info.getValue()}>
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: () => <span className="font-bold text-gray-700">Status</span>,
            cell: (info) => (
                <StatusBadge
                    status={info.getValue()}
                    requestId={info.row.original.id}
                    onStatusChange={handleStatusChange}
                />
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <span className="font-bold text-gray-700">Actions</span>,
            cell: ({ row }) => {
                const request = row.original;
                
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleOpenChat(request)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                            title="Open Chat"
                            aria-label="Open support chat"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                        </button>
                        <CloseRequestButton
                            requestId={request.id}
                            currentStatus={request.status}
                            onClose={handleCloseRequest}
                        />
                    </div>
                );
            },
        }),
    ], [handleStatusChange, handleCloseRequest, handleOpenChat]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const page = searchParams.get('page') || 1
                const search = searchParams.get('search') || ''
                const status = searchParams.get('status') || ''
                const response = await getSupportRequests({
                    page: parseInt(page),
                    search,
                    status,
                    user: user,
                    limit: 10,
                })
                if (response.success) {
                    setData(response.data)
                }
            } catch (error) {
                console.error('Error fetching support requests:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [searchParams])

    const filterOptions = useMemo(() => [
        {
            name: 'status',
            placeholder: 'Status: All',
            options: [
                { value: '', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
            ],
        },
    ], []);

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-8xl mx-auto">
                <DynamicTable
                    title="Support Requests Management"
                    subtitle="Manage and respond to customer support requests"
                    data={data}
                    columns={columns}
                    loading={loading}
                    pagination={{ ...pagination, currentPage }}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    searchPlaceholder="Search by ID, customer, or order..."
                    filters={filterOptions}
                />
            </div>

            {/* Chat Modal */}
            {chatRequest && (
                <AdminSupportChatModal
                    request={chatRequest}
                    onClose={() => setChatRequest(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    )
}