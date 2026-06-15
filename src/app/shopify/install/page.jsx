'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

function normalizeShopDomain(shop) {
  const cleaned = String(shop || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/\.myshopify\.com$/i, '');

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(cleaned)) {
    return '';
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
}

function InstallContent() {
  const searchParams = useSearchParams();
  const shop = useMemo(
    () => normalizeShopDomain(searchParams?.get('shop')),
    [searchParams],
  );
  const error = '';

  useEffect(() => {
    if (!shop) {
      return;
    }

    const installParams = new URLSearchParams({
      shop,
      source: 'admin',
    });
    const host = searchParams?.get('host');
    const embedded = searchParams?.get('embedded');

    if (host) {
      installParams.set('host', host);
    }

    if (embedded) {
      installParams.set('embedded', embedded);
    }

    window.location.replace(`/api/shopify/auth?${installParams.toString()}`);
  }, [searchParams, shop]);

  if (shop && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Connecting your Shopify store
          </h1>
          <p className="text-sm text-gray-600">
            Redirecting securely to Shopify authorization for {shop}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">
          Open Wove Gift from Shopify
        </h1>
        <p className="mb-6 text-sm leading-6 text-gray-600">
          For security, installation starts from the Shopify App Store or your
          Shopify Admin Apps page. This app no longer asks merchants to type a
          store URL manually.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Missing Shopify context
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Please launch the app from Shopify Admin so Shopify can pass the
                required shop and host parameters.
              </p>
            </div>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <InstallContent />
    </Suspense>
  );
}
