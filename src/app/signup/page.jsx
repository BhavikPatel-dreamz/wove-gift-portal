import AuthForm from '@/components/AuthForm'
import { validateSession } from '@/lib/action/userAction/session'
import { redirect } from 'next/navigation'

function getSafeCallbackUrl(value) {
  const callbackUrl = Array.isArray(value) ? value[0] : value

  if (
    typeof callbackUrl === 'string' &&
    callbackUrl.startsWith('/') &&
    !callbackUrl.startsWith('//')
  ) {
    return callbackUrl
  }

  return ''
}

export default async function SignupPage({ searchParams }) {
  const params = await searchParams
  const callbackUrl = getSafeCallbackUrl(params?.callbackUrl)
  const session = await validateSession()

  if (session) {
    redirect(callbackUrl || '/dashboard')
  }

  return (
    <main>
        <AuthForm type="signup" callbackUrl={callbackUrl} />
    </main>
  )
}
