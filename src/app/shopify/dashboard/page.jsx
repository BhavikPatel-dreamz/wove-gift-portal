import { redirect } from "next/navigation";
import ApprovalPendingState from "@/components/shopify/ApprovalPendingState";
import { getShopPageAccess } from "@/lib/shopify-page-access";
import DashboardClient from "./DashboardClient";

export default async function ShopifyDashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const accessState = await getShopPageAccess(resolvedSearchParams?.shop);

  if (!accessState.hasShop) {
    redirect("/shopify/install");
  }

  if (!accessState.hasValidSession) {
    redirect(`/shopify/auth-required?shop=${accessState.shop}`);
  }

  if (accessState.access?.requiresApproval) {
    return (
      <ApprovalPendingState
        shop={accessState.shop}
        brandName={accessState.access.brand?.brandName}
        installedAt={accessState.access.installedAt}
      />
    );
  }

  return <DashboardClient />;
}
