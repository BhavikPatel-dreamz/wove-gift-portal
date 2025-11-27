"use client";
import { useSearchParams } from "next/navigation";
import { Provider } from "@shopify/app-bridge-react";
import AppLayout from "../layout/AppLayout";

export const ShopAdminLayout = ({ children }) => {
  const params = useSearchParams();
  const shopParam = params.get('shop');
  const host = params.get('host');

  console.log("shopParam-------ssss----------", shopParam);

  if (!host) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppLayout>
            {children}
          </AppLayout>
        </div>
      </div>
    );
  }

  const appBridgeConfig = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    host: host,
    forceRedirect: true,
  };

  return (
    <Provider config={appBridgeConfig}>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppLayout>
            {children}
          </AppLayout>
        </div>
      </div>
    </Provider>
  );
};