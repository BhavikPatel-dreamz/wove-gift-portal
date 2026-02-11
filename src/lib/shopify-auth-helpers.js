import { NextResponse } from 'next/server';
import { authenticate, hasValidSession } from './shopify.server.js';

/**
 * Higher-order function to protect API routes with Shopify authentication
 * Usage in API routes:
 * 
 * export const GET = withShopifyAuth(async (request, { session, admin, shop }) => {
 *   // Your authenticated API logic here
 *   return NextResponse.json({ data: 'your data' });
 * });
 */
export function withShopifyAuth(handler) {
  return async (request) => {
    try {
      // Authenticate the request
      const authData = await authenticate(request);
      
      // Call the handler with request and auth data
      return await handler(request, authData);
    } catch (error) {
      console.error('Shopify auth error:', error);
      
      return NextResponse.json(
        { 
          error: 'Authentication failed', 
          message: error.message,
          requiresAuth: true 
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Verify Shopify request in API routes
 * This is a lighter check that just validates the shop has a session
 */
export async function verifyShopifyRequest(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return {
      valid: false,
      error: 'Shop parameter is required',
      shop: null,
    };
  }

  const isValid = await hasValidSession(shop);

  if (!isValid) {
    return {
      valid: false,
      error: 'No valid session found for shop',
      shop,
    };
  }

  return {
    valid: true,
    shop,
  };
}

/**
 * Lightweight middleware check for Shopify API routes
 * Use this when you just need to verify shop but don't need full auth data
 */
export function requireShopifyShop(handler) {
  return async (request) => {
    const verification = await verifyShopifyRequest(request);

    if (!verification.valid) {
      return NextResponse.json(
        { 
          error: verification.error,
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // Add shop to request for handler
    return await handler(request, verification.shop);
  };
}

/**
 * Get Shopify session from request
 * Use this in API routes when you need session data
 */
export async function getShopifySession(request) {
  try {
    const authData = await authenticate(request);
    return authData.session;
  } catch (error) {
    console.error('Error getting Shopify session:', error);
    return null;
  }
}

/**
 * Get authenticated Shopify admin clients
 */
export async function getShopifyAdmin(request) {
  try {
    const authData = await authenticate(request);
    return authData.admin;
  } catch (error) {
    console.error('Error getting Shopify admin client:', error);
    return null;
  }
}

// export default {
//   withShopifyAuth,
//   requireShopifyShop,
//   verifyShopifyRequest,
//   getShopifySession,
//   getShopifyAdmin,
// };
