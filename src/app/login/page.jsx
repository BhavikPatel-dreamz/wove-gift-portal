import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import { validateSession } from '@/lib/action/userAction/session'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await validateSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Sign In
        </h1>

        <AuthForm type="login" />

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
