import { redirect } from "next/navigation";
import { redirectToApprovalPending } from "@/lib/shopify-approval-routing";
import { getShopPageAccess } from "@/lib/shopify-page-access";
import SettlementsPageClient from "./SettlementsPageClient";

export default async function ShopifySettlementsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const accessState = await getShopPageAccess(resolvedSearchParams?.shop);

  if (!accessState.hasShop) {
    redirect("/shopify/install");
  }

  if (!accessState.hasValidSession) {
    redirect(`/shopify/auth-required?shop=${accessState.shop}`);
  }

  if (accessState.access?.requiresApproval) {
    redirectToApprovalPending(resolvedSearchParams, accessState.shop);
  }

  return <SettlementsPageClient />;
}
