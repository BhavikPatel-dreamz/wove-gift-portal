// ShopifyClientLayout.jsx
"use client";

import { Suspense, useState, useEffect } from "react";
import AppBridgeProvider, {
  getShopifySessionToken,
} from "@/components/shopify/AppBridgeProvider";
import { useSearchParams, usePathname } from "next/navigation";
import AppLayout from "./component/AppLayout";

const SKIP_APP_BRIDGE_PATHS = [
  "/shopify/install",
  "/shopify/auth-required",
];
const SKIP_APP_BRIDGE_EXACT_PATHS = ["/shopify"];
const BARE_APP_LAYOUT_PATHS = ["/shopify/approval-pending"];

function ShopifyShellLoading({ label = "Loading Shopify App..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
}

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
    return <ShopifyShellLoading label="Loading..." />;
  }

  return <>{children}</>;
}

function ShopifyRoutePropagator({ disabled = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (disabled || !pathname?.startsWith("/shopify/")) {
      return;
    }

    if (
      pathname.startsWith("/shopify/install") ||
      pathname.startsWith("/shopify/auth-required")
    ) {
      return;
    }

    try {
      const queryString = searchParams.toString();
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

      window.history.replaceState(null, "", nextPath);
    } catch (error) {
      console.error("Unable to propagate Shopify app route:", error);
    }
  }, [disabled, pathname, searchParams]);

  return null;
}

function ShopifyLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const shop = searchParams.get("shop");
  const [accessState, setAccessState] = useState({
    loading: Boolean(shop),
    approved: true,
  });

  const skipAppBridge =
    SKIP_APP_BRIDGE_EXACT_PATHS.includes(pathname) ||
    SKIP_APP_BRIDGE_PATHS.some((path) => pathname.startsWith(path));
  const skipAppLayout = BARE_APP_LAYOUT_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    let ignore = false;

    if (skipAppBridge || skipAppLayout || !shop) {
      setAccessState({ loading: false, approved: true });
      return () => {
        ignore = true;
      };
    }

    setAccessState((current) => ({
      ...current,
      loading: true,
    }));

    const controller = new AbortController();

    getShopifySessionToken()
      .then((token) =>
        fetch(`/api/shopify/shop?shop=${encodeURIComponent(shop)}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch Shopify access state");
        }

        return response.json();
      })
      .then((data) => {
        if (ignore) {
          return;
        }

        setAccessState({
          loading: false,
          approved: !data?.requiresApproval,
        });
      })
      .catch((error) => {
        if (ignore || error.name === "AbortError") {
          return;
        }

        setAccessState({
          loading: false,
          approved: true,
        });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [shop, skipAppBridge, skipAppLayout, pathname]);

  if (skipAppBridge) {
    return <>{children}</>;
  }

  if (shop && accessState.loading) {
    return (
      <>
        <ShopifyRoutePropagator disabled={skipAppLayout} />
        <ShopifyShellLoading />
      </>
    );
  }

  return (
    <AppBridgeProvider>
      {/* ✅ Gate prevents dashboard flash during App Bridge init */}
      <AppBridgeReadinessGate>
        <ShopifyRoutePropagator disabled={skipAppLayout} />
        {accessState.approved ? (
          skipAppLayout ? (
            <>{children}</>
          ) : (
            <AppLayout>
              <div className="shopify-app-wrapper">{children}</div>
            </AppLayout>
          )
        ) : (
          <>{children}</>
        )}
      </AppBridgeReadinessGate>
    </AppBridgeProvider>
  );
}

export default function ShopifyClientLayout({ children }) {
  return (
    <Suspense
      fallback={<ShopifyShellLoading />}
    >
      <ShopifyLayoutContent>{children}</ShopifyLayoutContent>
    </Suspense>
  );
}
