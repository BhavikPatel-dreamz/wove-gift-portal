'use client'

import { useSession } from '@/contexts/SessionContext'
import { redirect } from 'next/navigation'
import Dashboard from '../../../components/Dashboard/Dashboard'
import CustomerDashbord from '../../../components/Dashboard/CustomerDashbord'

export default function DashboardPage() {
  const session = useSession()

  if (!session) {
    redirect('/login')
  }

  // Use session.user directly
  const user = session.user
  const role = user?.role

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {role == "ADMIN" && (
        <Dashboard />
      )}

      {role == "CUSTOMER" && (
        <CustomerDashbord />
      )}

    </main>
  )
}
