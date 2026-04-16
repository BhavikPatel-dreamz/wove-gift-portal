import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  ApiVersion,
  LogSeverity,
  
} from "@shopify/shopify-api";
import { PrismaSessionStorage } from "./session-storage.js";
import { upsertShopInstallation } from "./shopify-installation.js";

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
  scopes: process.env.SCOPES?.split(",") || [
    "read_products",
    "write_products",
    "read_orders",
    "write_orders",
    "read_gift_cards",
    "write_gift_cards",
    "read_customers",
    "write_customers",
    "read_gift_card_transactions",
  ],
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, "").replace(
    /\/$/,
    ""
  ),
  hostScheme: process.env.SHOPIFY_APP_URL.startsWith("https") ? "https" : "http",
  apiVersion: ApiVersion.April24,
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
    scope: (
      process.env.SCOPES ||
      "read_products,write_products,read_orders,write_orders,read_gift_cards,write_gift_cards,read_customers,write_customers"
    ),
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
export const apiVersion = ApiVersion.April24;
export { sessionStorage };
