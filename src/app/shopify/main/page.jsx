'use client';

import { Suspense } from 'react';
import { ShopAdminLayout } from '../../../components/shopAdmin/ShopAdminLayout';

function ShopifyMainContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShopAdminLayout>

      </ShopAdminLayout>
    </div>
  );
}

export default function ShopifyMainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopifyMainContent />
    </Suspense>
  );
}
