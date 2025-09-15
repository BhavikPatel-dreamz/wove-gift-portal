import { validateSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const session = await validateSession()

  if (!session) {
    redirect('/login')
  }

  console.log("session", session);

  // Use session.user directly
  const user = session.user

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Dashboard
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium text-gray-800">{user.email}</p>
          </div>

          {user.name && (
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg font-medium text-gray-800">{user.name}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
