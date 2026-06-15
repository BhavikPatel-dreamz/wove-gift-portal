'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AppBridgeContext = createContext(null);
const APP_BRIDGE_READY_TIMEOUT_MS = 5000;
const APP_BRIDGE_ID_TOKEN_TIMEOUT_MS = 5000;
const SHOPIFY_ID_TOKEN_STORAGE_KEY = 'wove-shopify-id-token';

function getShopifyGlobal() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.shopify || null;
}

function isJwtLikeToken(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

function getUrlIdToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  const token = new URLSearchParams(window.location.search).get('id_token') || '';
  return isJwtLikeToken(token) ? token : '';
}

function getStoredIdToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const token = window.sessionStorage.getItem(SHOPIFY_ID_TOKEN_STORAGE_KEY) || '';
    return isJwtLikeToken(token) ? token : '';
  } catch {
    return '';
  }
}

function rememberIdToken(token) {
  if (typeof window === 'undefined' || !isJwtLikeToken(token)) {
    return;
  }

  try {
    window.sessionStorage.setItem(SHOPIFY_ID_TOKEN_STORAGE_KEY, token);
  } catch {
    // Session storage can be unavailable in hardened browser contexts.
  }
}

function withTimeout(promise, timeoutMs, errorMessage) {
  if (typeof window === 'undefined') {
    return promise;
  }

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
}

function isSameOriginApiRequest(input) {
  if (typeof window === 'undefined') {
    return false;
  }

  const url =
    typeof input === 'string'
      ? new URL(input, window.location.origin)
      : input instanceof URL
        ? input
        : new URL(input.url, window.location.origin);

  return (
    url.origin === window.location.origin &&
    !url.pathname.startsWith('/_next/') &&
    !url.pathname.startsWith('/favicon') &&
    !/\.(?:css|js|map|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(url.pathname)
  );
}

function buildShopifySessionCheckUrl(shop) {
  const params = new URLSearchParams({ shop });
  return `/api/shopify/session?${params.toString()}`;
}

async function waitForShopifyGlobal(timeoutMs = APP_BRIDGE_READY_TIMEOUT_MS) {
  const existing = getShopifyGlobal();

  if (typeof existing?.idToken === 'function') {
    return existing;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const shopify = getShopifyGlobal();

      if (typeof shopify?.idToken === 'function' || Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(timer);
        resolve(typeof shopify?.idToken === 'function' ? shopify : null);
      }
    }, 50);
  });
}

export async function getShopifySessionToken() {
  const urlIdToken = getUrlIdToken();
  const storedIdToken = getStoredIdToken();

  if (urlIdToken) {
    rememberIdToken(urlIdToken);
  }

  const shopify = await waitForShopifyGlobal();

  if (typeof shopify?.idToken !== 'function') {
    const fallbackToken = urlIdToken || storedIdToken;

    if (fallbackToken) {
      return fallbackToken;
    }

    throw new Error('Shopify App Bridge ID token API is unavailable');
  }

  try {
    if (typeof shopify.ready === 'function') {
      await withTimeout(
        shopify.ready(),
        APP_BRIDGE_READY_TIMEOUT_MS,
        'Timed out waiting for Shopify App Bridge to become ready'
      );
    }

    const token = await withTimeout(
      shopify.idToken(),
      APP_BRIDGE_ID_TOKEN_TIMEOUT_MS,
      'Timed out waiting for Shopify App Bridge ID token'
    );

    rememberIdToken(token);
    return token;
  } catch (error) {
    const fallbackToken = urlIdToken || storedIdToken;

    if (fallbackToken) {
      console.warn(
        'Falling back to cached Shopify id_token because App Bridge idToken() failed:',
        error
      );
      return fallbackToken;
    }

    throw error;
  }
}

export async function fetchWithShopifySessionToken(input, init = {}) {
  if (!isSameOriginApiRequest(input)) {
    return fetch(input, init);
  }

  const token = await getShopifySessionToken();
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export function useAppBridgeInstance() {
  return useContext(AppBridgeContext);
}

export default function AppBridgeProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const host = searchParams.get('host');
  const shop = searchParams.get('shop');
  const [shopify, setShopify] = useState(null);

  // Compute a valid host value — either from the URL or by encoding the shop admin URL
  const computedHost = host || (shop ? btoa(`${shop}/admin`) : null);

  useEffect(() => {
    // If there's no shop at all, redirect to install
    if (!shop && !host) {
      router.replace('/shopify/install');
    }
  }, [shop, host, router]);

  useEffect(() => {
    if (!computedHost) {
      setShopify(null);
      return;
    }

    let cancelled = false;

    waitForShopifyGlobal().then((shopifyGlobal) => {
      if (!cancelled) {
        setShopify(shopifyGlobal);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [computedHost]);

  useEffect(() => {
    if (!computedHost) {
      return undefined;
    }

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
      if (!isSameOriginApiRequest(input)) {
        return originalFetch(input, init);
      }

      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
      );

      if (headers.has('Authorization')) {
        return originalFetch(input, {
          ...init,
          headers,
        });
      }

      try {
        const token = await getShopifySessionToken();
        headers.set('Authorization', `Bearer ${token}`);

        return originalFetch(input, {
          ...init,
          headers,
        });
      } catch (error) {
        console.error('Unable to attach Shopify session token:', error);
        return originalFetch(input, init);
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [computedHost]);

  useEffect(() => {
    if (!computedHost || !shop) {
      return undefined;
    }

    let cancelled = false;

    async function verifySessionTokenOnLoad() {
      try {
        const token = await getShopifySessionToken();

        if (cancelled) {
          return;
        }

        await window.fetch(buildShopifySessionCheckUrl(shop), {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Unable to verify Shopify session token:', error);
      }
    }

    verifySessionTokenOnLoad();

    return () => {
      cancelled = true;
    };
  }, [computedHost, shop]);

  const contextValue = useMemo(
    () => ({
      shopify,
      getSessionToken: getShopifySessionToken,
      authenticatedFetch: fetchWithShopifySessionToken,
    }),
    [shopify]
  );

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

  return (
    <AppBridgeContext.Provider value={contextValue}>
      {children}
    </AppBridgeContext.Provider>
  );
}
