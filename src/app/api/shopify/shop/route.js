import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
    }

    // Get Shopify session
    const session = await prisma.shopifySession.findUnique({
      where: { shop }
    });

    if (!session) {
      return NextResponse.json({ error: 'Shop not authenticated' }, { status: 401 });
    }

    // Fetch shop info from Shopify
    const shopInfo = await fetchShopInfo(shop, session.accessToken);

    return NextResponse.json({
      success: true,
      shop: shopInfo
    });

  } catch (error) {
    console.error('Error fetching shop info:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch shop info', 
      details: error.message 
    }, { status: 500 });
  }
}

async function fetchShopInfo(shop, accessToken) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.shop.id,
      name: data.shop.name,
      email: data.shop.email,
      domain: data.shop.domain,
      province: data.shop.province,
      country: data.shop.country,
      currency: data.shop.currency,
      timezone: data.shop.timezone,
      plan: data.shop.plan_name,
    };

  } catch (error) {
    console.error('Error fetching shop info:', error);
    return {
      name: shop,
      domain: shop,
    };
  }
}