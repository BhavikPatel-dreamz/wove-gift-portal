import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhook } from "@/lib/shopify.server";

function normalizeShopDomain(shop) {
  if (!shop) {
    return "";
  }

  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "");

  if (!cleaned) {
    return "";
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
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

    const [sessionResult, installationResult, brandResult] = await Promise.all([
      prisma.shopifySession.deleteMany({
        where: { shop: shopDomain },
      }),
      prisma.appInstallation.deleteMany({
        where: { shop: shopDomain },
      }),
      prisma.brand.deleteMany({
        where: { domain: shopDomain },
      }),
    ]);

    console.log("Shopify uninstall webhook processed", {
      shop: shopDomain,
      sessionsDeleted: sessionResult.count,
      installationsDeleted: installationResult.count,
    });

    return NextResponse.json({
      success: true,
      shop: shopDomain,
      deleted: {
        sessions: sessionResult.count,
        installations: installationResult.count,
      },
    });
  } catch (error) {
    console.error("Error handling Shopify uninstall webhook:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process uninstall webhook",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
