'use client';
import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useShopifyNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const withShopifyContext = useCallback(
    (url: string) => {
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      const [pathPart, queryPart = ''] = normalizedUrl.split('?');
      const nextParams = new URLSearchParams(queryPart);

      // Preserve embedded Shopify context for app routes.
      if (pathPart === '/shopify' || pathPart.startsWith('/shopify/')) {
        const contextKeys = ['shop', 'host', 'embedded', 'locale', 'brandId'];

        contextKeys.forEach((key) => {
          if (!nextParams.has(key)) {
            const value = searchParams.get(key);

            if (value) {
              nextParams.set(key, value);
            }
          }
        });

        if (!nextParams.has('embedded')) {
          nextParams.set('embedded', '1');
        }
      }

      const query = nextParams.toString();
      return query ? `${pathPart}?${query}` : pathPart;
    },
    [searchParams]
  );

  const navigate = useCallback(
    (url: string) => {
      const normalizedUrl = withShopifyContext(url);
      router.push(normalizedUrl);
    },
    [router, withShopifyContext]
  );

  const updateQueryParams = useCallback(
    (url: string) => {
      const nextUrl = withShopifyContext(url);
      // Update URL without reload
      window.history.pushState(null, '', nextUrl);
      // Trigger Next.js router to refetch data
      router.push(nextUrl, { scroll: false });
    },
    [router, withShopifyContext]
  );

  return { navigate, updateQueryParams };
}
