'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheckIcon, AlertCircle } from 'lucide-react';

function AuthRequiredContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shop = searchParams.get('shop');

  const handleInstall = () => {
    if (shop) {
      router.push(`/shopify/install?shop=${shop}`);
    } else {
      router.push('/shopify/install');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            This page must be accessed through the Shopify Admin panel as an embedded app.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Why am I seeing this?</h3>
          <ul className="text-sm text-blue-800 text-left space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You're trying to access the app directly without proper Shopify authentication</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The app must be accessed from your Shopify Admin Apps section</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>This ensures secure communication between your store and our app</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          {shop && (
            <button
              onClick={handleInstall}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Install App for {shop}
            </button>
          )}
          
          {!shop && (
            <button
              onClick={handleInstall}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Installation
            </button>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Already installed? Access the app from:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-left">
              <ol className="text-sm text-gray-700 space-y-1">
                <li><strong>1.</strong> Go to your Shopify Admin</li>
                <li><strong>2.</strong> Navigate to <strong>Apps</strong></li>
                <li><strong>3.</strong> Click on <strong>Gift Card Manager</strong></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
            Secure Shopify App Authentication
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthRequiredPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthRequiredContent />
    </Suspense>
  );
}
