import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhook } from '@/lib/shopify.server';
import { normalizeShopDomain } from '@/lib/shopify-installation';

function buildBrandShopWhere(shopDomain) {
  return {
    OR: [
      { domain: shopDomain },
      {
        website: {
          in: [shopDomain, `https://${shopDomain}`, `http://${shopDomain}`],
        },
      },
    ],
  };
}

export async function POST(request) {
  try {
    const rawBody = await request.text();

    const { valid, shop } = await verifyWebhook(request, rawBody);

    const shopDomain = normalizeShopDomain(shop);

    if (!valid || !shopDomain) {
      console.warn('Invalid uninstall webhook or missing shop header');
      return NextResponse.json({ success: false, error: 'Invalid webhook' }, { status: 401 });
    }

    const [sessions, installations, brands] = await Promise.all([
      prisma.shopifySession.deleteMany({ where: { shop: shopDomain } }),
      prisma.appInstallation.deleteMany({ where: { shop: shopDomain } }),
      prisma.brand.updateMany({
        where: buildBrandShopWhere(shopDomain),
        data: { isActive: false },
      }),
    ]);

    console.log('Handled app/uninstalled for shop:', {
      shop: shopDomain,
      sessionsDeleted: sessions.count,
      installationsDeleted: installations.count,
      brandsDisabled: brands.count,
    });

    return NextResponse.json({
      success: true,
      deleted: {
        sessions: sessions.count,
        installations: installations.count,
      },
      disabled: {
        brands: brands.count,
      },
    });
  } catch (error) {
    console.error('app-uninstalled handler error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
