'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { getShopifySessionToken } from '@/components/shopify/AppBridgeProvider';

export default function ShopifyAppRoot() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shopParam = urlParams.get('shop');

      // If no shop parameter, redirect to install page
      if (!shopParam) {
        router.replace('/shopify/install');
        return;
      }

      try {
        const token = await getShopifySessionToken();
        // Check if shop is authenticated
        const response = await fetch(`/api/shopify/shop?shop=${shopParam}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const preservedParams = new URLSearchParams(urlParams.toString());
          preservedParams.set('shop', shopParam);
          preservedParams.set('embedded', preservedParams.get('embedded') || '1');

          // Shop is authenticated, redirect to dashboard
          router.replace(`/shopify/dashboard?${preservedParams.toString()}`);
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
