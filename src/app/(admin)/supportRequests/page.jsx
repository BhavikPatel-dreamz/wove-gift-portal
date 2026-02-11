import { getSupportRequests } from '@/lib/action/supportAction'
import AdminSupportManagement from '../../../components/supportRequest/AdminSupportManagement'
import { getSession } from '../../../lib/action/userAction/session';

export default async function AdminSupportPage({ searchParams }) {
    // Await searchParams before accessing its properties
    const session = await getSession();
    const user = session?.user;
    const params = await searchParams
    const page = params?.page || 1
    const search = params?.search || ''
    const status = params?.status || ''

    const response = await getSupportRequests({
        page: parseInt(page),
        search,
        status,
        limit: 10,
        user: user,
    })

    return (
        <AdminSupportManagement
            initialData={response.data}
            pagination={response.pagination}
        />
    )
}