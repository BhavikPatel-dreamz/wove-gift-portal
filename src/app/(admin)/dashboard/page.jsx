import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/action/userAction/session'
import Dashboard from '../../../components/Dashboard/Dashboard'
import { getDashboardData } from '../../../lib/action/dashbordAction'

export default async function DashboardPage(props) {
  // Get session on server side
  const session = await getSession()

  // Redirect if no session
  if (!session?.user) {
    redirect('/login')
  }

  const { user } = session
  const { role, shopDomain, shopId } = user

  // Authorization check - only admins can access dashboard
  if (role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Await searchParams (Next.js 15+ requirement)
  const searchParams = await props.searchParams
  
  // Extract and validate parameters
  const period = searchParams?.period || 'month'
  const startDate = searchParams?.startDate || null
  const endDate = searchParams?.endDate || null
  
  // Determine shop filter based on role
  const shop = role === 'ADMIN' ? (searchParams?.shop || shopDomain) : shopDomain

  // Fetch dashboard data with proper parameters
  const dashboardData = await getDashboardData({
    period,
    ...(startDate && endDate ? { startDate, endDate } : {}),
    shop,
  })

  return (
    <main className="min-h-screen ">
      <Dashboard 
        dashboardData={dashboardData} 
        shopParam={shopId}
      />
    </main>
  )
}