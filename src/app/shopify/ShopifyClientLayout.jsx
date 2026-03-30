// ShopifyClientLayout.jsx
"use client";

import { Suspense, useState, useEffect } from "react";
import AppBridgeProvider from "@/components/shopify/AppBridgeProvider";
import { useSearchParams, usePathname } from "next/navigation";
import AppLayout from "./component/AppLayout";

const SKIP_APP_BRIDGE_PATHS = ["/shopify/install", "/shopify/auth-required"];

// ✅ FIX 3: Loading screen shown until App Bridge signals it's ready
function AppBridgeReadinessGate({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // App Bridge sets this on the window when initialized in embedded mode
    // For non-embedded (direct URL), we can skip the wait
    const isEmbedded =
      window.self !== window.top || // inside an iframe
      new URLSearchParams(window.location.search).get("embedded") === "1";

    if (!isEmbedded) {
      setIsReady(true);
      return;
    }

    // Wait for App Bridge to initialize
    // It dispatches 'shopify:ready' or we can poll window.__SHOPIFY_DEV_TOOLS_HOOK__
    const handleReady = () => setIsReady(true);

    // App Bridge fires this when embedded app is fully initialized
    window.addEventListener("shopify:ready", handleReady);

    // Fallback: if event never fires (e.g. older bridge), unblock after 800ms
    const fallbackTimer = setTimeout(() => setIsReady(true), 800);

    return () => {
      window.removeEventListener("shopify:ready", handleReady);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ShopifyLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const skipAppBridge = SKIP_APP_BRIDGE_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (skipAppBridge) {
    return <>{children}</>;
  }

  return (
    <AppBridgeProvider>
      {/* ✅ Gate prevents dashboard flash during App Bridge init */}
      <AppBridgeReadinessGate>
        <AppLayout>
          <div className="shopify-app-wrapper">{children}</div>
        </AppLayout>
      </AppBridgeReadinessGate>
    </AppBridgeProvider>
  );
}

export default function ShopifyClientLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Shopify App...</p>
          </div>
        </div>
      }
    >
      <ShopifyLayoutContent>{children}</ShopifyLayoutContent>
    </Suspense>
  );
}