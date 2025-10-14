import { validateSession } from '../../lib/action/userAction/session';
import './brand-override.css';
import { SessionProvider } from "@/contexts/SessionContext";

export default async function ClientLayout({ children }) {
  const session = await validateSession();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
