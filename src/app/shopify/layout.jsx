import Script from "next/script";
import ShopifyClientLayout from "./ShopifyClientLayout";

const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";

export const metadata = {
  title: "Shopify App",
  ...(apiKey ? { other: { "shopify-api-key": apiKey } } : {}),
};

export default async function ShopifyLayout({ children }) {
  return (
    <>
      <Script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        strategy="beforeInteractive"
      />
      <ShopifyClientLayout>{children}</ShopifyClientLayout>
    </>
  );
}
