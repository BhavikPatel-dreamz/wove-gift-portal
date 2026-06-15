import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  ApiVersion,
  LogSeverity,
  
} from "@shopify/shopify-api";
import { PrismaSessionStorage } from "./session-storage.js";
import {
  normalizeShopDomain,
  upsertShopInstallation,
} from "./shopify-installation.js";
import {
  getShopifyScopes,
  getShopifyScopeString,
} from "./shopify/scopes.js";

// Validate required environment variables
const requiredEnvVars = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_SECRET_KEY: process.env.SHOPIFY_SECRET_KEY,
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
      "Please set these variables in your .env file or environment."
  );
}

// Initialize session storage
const sessionStorage = new PrismaSessionStorage();

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_SECRET_KEY,
  scopes: getShopifyScopes(),
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, "").replace(
    /\/$/,
    ""
  ),
  hostScheme: process.env.SHOPIFY_APP_URL.startsWith("https") ? "https" : "http",
  apiVersion: ApiVersion.April26,
  isEmbeddedApp: true,
  sessionStorage,
  logger: {
    level: LogSeverity.Info,
  },
});

/**
 * Authenticate a Shopify admin request
 * This checks for valid session and shop parameter
 */
export async function authenticate(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    throw new Error("Shop parameter is required");
  }

  // Load session from storage
  const session = await sessionStorage.loadSession(shop);

  if (!session || !session.accessToken) {
    throw new Error("No valid session found for shop: " + shop);
  }

  // Check if session is expired (for online sessions)
  if (session.expires && new Date() > new Date(session.expires)) {
    await sessionStorage.deleteSession(shop);
    throw new Error("Session expired for shop: " + shop);
  }

  // Return authenticated clients
  return {
    session,
    admin: {
      rest: new shopify.clients.Rest({ session }),
      graphql: new shopify.clients.Graphql({ session }),
    },
    shop: session.shop,
  };
}

/**
 * Verify if a shop has a valid session
 */
export async function hasValidSession(shop) {
  try {
    const session = await sessionStorage.loadSession(shop);

    if (!session || !session.accessToken) {
      return false;
    }

    // Check if session is expired
    if (session.expires && new Date() > new Date(session.expires)) {
      await sessionStorage.deleteSession(shop);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking session validity:", error);
    return false;
  }
}

export function extractBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1] || "";
}

function getShopFromSessionTokenPayload(payload) {
  if (!payload?.dest) {
    return "";
  }

  try {
    const destination = new URL(payload.dest);
    return normalizeShopDomain(destination.hostname);
  } catch {
    return normalizeShopDomain(String(payload.dest).replace(/^https?:\/\//i, ""));
  }
}

function getExpectedShopifyAudience() {
  return process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || "";
}

function getIssuerShop(payload) {
  if (!payload?.iss) {
    return "";
  }

  const issuerValue = String(payload.iss);

  try {
    const issuer = new URL(issuerValue);

    if (!issuer.pathname.startsWith("/admin")) {
      return "";
    }

    return normalizeShopDomain(issuer.hostname);
  } catch {
    const cleanedIssuer = issuerValue.replace(/^https?:\/\//i, "");
    const [hostname, ...pathParts] = cleanedIssuer.split("/");

    if (pathParts[0] !== "admin") {
      return "";
    }

    return normalizeShopDomain(hostname);
  }
}

function validateSessionTokenPayload(payload, { shop } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const clockSkewSeconds = 5;
  const tokenShop = getShopFromSessionTokenPayload(payload);
  const issuerShop = getIssuerShop(payload);
  const expectedShop = normalizeShopDomain(shop);
  const expectedAudience = getExpectedShopifyAudience();

  if (!Number.isFinite(Number(payload?.exp)) || Number(payload.exp) <= now - clockSkewSeconds) {
    return { valid: false, status: 401, reason: "expired_session_token", shop: tokenShop };
  }

  if (!Number.isFinite(Number(payload?.nbf)) || Number(payload.nbf) > now + clockSkewSeconds) {
    return { valid: false, status: 401, reason: "session_token_not_active", shop: tokenShop };
  }

  if (!expectedAudience || payload?.aud !== expectedAudience) {
    return { valid: false, status: 403, reason: "session_token_audience_mismatch", shop: tokenShop };
  }

  if (!tokenShop) {
    return { valid: false, status: 401, reason: "missing_token_destination", shop: "" };
  }

  if (!issuerShop || issuerShop !== tokenShop) {
    return { valid: false, status: 401, reason: "session_token_issuer_mismatch", shop: tokenShop };
  }

  if (expectedShop && tokenShop !== expectedShop) {
    return { valid: false, status: 403, reason: "session_token_shop_mismatch", shop: tokenShop };
  }

  return { valid: true, status: 200, reason: null, shop: tokenShop };
}

export async function decodeShopifySessionToken(token, { shop } = {}) {
  if (!token) {
    return {
      valid: false,
      status: 401,
      reason: "missing_session_token",
      shop: "",
      payload: null,
    };
  }

  try {
    const payload = await shopify.session.decodeSessionToken(token);
    const payloadValidation = validateSessionTokenPayload(payload, { shop });

    if (!payloadValidation.valid) {
      return {
        ...payloadValidation,
        valid: false,
        payload,
      };
    }

    return {
      valid: true,
      status: 200,
      reason: null,
      shop: payloadValidation.shop,
      payload,
    };
  } catch (error) {
    console.error("Shopify session token verification failed:", error);
    return {
      valid: false,
      status: 401,
      reason: "invalid_session_token",
      shop: "",
      payload: null,
    };
  }
}

export async function verifyShopifySessionToken(request, { shop } = {}) {
  return decodeShopifySessionToken(extractBearerToken(request), { shop });
}

/**
 * Begin OAuth flow
 */
export async function beginAuth(shop, callbackPath = "/api/shopify/auth/callback") {
  const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const shopDomain = cleanShop.includes(".myshopify.com")
    ? cleanShop
    : `${cleanShop}.myshopify.com`;

  const authQuery = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY,
    scope: getShopifyScopeString(),
    redirect_uri: `${process.env.SHOPIFY_APP_URL}${callbackPath}`,
    state: shopDomain,
    grant_options: "per-user", // For online access mode
  }).toString();

  return `https://${shopDomain}/admin/oauth/authorize?${authQuery}`;
}

/**
 * Complete OAuth flow and exchange code for access token
 */
export async function completeAuth(code, shop) {
  const shopDomain = shop.endsWith(".myshopify.com")
    ? shop
    : `${shop}.myshopify.com`;

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(
      `https://${shopDomain}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_SECRET_KEY,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to exchange code for token: ${tokenResponse.status}`
      );
    }

    const tokenData = await tokenResponse.json();

    // Create session object
    const session = {
      shop: shopDomain,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      isOnline: false,
      expires: null,
    };

    // Store the session
    await sessionStorage.storeSession(session);

    // Also store in AppInstallation table
    await upsertShopInstallation(session);

    return session;
  } catch (error) {
    console.error("Error completing auth:", error);
    throw error;
  }
}

function buildAppUrl(path) {
  return new URL(path, process.env.SHOPIFY_APP_URL).toString();
}

/**
 * Register webhooks for a shop
 */
export async function registerWebhooks(session) {
  try {
    const webhooks = [
      {
        topic: "ORDERS_CREATE",
        address: buildAppUrl("/api/webhooks/giftcard-redeem"),
        format: "json",
      },
      {
        topic: "APP_UNINSTALLED",
        address: buildAppUrl("/api/shopify/webhooks/uninstall"),
        format: "json",
      },
    ];

    const client = new shopify.clients.Graphql({ session });

    for (const webhook of webhooks) {
      const response = await client.query({
        data: {
          query: `
            mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
              webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
                webhookSubscription {
                  id
                  topic
                  format
                  endpoint {
                    __typename
                    ... on WebhookHttpEndpoint {
                      callbackUrl
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            topic: webhook.topic,
            webhookSubscription: {
              callbackUrl: webhook.address,
              format: webhook.format.toUpperCase(),
            },
          },
        },
      });

      if (response.body.data.webhookSubscriptionCreate.userErrors.length > 0) {
        console.error(
          "Webhook registration errors:",
          response.body.data.webhookSubscriptionCreate.userErrors
        );
      } else {
        console.log(`Webhook registered: ${webhook.topic}`);
      }
    }
  } catch (error) {
    console.error("Error registering webhooks:", error);
  }
}

/**
 * Verify Shopify webhook
 */
export async function verifyWebhook(request, body) {
  const shop = request.headers.get("x-shopify-shop-domain");

  if (!shop || !body) {
    return { valid: false, shop: shop || null, reason: "missing_required_data" };
  }

  try {
    const validation = await shopify.webhooks.validate({
      rawBody: body,
      rawRequest: {
        headers: Object.fromEntries(request.headers.entries()),
        method: request.method,
        url: request.url,
        originalUrl: request.url,
      },
    });

    return {
      valid: Boolean(validation?.valid),
      shop,
      reason: validation?.reason ?? null,
    };
  } catch (error) {
    console.error("Webhook verification error:", error);
    return { valid: false, shop, reason: "verification_failed" };
  }
}

export default shopify;
export const apiVersion = ApiVersion.April26;
export { sessionStorage };
