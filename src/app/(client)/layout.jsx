import { validateSession } from '../../lib/action/userAction/session';
import './brand-override.css';
import { SessionProvider } from "@/contexts/SessionContext";
import StoreProvider from '@/redux/StoreProvider';
import RouteScrollManager from './RouteScrollManager';
import MobileScrollCue from '@/components/client/mobile/MobileScrollCue';

export default async function ClientLayout({ children }) {
  const session = await validateSession();
  return (
    <SessionProvider session={session}>
      <StoreProvider>
        <RouteScrollManager />
        {children}
        <MobileScrollCue />
      </StoreProvider>
    </SessionProvider>
  );
}
