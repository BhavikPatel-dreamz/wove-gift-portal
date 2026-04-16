import { NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/shopify.server';
import {
  getShopInstallationAccess,
  normalizeShopDomain,
} from '@/lib/shopify-installation';

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

    const access = await getShopInstallationAccess(shopDomain);

    return NextResponse.json({
      success: true,
      shop: shopDomain,
      approved: access.approved,
      approvalStatus: access.approvalStatus,
      requiresApproval: access.requiresApproval,
      installedAt: access.installedAt,
      approvedAt: access.approvedAt,
      brand: access.brand,
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
