/**
 * GraphQL helpers for Shopify Admin API
 * Converts REST API calls to GraphQL queries/mutations
 */

/**
 * Disable a gift card using GraphQL mutation
 */
export async function disableGiftCardGraphQL(shop, accessToken, giftCardId) {
  const mutation = `
    mutation DisableGiftCard($id: ID!) {
      giftCardDisable(input: {id: $id}) {
        giftCard {
          id
          state
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        id: giftCardId, // Ensure it's in gid://shopify/GiftCard/ID format
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL API error: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  if (result.data?.giftCardDisable?.userErrors?.length > 0) {
    throw new Error(`Gift card disable failed: ${JSON.stringify(result.data.giftCardDisable.userErrors)}`);
  }

  return result.data?.giftCardDisable?.giftCard;
}

/**
 * Fetch gift cards using GraphQL query
 */
export async function fetchGiftCardsGraphQL(shop, accessToken, first = 50) {
  const query = `
    query FetchGiftCards($first: Int!) {
      giftCards(first: $first) {
        edges {
          node {
            id
            legacyResourceId
            code
            state
            balance {
              amount
              currencyCode
            }
            createdAt
            lastCharacteristics {
              expiresOn
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { first },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL API error: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return (result.data?.giftCards?.edges || []).map(edge => ({
    id: edge.node.id,
    legacyResourceId: edge.node.legacyResourceId,
    code: edge.node.code,
    state: edge.node.state,
    balance: edge.node.balance.amount,
    currency: edge.node.balance.currencyCode,
    createdAt: edge.node.createdAt,
    expiresOn: edge.node.lastCharacteristics?.expiresOn,
  }));
}

/**
 * Fetch order transactions using GraphQL query
 */
export async function fetchOrderTransactionsGraphQL(shop, accessToken, orderId) {
  // Convert numeric order ID to gid format if needed
  const gidOrderId = orderId.startsWith('gid://') ? orderId : `gid://shopify/Order/${orderId}`;

  const query = `
    query FetchOrderTransactions($id: ID!) {
      order(id: $id) {
        id
        legacyResourceId
        transactions(first: 100) {
          edges {
            node {
              id
              kind
              status
              amountSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              createdAt
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id: gidOrderId },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL API error: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return {
    orderId: result.data?.order?.id,
    legacyOrderId: result.data?.order?.legacyResourceId,
    transactions: (result.data?.order?.transactions?.edges || []).map(edge => ({
      id: edge.node.id,
      kind: edge.node.kind,
      status: edge.node.status,
      amount: edge.node.amountSet?.shopMoney?.amount,
      currency: edge.node.amountSet?.shopMoney?.currencyCode,
      createdAt: edge.node.createdAt,
    })),
  };
}
