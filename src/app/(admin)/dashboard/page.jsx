import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/action/userAction/session'
import Dashboard from '../../../components/Dashboard/Dashboard'
import { getDashboardData } from '../../../lib/action/dashbordAction'

export default async function DashboardPage({ searchParams }) {
  // Get session on server side
  const session = await getSession()

  // Redirect if no session
  if (!session || !session.user) {
    redirect('/login')
  }

  const user = session.user
  const role = user?.role

  // Get query parameters from URL
  const params = await searchParams
  const period = params?.period || 'all'
  const startDate = params?.startDate
  const endDate = params?.endDate
  
  // Get shop domain - if admin can filter by shop, otherwise use user's shop
  const shop = role === 'ADMIN' ? params?.shop || user.shopDomain : user.shopDomain

  // Fetch dashboard data directly from server function (no API call)
  const dashboardData = await getDashboardData({
    period,
    startDate,
    endDate,
    shop,
  })

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {role === "ADMIN" && (
        <Dashboard dashboardData={dashboardData} shopParam={user.shopId} />
      )}
    </main>
  )
}
