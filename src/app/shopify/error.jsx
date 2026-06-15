'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ShopifyErrorContent({ error, reset }) {
  const searchParams = useSearchParams();
  const shop = searchParams?.get('shop');

  useEffect(() => {
    console.error('Shopify embedded app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#FEE2E2" />
        <path d="M32 20v16M32 44h.01" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="max-w-md text-gray-500">
        An unexpected error occurred. Please try again or reload the page from your Shopify Admin.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        {shop && (
          <a
            href={`/shopify/dashboard?shop=${encodeURIComponent(shop)}&embedded=1`}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </div>
  );
}

export default function ShopifyError({ error, reset }) {
  return (
    <Suspense fallback={null}>
      <ShopifyErrorContent error={error} reset={reset} />
    </Suspense>
  );
}
