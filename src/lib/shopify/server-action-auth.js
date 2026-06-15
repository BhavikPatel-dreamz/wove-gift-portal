import { headers } from "next/headers";
import { normalizeShopDomain } from "../shopify-installation";
import { verifyShopifySessionToken } from "../shopify.server";

export async function verifyShopifyServerActionSession(shop) {
  const shopDomain = normalizeShopDomain(shop);

  if (!shopDomain) {
    return {
      valid: false,
      status: 400,
      reason: "missing_shop",
      shop: "",
    };
  }

  const requestHeaders = await headers();
  return verifyShopifySessionToken(
    {
      headers: requestHeaders,
    },
    { shop: shopDomain },
  );
}
