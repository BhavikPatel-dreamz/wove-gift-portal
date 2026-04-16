import { getShopInstallationAccess, normalizeShopDomain } from "./shopify-installation";
import { hasValidSession } from "./shopify.server";

export async function getShopPageAccess(shop) {
  const shopDomain = normalizeShopDomain(shop);

  if (!shopDomain) {
    return {
      shop: "",
      hasShop: false,
      hasValidSession: false,
      access: null,
    };
  }

  const validSession = await hasValidSession(shopDomain);
  const access = validSession
    ? await getShopInstallationAccess(shopDomain)
    : null;

  return {
    shop: shopDomain,
    hasShop: true,
    hasValidSession: validSession,
    access,
  };
}
