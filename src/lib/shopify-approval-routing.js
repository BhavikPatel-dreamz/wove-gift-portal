import { redirect } from "next/navigation";

function getSearchParam(searchParams, key) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export function buildShopifyPath(pathname, searchParams, shop) {
  const params = new URLSearchParams();
  const shopParam = shop || getSearchParam(searchParams, "shop");
  const host = getSearchParam(searchParams, "host");
  const embedded = getSearchParam(searchParams, "embedded");

  if (shopParam) {
    params.set("shop", shopParam);
  }

  if (host) {
    params.set("host", host);
  }

  if (embedded) {
    params.set("embedded", embedded);
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function redirectToApprovalPending(searchParams, shop) {
  redirect(buildShopifyPath("/shopify/approval-pending", searchParams, shop));
}
