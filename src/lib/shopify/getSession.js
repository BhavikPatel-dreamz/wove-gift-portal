import { sessionStorage } from "@/lib/shopify.server";

/**
 * Get all sessions for a given shop domain.
 * Used for server-side session validation in layouts/pages.
 * @param {string} shop - The shop domain (e.g. "my-store.myshopify.com")
 * @returns {Promise<Array>} Array of session objects, or empty array if none found
 */
export async function getShopSession(shop) {
  return await sessionStorage.findSessionsByShop(shop);
}
