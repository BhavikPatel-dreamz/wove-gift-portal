import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { completeAuth, registerWebhooks } from '@/lib/shopify.server.js';
import {
  fetchShopInfo,
} from '@/lib/action/shopify';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Extract query parameters
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    
    if (!code || !shop) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    try {
      // Use the centralized auth completion function
      const session = await completeAuth(code, shop);

      // [Wove] Get all vendors on app install
      try {
        const accessToken = session.accessToken;
        const shopName = session.shop;

        await fetchShopInfo(accessToken, shopName);
        // await fetchGiftCardProducts(accessToken, shopName);
        // await fetchAllVendors(accessToken, shopName);
        // await fetchGiftCardInventory(accessToken, shopName);

      } catch (e) {
        console.error("Error fetching data from Shopify:", e);
      }
      // [/Wove]

      // Register webhooks after successful installation
      try {
        await registerWebhooks(session);
      } catch (webhookError) {
        console.error('Webhook registration error:', webhookError);
        // Don't fail the installation if webhooks fail
      }

      // Find brand by shop domain to redirect appropriately
      const brand = await prisma.brand.findFirst({
        where: {
          domain: session.shop,
        },
      });

      let redirectUrl;
      if (brand) {
        // If brand exists, redirect to Shopify dashboard
        redirectUrl = `/shopify/dashboard?shop=${session.shop}${host ? `&host=${host}` : ''}`;
      } else {
        // Otherwise, redirect to the main app page
        redirectUrl = `/shopify/dashboard?shop=${session.shop}${host ? `&host=${host}` : ''}`;
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url));
      
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
