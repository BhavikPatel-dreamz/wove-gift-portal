'use client';

import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

/**
 * Custom hook to handle navigation within Shopify embedded app
 * Uses App Bridge for proper iframe navigation
 */
export function useShopifyNavigation() {
  const app = useAppBridge();

  const navigate = (path: string) => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, path);
  };

  return { navigate };
}
