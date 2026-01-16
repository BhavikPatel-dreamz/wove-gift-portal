import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/action/userAction/session'
import Dashboard from '../../../components/Dashboard/Dashboard'
import { getDashboardData } from '../../../lib/action/dashbordAction'

export default async function DashboardPage({ searchParams }) {
  // Get session on server side
  const session = await getSession()

  // Redirect if no session
  if (!session?.user) {
    redirect('/login')
  }

  const { user } = session
  const { role, shopDomain, shopId } = user

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams
  
  // Extract and validate parameters
  const period = params?.period || 'all'
  const startDate = params?.startDate
  const endDate = params?.endDate
  
  // Determine shop filter based on role
  const shop = role === 'ADMIN' ? (params?.shop || shopDomain) : shopDomain

  // Authorization check - only admins can access dashboard
  if (role !== 'ADMIN') {
    redirect('/unauthorized') // or wherever non-admins should go
  }

  // Fetch dashboard data
  const dashboardData = await getDashboardData({
    period,
    startDate,
    endDate,
    shop,
  })

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-0 md:px-4">
      <Dashboard 
        dashboardData={dashboardData} 
        shopParam={shopId}
      />
    </main>
  )
}