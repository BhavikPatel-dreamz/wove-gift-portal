'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createColumnHelper } from '@tanstack/react-table'
import DynamicTable from '@/components/forms/DynamicTable'
import { getSupportRequests } from '@/lib/action/supportAction'
import Header from '../../../components/client/home/Header'
import Footer from '../../../components/client/home/Footer'
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import { MessageCircle } from 'lucide-react'
import SupportChatModal from './SupportChatModal'
import { Plus } from 'lucide-react'
import { Eye } from 'lucide-react'
import { useSession } from '@/contexts/SessionContext';

const columnHelper = createColumnHelper()

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

export default function TrackRequestClient({ initialData, pagination }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [data, setData] = useState(initialData)
    const [currentPage, setCurrentPage] = useState(pagination ? pagination.currentPage : 1)
    const [loading, setLoading] = useState(false)
    const [chatRequest, setChatRequest] = useState(null)
    const session = useSession();
    const user = session?.user;

    const handlePageChange = (page) => {
        setCurrentPage(page)
        const params = new URLSearchParams(searchParams)
        params.set('page', page)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearch = (searchTerm) => {
        const params = new URLSearchParams(searchParams)
        params.set('search', searchTerm)
        params.set('page', 1)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleFilter = (name, value) => {
        const params = new URLSearchParams(searchParams)
        params.set(name, value)
        params.set('page', 1)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleOpenChat = (request) => {
        setChatRequest(request)
    }

    const columns = [
        columnHelper.accessor('supportId', {
            header: () => <span className="font-bold text-gray-700">Request Number</span>,
            cell: (info) => <div className="font-semibold text-gray-900">{info.getValue()}</div>,
        }),
        columnHelper.accessor('createdAt', {
            header: () => <span className="font-bold text-gray-700">Request Date</span>,
            cell: (info) => (
                <div className="text-gray-900">
                    {new Date(info.getValue()).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    })}
                </div>
            ),
        }),
        columnHelper.accessor('orderNumber', {
            header: () => <span className="font-bold text-gray-700">Order Number</span>,
            cell: (info) => {
                const value = info.getValue();
                if (!value) return <span className="text-gray-400">N/A</span>;
                return <div className="text-gray-900 whitespace-pre-line text-sm">{value}</div>;
            },
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
        columnHelper.accessor('reason', {
            header: () => <span className="font-bold text-gray-700">Request Reason</span>,
            cell: (info) => <div className="text-gray-900">{info.getValue()}</div>,
        }),
        columnHelper.accessor('status', {
            header: () => <span className="font-bold text-gray-700">Status</span>,
            cell: (info) => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <span className="font-bold text-gray-700">Actions</span>,
            cell: ({ row }) => {
                const request = row.original;
                const messageCount = request._count?.messages || 0;

                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleOpenChat(request)}
                        >
                           <Eye className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        }),
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const page = searchParams.get('page') || 1
            const search = searchParams.get('search') || ''
            const status = searchParams.get('status') || ''
            const response = await getSupportRequests({
                page: parseInt(page),
                search,
                status,
                user: user,
            })
            if (response.success) {
                setData(response.data)
            }
            setLoading(false)
        }
        fetchData()
    }, [searchParams])

    return (
        <Provider store={store}>
            <div className="min-h-screen py-[100px] sm:py-30  bg-white">
                <Header />

                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-end mb-3">
                        <button onClick={() => router.push('/support')} className="group relative px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Create New Request
                        </button>
                    </div>
                    <DynamicTable
                        title="Track Support Requests"
                        subtitle="View the status of your support requests"
                        data={data}
                        columns={columns}
                        loading={loading}
                        pagination={{ ...pagination, currentPage }}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        onFilter={handleFilter}
                        filters={[
                            {
                                name: 'status',
                                placeholder: 'Filter by status',
                                options: [
                                    { value: '', label: 'All' },
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'IN_PROGRESS', label: 'In Progress' },
                                    { value: 'RESOLVED', label: 'Resolved' },
                                    { value: 'CLOSED', label: 'Closed' },
                                ],
                            },
                        ]}
                    />
                    <div className='mt-10'>
                        <Footer />
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            {chatRequest && (
                <SupportChatModal
                    request={chatRequest}
                    onClose={() => setChatRequest(null)}
                />
            )}
        </Provider>
    )
}