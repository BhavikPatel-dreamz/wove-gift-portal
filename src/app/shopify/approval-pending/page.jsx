import { redirect } from "next/navigation";
import ApprovalPendingState from "@/components/shopify/ApprovalPendingState";
import { buildShopifyPath } from "@/lib/shopify-approval-routing";
import { getShopPageAccess } from "@/lib/shopify-page-access";

export default async function ShopifyApprovalPendingPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const accessState = await getShopPageAccess(resolvedSearchParams?.shop);

  if (!accessState.hasShop) {
    redirect("/shopify/install");
  }

  if (!accessState.hasValidSession) {
    redirect(`/shopify/auth-required?shop=${accessState.shop}`);
  }

  if (!accessState.access?.requiresApproval) {
    redirect(buildShopifyPath("/shopify/dashboard", resolvedSearchParams, accessState.shop));
  }

  return (
    <ApprovalPendingState
      shop={accessState.shop}
      brandName={accessState.access.brand?.brandName}
      installedAt={accessState.access.installedAt}
    />
  );
}
