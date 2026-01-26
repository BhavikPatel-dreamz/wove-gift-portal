import { getSession } from '@/lib/action/userAction/session';
import { getSupportRequests } from '@/lib/action/supportAction'
import TrackRequestClient from './TrackRequestClient'

export default async function TrackRequestPage({ searchParams }) {
    const params = await searchParams
    const session = await getSession();
    const user = session?.user;

    const page = parseInt(params?.page) || 1
    const limit = parseInt(params?.limit) || 10
    const search = params?.search || ''
    const status = params?.status || ''

    const response = await getSupportRequests({
        page,
        limit,
        search,
        status,
        user: user,
    })

    console.log("user",user)

    return (
        <TrackRequestClient
            initialData={response.data}
            pagination={response?.pagination}
        />
    )
}