'use client';

import { Gift } from 'lucide-react';

const DEFAULT_STEPS = ['Check store access', 'Sync Shopify data', 'Open dashboard'];

export default function ShopifyTransitionLoader({
  title = 'Preparing your Shopify dashboard',
  description = 'We are checking the store connection, syncing the latest data, and finishing the handoff.',
  steps = DEFAULT_STEPS,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Shopify App...</p>
      </div>
    </div>
  );
}
