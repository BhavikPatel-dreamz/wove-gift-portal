'use client';

import { Provider } from '@shopify/app-bridge-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppBridgeProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const host = searchParams.get('host');
  const shop = searchParams.get('shop');

  // Compute a valid host value — either from the URL or by encoding the shop admin URL
  const computedHost = host || (shop ? btoa(`${shop}/admin`) : null);

  useEffect(() => {
    // If there's no shop at all, redirect to install
    if (!shop && !host) {
      router.replace('/shopify/install');
    }
  }, [shop, host, router]);

  // Don't render App Bridge until we have a valid host
  if (!computedHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Shopify App...</p>
        </div>
      </div>
    );
  }

  // Shopify App Bridge configuration
  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || 'c9f2dae08ce0d37db022b21b202c7e9d',
    host: computedHost,
    forceRedirect: true,
  };

  return <Provider config={config}>{children}</Provider>;
}
