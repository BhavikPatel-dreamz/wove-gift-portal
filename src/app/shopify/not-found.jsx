import Link from 'next/link';

export default function ShopifyNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="16" fill="#EFF6FF" />
        <path d="M40 24v24M40 56h.01" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <p className="text-6xl font-bold text-blue-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 max-w-sm text-gray-500">
          This page doesn&apos;t exist. Please open the app from your Shopify Admin.
        </p>
      </div>
      <Link
        href="/shopify/install"
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Open App
      </Link>
    </div>
  );
}
