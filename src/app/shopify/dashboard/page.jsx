import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { redirectToApprovalPending } from "@/lib/shopify-approval-routing";
import { getShopPageAccess } from "@/lib/shopify-page-access";
import { ensureShopifyInstallData } from "@/lib/shopify/installBootstrap";
import { decodeShopifySessionToken } from "@/lib/shopify.server";
import DashboardClient from "./DashboardClient";

function isLikelyShopifyAdminHost(hostValue) {
  if (!hostValue) {
    return false;
  }

  try {
    const decoded = Buffer.from(hostValue, "base64").toString("utf8");
    return decoded.startsWith("admin.shopify.com/store/");
  } catch {
    return false;
  }
}

function getSearchParam(searchParams, key) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function buildDashboardUrl(searchParams, shop) {
  const redirectParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => redirectParams.append(key, item));
    } else if (value) {
      redirectParams.set(key, value);
    }
  }

  redirectParams.set("shop", shop);

  if (!redirectParams.get("embedded")) {
    redirectParams.set("embedded", "1");
  }

  return `/shopify/dashboard?${redirectParams.toString()}`;
}

async function getValidTokenShop(idToken, shop) {
  if (!idToken) {
    return "";
  }

  const tokenValidation = await decodeShopifySessionToken(idToken, { shop });
  return tokenValidation.valid ? tokenValidation.shop : "";
}

export default async function ShopifyDashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const requestHeaders = await headers();
  const queryShop = getSearchParam(resolvedSearchParams, "shop");
  const idToken = getSearchParam(resolvedSearchParams, "id_token");
  const tokenShop = await getValidTokenShop(idToken, queryShop);
  const shop = queryShop || tokenShop;
  const forwardedHost =
    requestHeaders.get("x-shopify-host") ||
    getSearchParam(resolvedSearchParams, "host");
  const forwardedEmbedded =
    requestHeaders.get("x-shopify-embedded") ||
    getSearchParam(resolvedSearchParams, "embedded");
  const isEmbeddedAdmin = forwardedEmbedded === "1" && isLikelyShopifyAdminHost(forwardedHost);

  if (!queryShop && tokenShop) {
    redirect(buildDashboardUrl(resolvedSearchParams, tokenShop));
  }

  // Only allow dashboard rendering from Shopify embedded context or a verified
  // Shopify session token during managed-install bootstrap.
  if (!isEmbeddedAdmin && !tokenShop) {
    redirect("/shopify/auth-required");
  }

  if (idToken && tokenShop) {
    await ensureShopifyInstallData({
      shop: tokenShop,
      idToken,
    });
  }

  const accessState = await getShopPageAccess(shop);

  if (!accessState.hasShop) {
    redirect("/shopify/install");
  }

  if (!accessState.hasValidSession) {
    if (isEmbeddedAdmin) {
      return <DashboardClient />;
    }

    redirect(`/shopify/auth-required?shop=${accessState.shop}`);
  }

  if (accessState.access?.requiresApproval) {
    redirectToApprovalPending(resolvedSearchParams, accessState.shop);
  }

  return <DashboardClient />;
}
