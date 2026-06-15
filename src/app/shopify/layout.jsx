import ShopifyClientLayout from "./ShopifyClientLayout";

export const metadata = {
  title: "Shopify App",
};

export default async function ShopifyLayout({ children }) {
  return (
    <ShopifyClientLayout>{children}</ShopifyClientLayout>
  );
}
