import { NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/shopify.server';

function normalizeShopDomain(shop) {
  if (!shop) {
    return '';
  }

  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .replace(/\.myshopify\.com$/i, '');

  if (!cleaned) {
    return '';
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }

    const shopDomain = normalizeShopDomain(shop);
    const validSession = await hasValidSession(shopDomain);

    if (!validSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shop not authenticated',
          requiresAuth: true,
          shop: shopDomain,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      shop: shopDomain,
    });
  } catch (error) {
    console.error('Error checking Shopify shop session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify Shopify session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
