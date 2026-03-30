// Layout.jsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Script from "next/script";
import { getShopSession } from "@/lib/shopify/getSession";
import ShopifyClientLayout from "./ShopifyClientLayout";

const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";

function normalizeShopDomain(shop) {
  if (!shop) return null;
  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "");
  if (!cleaned) return null;
  return `${cleaned}.myshopify.com`.toLowerCase();
}

export const metadata = {
  title: "Shopify App",
  ...(apiKey ? { other: { "shopify-api-key": apiKey } } : {}),
};

export default async function ShopifyLayout({ children, searchParams }) {
  const headersList = await headers();

  // ✅ FIX 1: Read shop from BOTH headers AND URL query params
  const shopFromHeader = headersList.get("x-shopify-shop");
  const shopFromParams = (await searchParams)?.shop; // Next.js 14 app router

  const shop =
    normalizeShopDomain(shopFromHeader) ||
    normalizeShopDomain(shopFromParams);

  // ✅ FIX 2: Guard properly — redirect if shop present but session invalid
  if (shop) {
    const sessions = await getShopSession(shop);

    const validSession = sessions?.find(
      (s) =>
        s.accessToken && (!s.expires || new Date(s.expires) > new Date())
    );

    if (!validSession) {
      redirect(`/shopify/auth-required?shop=${shop}`);
    }
  }
  // Note: if shop is null, we're likely on a non-embedded route — let it through

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