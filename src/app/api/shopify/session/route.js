import { NextResponse } from "next/server";
import { normalizeShopDomain } from "@/lib/shopify-installation";
import {
  extractBearerToken,
  verifyShopifySessionToken,
} from "@/lib/shopify.server";
import { ensureShopifyInstallData } from "@/lib/shopify/installBootstrap";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = normalizeShopDomain(searchParams.get("shop"));

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Shop parameter is required" },
      { status: 400 },
    );
  }

  let tokenValidation;
  try {
    tokenValidation = await verifyShopifySessionToken(request, { shop });
  } catch (err) {
    console.error("Session token verification error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to verify session token" },
      { status: 401 },
    );
  }

  if (!tokenValidation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid Shopify session token",
        reason: tokenValidation.reason,
        shop,
      },
      { status: tokenValidation.status },
    );
  }

  const bootstrap = await ensureShopifyInstallData({
    shop: tokenValidation.shop,
    idToken: extractBearerToken(request),
  });

  return NextResponse.json({
    success: true,
    shop: tokenValidation.shop,
    sessionReady: Boolean(bootstrap.session?.accessToken),
    installationReady: Boolean(bootstrap.session?.accessToken),
    bootstrapError: bootstrap.error || null,
  });
}
