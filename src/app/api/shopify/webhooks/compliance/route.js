import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhook } from "@/lib/shopify.server";

function normalizeShopDomain(shop) {
  if (!shop) return "";
  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "");

  if (!cleaned) return "";
  return `${cleaned}.myshopify.com`.toLowerCase();
}

export async function POST(request) {
  try {
    const raw = await request.text();
    const verification = await verifyWebhook(request, raw);

    if (!verification.valid) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 401 });
    }

    const topic = (request.headers.get("x-shopify-topic") || "").toLowerCase();
    const shopDomain = normalizeShopDomain(verification.shop);
    const payload = raw ? JSON.parse(raw) : {};

    // Handle compliance topics
    if (topic === "customers/data_request") {
      // Attempt to locate the customer in our DB and return exported data if present
      const email = payload?.customer?.email || payload?.email || payload?.data?.email;
      // Acknowledge the data request — Shopify reads the response status, not the body.
      // Do not return user PII in the response body.
      console.log("customers/data_request received", { shop: shopDomain, hasEmail: Boolean(email) });
      return NextResponse.json({ success: true });
    }

    if (topic === "customers/redact") {
      const email = payload?.customer?.email || payload?.email || payload?.data?.email;
      if (email) {
        const result = await prisma.user.deleteMany({ where: { email } });
        console.log("customers/redact processed", { email, deleted: result.count });
        return NextResponse.json({ success: true, deleted: result.count });
      }

      console.log("customers/redact received but no email provided", { shop: shopDomain });
      return NextResponse.json({ success: true, deleted: 0 });
    }

    if (topic === "shop/redact") {
      // Remove shop-related records similar to uninstall handling
      const [sessions, installations, brands] = await Promise.all([
        prisma.shopifySession.deleteMany({ where: { shop: shopDomain } }),
        prisma.appInstallation.deleteMany({ where: { shop: shopDomain } }),
        prisma.brand.deleteMany({ where: { domain: shopDomain } }),
      ]);

      console.log("shop/redact processed", { shop: shopDomain, sessions: sessions.count, installations: installations.count, brands: brands.count });

      return NextResponse.json({ success: true, deleted: { sessions: sessions.count, installations: installations.count, brands: brands.count } });
    }

    console.log("Unhandled compliance topic", { topic, shop: shopDomain });
    return NextResponse.json({ success: true, message: "ignored topic" });
  } catch (error) {
    console.error("Error handling compliance webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
