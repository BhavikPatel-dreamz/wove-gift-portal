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
    <main className="">

        <AuthForm type="login" />
       
    </main>
  )
}
