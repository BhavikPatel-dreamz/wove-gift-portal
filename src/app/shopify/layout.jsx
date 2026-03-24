import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getShopSession } from "@/lib/shopify/getSession";
import ShopifyClientLayout from "./ShopifyClientLayout";

/**
 * Server-side Shopify layout.
 * Validates the shop session before rendering children.
 * Redirects to auth/install if no valid session is found.
 */
export default async function ShopifyLayout({ children }) {
  // In App Router, layouts don't receive searchParams directly.
  // Extract the shop param from the request URL via headers.
  const headersList = await headers();
  const fullUrl = headersList.get("x-invoke-path") || headersList.get("x-url") || "";
  const referer = headersList.get("referer") || "";

  // Try to extract shop from the URL or referer
  let shop = null;
  try {
    const urlToParse = fullUrl.includes("?") ? fullUrl : referer;
    if (urlToParse) {
      const url = new URL(urlToParse, process.env.SHOPIFY_APP_URL || "http://localhost:3000");
      shop = url.searchParams.get("shop");
    }
  } catch {
    // URL parsing failed, shop stays null
  }

  // If we have a shop param, validate the session server-side
  if (shop) {
    const sessions = await getShopSession(shop);

    if (!sessions?.length) {
      redirect(`/shopify/auth-required?shop=${shop}`);
    }

    // Optionally check that at least one session has a valid access token
    const validSession = sessions.find(
      (s) => s.accessToken && (!s.expires || new Date(s.expires) > new Date())
    );

    if (!validSession) {
      redirect(`/shopify/auth-required?shop=${shop}`);
    }
  }

  return <ShopifyClientLayout>{children}</ShopifyClientLayout>;
}
