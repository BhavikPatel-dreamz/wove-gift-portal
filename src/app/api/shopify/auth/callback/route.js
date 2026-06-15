import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PrismaSessionStorage } from '@/lib/session-storage';
import {
  fetchShopInfo,
} from '@/lib/action/shopify';
import {
  normalizeShopDomain,
  upsertShopInstallation,
} from '@/lib/shopify-installation';
import {
  verifyOAuthState,
  verifyShopifyOAuthHmac,
} from '@/lib/shopify/oauth';

const sessionStorage = new PrismaSessionStorage();

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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Extract query parameters
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    const state = searchParams.get('state');
    const authStateValidation = verifyOAuthState(state);

    if (!verifyShopifyOAuthHmac(searchParams)) {
      return NextResponse.json({ error: 'Invalid Shopify OAuth signature' }, { status: 401 });
    }

    if (!authStateValidation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid OAuth state',
          reason: authStateValidation.reason,
        },
        { status: 401 },
      );
    }

    const authState = authStateValidation.payload;
    const installSource = authState.source === 'admin' ? 'admin' : 'public';
    const requestedShop = shop || authState.shop;
    
    if (!code || !requestedShop) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Ensure shop domain is properly formatted
    const shopDomain = normalizeShopDomain(requestedShop);
    const stateShopDomain = normalizeShopDomain(authState.shop);

    if (!shopDomain) {
      return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 });
    }

    if (stateShopDomain && stateShopDomain !== shopDomain) {
      return NextResponse.json({ error: 'OAuth shop mismatch' }, { status: 401 });
    }
    
    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_SECRET_KEY,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      let brand = null;

      // [Wove] Get all vendors on app install
      try {
        const accessToken = tokenData.access_token;
        const shopName = shopDomain;

        const shopSyncResult = await fetchShopInfo(accessToken, shopName);
        brand = shopSyncResult?.brand ?? null;
        // await fetchGiftCardProducts(accessToken, shopName);
        // await fetchAllVendors(accessToken, shopName);
        // await fetchGiftCardInventory(accessToken, shopName);

      } catch (e) {
        console.error("Error fetching data from Shopify:", e);
      }
      // [/Wove]
      
      
      // Create session object
      const session = {
        shop: shopDomain,
        accessToken: tokenData.access_token,
        scope: tokenData.scope,
        isOnline: false, // For public apps, this is typically false
        expires: null, // Public app tokens don't expire
      };

      // Store the session data using existing session storage utility
      await sessionStorage.storeSession(session);
      
      // Also store in AppInstallation table for tracking and approval workflow
      await upsertShopInstallation(session);

      if (!brand) {
        brand = await findBrandForShop(session.shop);
      }

      const redirectParams = new URLSearchParams({
        shop: session.shop,
      });

      const redirectHost = host || authState.host;

      if (redirectHost) {
        redirectParams.set('host', redirectHost);
      }

      // Explicitly preserve embedded context for Shopify Admin App view.
      redirectParams.set('embedded', '1');

      if (brand?.id) {
        redirectParams.set('brandId', brand.id);
      }

      let redirectUrl;
      if (installSource === 'admin' || brand) {
        redirectUrl = `/shopify/dashboard?${redirectParams.toString()}`;
      } else {
        redirectUrl = `/shopify/dashboard?${redirectParams.toString()}`;
      }

      const finalRedirectUrl = new URL(redirectUrl, process.env.SHOPIFY_APP_URL || request.url);
      return NextResponse.redirect(finalRedirectUrl);
      
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      throw tokenError;
    }
    
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
