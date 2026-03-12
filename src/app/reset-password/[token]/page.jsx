import ResetPasswordForm from '@/components/ResetPasswordForm'

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  console.log("token", token)
  return (
    <main>
      <ResetPasswordForm token={token || ''} />
    </main>
  )
}