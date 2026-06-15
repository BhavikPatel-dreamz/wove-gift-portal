import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhook } from "@/lib/shopify.server";
import { normalizeShopDomain } from "@/lib/shopify-installation";

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
    const body = await request.text();
    const verification = await verifyWebhook(request, body);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const shopDomain = normalizeShopDomain(verification.shop);

    if (!shopDomain) {
      return NextResponse.json(
        { success: false, error: "Missing shop domain" },
        { status: 400 },
      );
    }

    const [sessionResult, installationResult, brandResult] = await Promise.allSettled([
      prisma.shopifySession.deleteMany({
        where: { shop: shopDomain },
      }),
      prisma.appInstallation.deleteMany({
        where: { shop: shopDomain },
      }),
      prisma.brand.updateMany({
        where: buildBrandShopWhere(shopDomain),
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      }),
    ]);

    const sessionsDeleted =
      sessionResult.status === "fulfilled" ? sessionResult.value.count : 0;
    const installationsDeleted =
      installationResult.status === "fulfilled" ? installationResult.value.count : 0;
    const brandsUpdated =
      brandResult.status === "fulfilled" ? brandResult.value.count : 0;

    const errors = [
      sessionResult.status === "rejected"
        ? `shopifySession cleanup failed: ${String(sessionResult.reason)}`
        : null,
      installationResult.status === "rejected"
        ? `appInstallation cleanup failed: ${String(installationResult.reason)}`
        : null,
      brandResult.status === "rejected"
        ? `brand cleanup failed: ${String(brandResult.reason)}`
        : null,
    ].filter(Boolean);

    console.log("Shopify uninstall webhook processed", {
      shop: shopDomain,
      sessionsDeleted,
      installationsDeleted,
      brandsUpdated,
      hadCleanupErrors: errors.length > 0,
    });

    if (errors.length > 0) {
      console.error("Shopify uninstall cleanup warnings", {
        shop: shopDomain,
        errors,
      });
    }

    return NextResponse.json({
      success: true,
      shop: shopDomain,
      deleted: {
        sessions: sessionsDeleted,
        installations: installationsDeleted,
      },
      disabled: {
        brands: brandsUpdated,
      },
      warnings: errors,
    });
  } catch (error) {
    console.error("Error handling Shopify uninstall webhook:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process uninstall webhook",
        details: error.message,
      },
      { status: 200 },
    );
  }
}
