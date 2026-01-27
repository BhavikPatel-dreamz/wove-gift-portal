'use client';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useShopifyNavigation() {
  const app = useAppBridge();
  const router = useRouter();

  const navigate = useCallback(
    (url: string) => {
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, normalizedUrl);
    },
    [app]
  );

  const updateQueryParams = useCallback(
    (url: string) => {
      // Update URL without reload
      window.history.pushState(null, '', url);
      // Trigger Next.js router to refetch data
      router.push(url, { scroll: false });
    },
    [router]
  );

  return { navigate, updateQueryParams };
}