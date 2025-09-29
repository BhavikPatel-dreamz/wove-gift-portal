import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PrismaSessionStorage } from '@/lib/session-storage';

const sessionStorage = new PrismaSessionStorage();

export async function GET(request) {
  console.log('Shopify callback request:', request.url);
  
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Extract query parameters
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    
    if (!code || !shop) {
      console.error('Missing required parameters:', { code: !!code, shop: !!shop });
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    console.log('Processing callback for shop:', shop);
    
    // Ensure shop domain is properly formatted
    const shopDomain = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    console.log('Shop domain:', shopDomain);
    
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

      console.log('Session stored successfully for shop:', session.shop);
      
      // Redirect to success page or app
      const redirectUrl = `/?shop=${session.shop}${host ? `&host=${host}` : ''}`;
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