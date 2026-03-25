import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PrismaSessionStorage } from '@/lib/session-storage';
import {
  fetchShopInfo,
} from '@/lib/action/shopify';

const sessionStorage = new PrismaSessionStorage();

function decodeAuthState(state) {
  if (!state) {
    return {};
  }

  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return { shop: state };
  }
}

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
    const authState = decodeAuthState(state);
    const installSource = authState.source === 'admin' ? 'admin' : 'public';
    const requestedShop = shop || authState.shop;
    
    if (!code || !requestedShop) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Ensure shop domain is properly formatted
    const shopDomain = requestedShop.endsWith('.myshopify.com') ? requestedShop : `${requestedShop}.myshopify.com`;
    
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
      
      // Also store in AppInstallation table for tracking
      await prisma.appInstallation.upsert({
        where: { shop: session.shop },
        update: {
          accessToken: session.accessToken,
          scopes: session.scope,
          isActive: true,
        },
        create: {
          shop: session.shop,
          accessToken: session.accessToken,
          scopes: session.scope,
          isActive: true,
        },
      });

      if (!brand) {
        brand = await findBrandForShop(session.shop);
      }

      let redirectUrl;
      if (installSource === 'admin' && brand) {
        redirectUrl = `/brandsPartner/edit/${brand.id}`;
      } else if (brand) {
        // If brand exists, redirect to the Shopify dashboard with brand context
        // Note: /brandsPartner/edit/ is an admin route that requires a separate login session.
        // After Shopify OAuth we only have a Shopify session, so we stay within /shopify/ routes.
        redirectUrl = `/shopify/dashboard?shop=${session.shop}${host ? `&host=${host}` : ''}&brandId=${brand.id}`;
      } else {
        // Otherwise, redirect to the Shopify dashboard
        redirectUrl = `/shopify/dashboard?shop=${session.shop}${host ? `&host=${host}` : ''}`;
      }

      const finalRedirectUrl = new URL(redirectUrl, process.env.SHOPIFY_APP_URL || request.url);
      return NextResponse.redirect(finalRedirectUrl);
      
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      throw tokenError;
    }
    
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error.message 
    }, { status: 500 });
  }
}
