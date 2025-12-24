'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';

export default function ShopifyAppRoot() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shopParam = urlParams.get('shop');
      const hostParam = urlParams.get('host');

      // If no shop parameter, redirect to install page
      if (!shopParam) {
        router.replace('/shopify/install');
        return;
      }

      try {
        // Check if shop is authenticated
        const response = await fetch(`/api/shopify/shop?shop=${shopParam}`);
        
        if (response.ok) {
          // Shop is authenticated, redirect to dashboard
          const queryString = hostParam 
            ? `?shop=${shopParam}&host=${hostParam}`
            : `?shop=${shopParam}`;
          router.replace(`/shopify/dashboard${queryString}`);
        } else {
          // Not authenticated, redirect to install
          router.replace(`/shopify/install?shop=${shopParam}`);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to install page
        router.replace(`/shopify/install?shop=${shopParam}`);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show loading state while checking authentication and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Gift className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Redirecting...</h2>
        <p className="text-gray-600 mt-2">Please wait while we set up your app</p>
      </div>
    </div>
  );
}