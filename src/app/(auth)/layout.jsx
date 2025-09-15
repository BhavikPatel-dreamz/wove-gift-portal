import AppLayout from "../../components/layout/AppLayout";
import { validateSession } from "@/lib/session";
import { SessionProvider } from "@/contexts/SessionContext";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {
  const session = await validateSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  );
}