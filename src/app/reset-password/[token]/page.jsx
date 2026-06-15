import ResetPasswordForm from '@/components/ResetPasswordForm'
import { getPasswordResetTokenContext } from '@/lib/action/userAction/passwordReset'

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  const tokenContext = await getPasswordResetTokenContext(token);

  return (
    <main>
      <ResetPasswordForm
        token={token || ''}
        isAdminInviteSetup={tokenContext.isAdminInviteSetup}
      />
    </main>
  )
}
