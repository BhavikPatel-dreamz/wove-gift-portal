export const DEFAULT_SHOPIFY_SCOPES = [
  "read_customers",
  "write_customers",
  "read_gift_card_transactions",
  "read_products",
  "write_products",
  "read_orders",
  "write_orders",
  "read_gift_cards",
  "write_gift_cards",
];

export function getShopifyScopes() {
  const configuredScopes =
    process.env.SCOPES || process.env.SHOPIFY_SCOPES || "";

  const scopes = configuredScopes
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  return scopes.length ? [...new Set(scopes)] : DEFAULT_SHOPIFY_SCOPES;
}

export function getShopifyScopeString() {
  return getShopifyScopes().join(",");
}
