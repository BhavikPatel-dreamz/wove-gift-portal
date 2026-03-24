"use client";

import { Suspense } from "react";
import AppBridgeProvider from "@/components/shopify/AppBridgeProvider";
import { useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import AppLayout from "./component/AppLayout";

// Pages that should NOT be wrapped with AppBridge (pre-auth pages)
const SKIP_APP_BRIDGE_PATHS = ["/shopify/install", "/shopify/auth-required"];

function ShopifyLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const shop = searchParams.get("shop");

  const skipAppBridge = SKIP_APP_BRIDGE_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    // Log Shopify context for debugging
  }, [shop, searchParams]);

  // For install/auth pages, render without AppBridge
  if (skipAppBridge) {
    return <>{children}</>;
  }

  return (
    <AppBridgeProvider>
      <AppLayout>
        <div className="shopify-app-wrapper">{children}</div>
      </AppLayout>
    </AppBridgeProvider>
  );
}

export default function ShopifyClientLayout({ children }) {
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
