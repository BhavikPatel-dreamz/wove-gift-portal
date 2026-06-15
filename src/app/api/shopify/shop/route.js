import { NextResponse } from 'next/server';
import {
  extractBearerToken,
  hasValidSession,
  verifyShopifySessionToken,
} from '@/lib/shopify.server';
import {
  getShopInstallationAccess,
  normalizeShopDomain,
} from '@/lib/shopify-installation';
import { ensureShopifyInstallData } from '@/lib/shopify/installBootstrap';

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
    const tokenValidation = await verifyShopifySessionToken(request, {
      shop: shopDomain,
    });

    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Shopify session token',
          reason: tokenValidation.reason,
          requiresAuth: true,
          shop: shopDomain,
        },
        { status: tokenValidation.status }
      );
    }

    let validSession = await hasValidSession(shopDomain);

    if (!validSession) {
      const bootstrap = await ensureShopifyInstallData({
        shop: tokenValidation.shop,
        idToken: extractBearerToken(request),
      });

      validSession = await hasValidSession(tokenValidation.shop);

      if (!validSession) {
        return NextResponse.json(
          {
            success: false,
            error: 'Shop not authenticated',
            requiresAuth: true,
            shop: tokenValidation.shop,
            reason: bootstrap.error || 'missing_offline_access_token',
          },
          { status: 401 }
        );
      }
    }

    const access = await getShopInstallationAccess(tokenValidation.shop);

    return NextResponse.json({
      success: true,
      shop: tokenValidation.shop,
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
      },
      { status: 500 }
    );
  }
}
