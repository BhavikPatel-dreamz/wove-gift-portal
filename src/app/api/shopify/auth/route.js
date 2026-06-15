import { NextResponse } from 'next/server';
import { createOAuthState } from '@/lib/shopify/oauth';
import { normalizeShopDomain } from '@/lib/shopify-installation';
import { getShopifyScopeString } from '@/lib/shopify/scopes';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const source = searchParams.get('source') || 'public';
  const host = searchParams.get('host') || '';
  const embedded = searchParams.get('embedded') || '';
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    const shopDomain = normalizeShopDomain(shop);

    if (!shopDomain) {
      return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 });
    }

    // Create authorization URL manually for App Router compatibility
    const appUrl = process.env.SHOPIFY_APP_URL.replace(/\/$/, '');
    const authQuery = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY,
      scope: getShopifyScopeString(),
      redirect_uri: `${appUrl}/api/shopify/auth/callback`,
      state: createOAuthState({
        shop: shopDomain,
        source,
        host,
        embedded,
      }),
      response_type: 'code',
    }).toString();

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?${authQuery}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
