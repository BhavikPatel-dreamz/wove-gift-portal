import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  console.log(shop);

  try {
    // Create authorization URL manually for App Router compatibility
    const authQuery = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY,
      scope: 'read_products,write_products,read_orders,write_orders',
      redirect_uri: `${process.env.SHOPIFY_APP_URL}api/shopify/auth/callback`,
      state: shop, // Use shop as state for simplicity
      response_type: 'code',
    }).toString();

    const authUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?${authQuery}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}