import Link from 'next/link'
import { validateSession } from '@/lib/action/userAction/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await validateSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Next.js Auth
        </h1>
        <p className="text-gray-600 mb-6">
          A production-grade authentication system with Next.js, Prisma, and PostgreSQL.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition text-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}
