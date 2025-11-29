'use client';

import { TitleBar } from '@shopify/app-bridge-react';
import { useSearchParams } from 'next/navigation';
import ShopifyLink from '@/components/shopify/ShopifyLink';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  return (
    <div>
      <TitleBar title="Orders" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="mb-4">Shop: {shop}</p>
        
        <ShopifyLink 
          href="/shopify/dashboard" 
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </ShopifyLink>

        <div className="mt-6">
          {/* Your orders content here */}
          <p>Orders will be displayed here</p>
        </div>
      </div>
    </div>
  );
}