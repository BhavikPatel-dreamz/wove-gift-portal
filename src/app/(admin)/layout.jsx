import AppLayout from "../../components/layout/AppLayout";
import { validateSession } from '@/lib/action/userAction/session'
import { SessionProvider } from "@/contexts/SessionContext";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/roles";

export default async function AuthLayout({ children }) {
  const session = await validateSession();

  if (!session) {
    redirect('/login');
  }

  if (!isAdminRole(session.user?.role)) {
    redirect('/');
  }

  return (
    <SessionProvider session={session}>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  );
}
