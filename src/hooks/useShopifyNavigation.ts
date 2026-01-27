'use client';

import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useCallback } from 'react';

/**
 * Custom hook to handle navigation within Shopify embedded app
 * Uses App Bridge for proper iframe navigation
 */
export function useShopifyNavigation() {
  const app = useAppBridge();

  const navigate = useCallback((path: string) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Create and dispatch redirect action
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, normalizedPath);
  }, [app]);

  return { navigate };
}