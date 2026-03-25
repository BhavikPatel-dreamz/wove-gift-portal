import { NextResponse } from 'next/server';

function normalizeShopDomain(shop) {
  return shop
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/\.myshopify\.com$/i, '')
    .concat('.myshopify.com')
    .toLowerCase();
}

function encodeAuthState(payload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const source = searchParams.get('source') || 'public';
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    const shopDomain = normalizeShopDomain(shop);

    // Create authorization URL manually for App Router compatibility
    const appUrl = process.env.SHOPIFY_APP_URL.replace(/\/$/, '');
    const authQuery = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY,
      scope: 'read_products,write_products,read_orders,write_orders,read_gift_cards,write_gift_cards',
      redirect_uri: `${appUrl}/api/shopify/auth/callback`,
      state: encodeAuthState({
        shop: shopDomain,
        source,
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
