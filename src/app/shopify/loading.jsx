import ShopifyTransitionLoader from "@/components/shopify/ShopifyTransitionLoader";

export default function ShopifyLoading() {
  return (
    <ShopifyTransitionLoader
      title="Loading your Shopify workspace"
      description="We are checking the store session and preparing the dashboard."
      steps={["Verify store session", "Sync Shopify data", "Open dashboard"]}
    />
  );
}
