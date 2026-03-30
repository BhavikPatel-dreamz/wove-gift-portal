import { sessionStorage } from "./shopify.server.js";

export function normalizeShopDomain(shop) {
  if (!shop) {
    return "";
  }

  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "");

  if (!cleaned) {
    return "";
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
}

export async function getValidShopifySession(shop) {
  const shopDomain = normalizeShopDomain(shop);

  if (!shopDomain) {
    return null;
  }

  try {
    const session = await sessionStorage.loadSession(shopDomain);

    if (!session?.accessToken) {
      return null;
    }

    if (session.expires && new Date(session.expires) <= new Date()) {
      await sessionStorage.deleteSession(shopDomain);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error loading Shopify session:", error);
    return null;
  }
}
