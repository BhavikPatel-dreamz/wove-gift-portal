'use client'

import { useSession } from '@/contexts/SessionContext'
import { redirect } from 'next/navigation'
import Dashboard from '../../../components/Dashboard/Dashboard'

export default function DashboardPage() {
  const session = useSession()

  if (!session) {
    redirect('/login')
  }

  // Use session.user directly
  const user = session.user

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
     <Dashboard/>
    </main>
  )
}
