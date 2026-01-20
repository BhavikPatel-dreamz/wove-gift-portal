import { getSupportRequests } from '@/lib/action/supportAction'
import AdminSupportManagement from '../../../components/supportRequest/AdminSupportManagement'

export default async function AdminSupportPage({ searchParams }) {
    // Await searchParams before accessing its properties
    const params = await searchParams
    const page = params?.page || 1
    const search = params?.search || ''
    const status = params?.status || ''

    const response = await getSupportRequests({
        page: parseInt(page),
        search,
        status,
        limit: 10,
    })

    if (!response.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Failed to load support requests</p>
            </div>
        )
    }

    return (
        <AdminSupportManagement
            initialData={response.data}
            pagination={response.pagination}
        />
    )
}