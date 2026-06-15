import { prisma } from "../db.js";
import {
  decodeShopifySessionToken,
  sessionStorage,
} from "../shopify.server.js";
import { fetchShopInfo } from "../action/shopify.js";
import {
  normalizeShopDomain,
  upsertShopInstallation,
} from "../shopify-installation.js";

export { normalizeShopDomain } from "../shopify-installation.js";

async function findBrandForShop(shopDomain) {
  if (!shopDomain) {
    return null;
  }

  return prisma.brand.findFirst({
    where: {
      OR: [
        { domain: shopDomain },
        {
          website: {
            in: [shopDomain, `https://${shopDomain}`, `http://${shopDomain}`],
          },
        },
      ],
    },
    select: { id: true },
  });
}

async function exchangeIdTokenForSession(shopDomain, idToken) {
  if (!shopDomain || !idToken) {
    return null;
  }

  const tokenValidation = await decodeShopifySessionToken(idToken, {
    shop: shopDomain,
  });

  if (!tokenValidation.valid) {
    throw new Error(`Invalid Shopify session token: ${tokenValidation.reason}`);
  }

  const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_SECRET_KEY,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token: idToken,
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
      expiring: "0",
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(
      `Failed to exchange Shopify session token: ${tokenResponse.status} ${errorBody}`
    );
  }

  const tokenData = await tokenResponse.json();
  const expiresIn = Number(tokenData.expires_in || 0);

  return {
    shop: shopDomain,
    accessToken: tokenData.access_token,
    scope: tokenData.scope || "",
    isOnline: false,
    expires: expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000) : null,
  };
}

/**
 * Ensure the Shopify session and local brand record exist for a shop.
 *
 * This is the dashboard-load equivalent of the normal OAuth callback:
 * - if a session is missing but an embedded `id_token` is available, exchange it
 *   for an offline access token
 * - persist the session and AppInstallation row
 * - fetch shop details and upsert the brand when it is missing
 */
export async function ensureShopifyInstallData({
  shop,
  idToken = null,
  forceRefresh = false,
} = {}) {
  const shopDomain = normalizeShopDomain(shop);
  let session = null;
  let brand = null;
  let sessionCreated = false;
  let brandCreated = false;
  let bootstrapError = null;

  if (!shopDomain) {
    return {
      ok: false,
      shop: "",
      session,
      brand,
      reason: "missing_shop",
    };
  }

  try {
    session = await sessionStorage.loadSession(shopDomain);

    if (session?.expires && new Date(session.expires) <= new Date()) {
      await sessionStorage.deleteSession(shopDomain);
      session = null;
    }

    brand = await findBrandForShop(shopDomain);

    if (!session?.accessToken && idToken) {
      try {
        session = await exchangeIdTokenForSession(shopDomain, idToken);
        await sessionStorage.storeSession(session);
        sessionCreated = true;
      } catch (error) {
        bootstrapError = error;
        console.error(
          "Failed to exchange Shopify session token on dashboard load:",
          error
        );
      }
    }

    if (session?.accessToken) {
      await upsertShopInstallation(session);
    }

    const shouldFetchBrand = forceRefresh || !brand;

    if (shouldFetchBrand && session?.accessToken) {
      try {
        const shopSyncResult = await fetchShopInfo(session.accessToken, shopDomain);
        brand = shopSyncResult?.brand ?? brand;
        brandCreated = Boolean(shopSyncResult?.brand);
      } catch (error) {
        console.error("Failed to sync Shopify shop data on dashboard load:", error);
      }
    }

    return {
      ok: Boolean(session?.accessToken || brand),
      shop: shopDomain,
      session,
      brand,
      sessionCreated,
      brandCreated,
      error: bootstrapError?.message || null,
    };
  } catch (error) {
    console.error("Shopify install bootstrap failed:", error);
    return {
      ok: Boolean(session?.accessToken || brand),
      shop: shopDomain,
      session,
      brand,
      error: error.message,
      sessionCreated,
      brandCreated,
    };
  }
}
