"use client";

import { Suspense } from "react";
import AppBridgeProvider from "@/components/shopify/AppBridgeProvider";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import AppLayout from "./component/AppLayout";

function ShopifyLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");

  useEffect(() => {
    // Log Shopify context for debugging

  }, [shop, searchParams]);

  return (
    <AppBridgeProvider>
      <AppLayout>
        <div className="shopify-app-wrapper">{children}</div>
      </AppLayout>
    </AppBridgeProvider>
  );
}

export default function ShopifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Shopify App...</p>
          </div>
        </div>
      }
    >
      <ShopifyLayoutContent>{children}</ShopifyLayoutContent>
    </Suspense>
  );
}
