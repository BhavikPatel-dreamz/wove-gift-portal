'use client';

import { Provider } from '@shopify/app-bridge-react';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface AppBridgeProviderProps {
  children: ReactNode;
}

export default function AppBridgeProvider({ children }: AppBridgeProviderProps) {
  const searchParams = useSearchParams();
  const host = searchParams.get('host');
  const shop = searchParams.get('shop');

  // Shopify App Bridge configuration
  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || 'c9f2dae08ce0d37db022b21b202c7e9d',
    host: host || btoa(shop || '').replace(/=/g, ''),
    forceRedirect: true,
  };

  return <Provider config={config}>{children}</Provider>;
}
