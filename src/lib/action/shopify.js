import prisma from '../db';

const getShopifyDomain = (shop) => {
  let domain = shop.trim();

  // Remove http:// or https://
  if (domain.startsWith('https://')) {
    domain = domain.substring(8);
  } else if (domain.startsWith('http://')) {
    domain = domain.substring(7);
  }

  // Remove trailing /
  if (domain.endsWith('/')) {
    domain = domain.slice(0, -1);
  }

  // If it's not a FQDN, assume it's a .myshopify.com domain
  if (!domain.includes('.')) {
    domain = `${domain}.myshopify.com`;
  }

  return domain;
};

export const fetchShopInfo = async (accessToken, shopName) => {
  const shopDomain = getShopifyDomain(shopName);
  const response = await fetch(`https://${shopDomain}/admin/api/2023-10/shop.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shop info: ${response.status}`);
  }

  const shopData = await response.json();
  console.log("Shop Information:", shopData.shop);
  await saveBrandFromShopify(shopData.shop);
  return shopData.shop;
};

export const saveBrandFromShopify = async (shopData) => {
  const { myshopify_domain, name, email } = shopData;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  try {
    const brand = await prisma.brand.upsert({
      where: { brandName: name },
      update: {
        website: myshopify_domain,
        contact: email,
      },
      create: {
        brandName: name,
        slug: slug,
        logo: '/placeholder.png', // Placeholder logo
        description: 'No description available.', // Placeholder description
        website: myshopify_domain,
        contact: email,
        categoryName: 'Default', // Placeholder category
      },
    });
    console.log(`Successfully saved/updated brand info for ${name}`);
    return brand;
  } catch (error) {
    console.error(`Failed to save brand info for ${name}:`, error);
    throw error;
  }
};


export const fetchGiftCardProducts = async (accessToken, shopName) => {
  const shopDomain = getShopifyDomain(shopName);
  let allGiftCardProducts = [];
  let cursor = null;
  let hasNextPage = true;

  const query = `
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor, query:"product_type:'Gift Card'") {
        edges {
          node {
            id
            title
            description
            status
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  title
                }
              }
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

  while(hasNextPage) {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { cursor }
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Error fetching Shopify gift card products:", result.errors);
      break;
    }

    if (result.data && result.data.products) {
      allGiftCardProducts = allGiftCardProducts.concat(result.data.products.edges.map(edge => edge.node));
      hasNextPage = result.data.products.pageInfo.hasNextPage;
      cursor = result.data.products.pageInfo.endCursor;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`All Gift Card Products for ${shopName}:`, allGiftCardProducts);
  return allGiftCardProducts;
};

export const fetchAllVendors = async (accessToken, shopName) => {
  const shopDomain = getShopifyDomain(shopName);
  let allVendors = new Set();
  let cursor = null;
  let hasNextPage = true;

  const query = `
    query getProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        edges {
          node {
            vendor
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  while(hasNextPage) {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { cursor }
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Error fetching Shopify vendors:", result.errors);
      break;
    }

    if (result.data && result.data.products) {
      result.data.products.edges.forEach(edge => {
        if(edge.node.vendor) {
          allVendors.add(edge.node.vendor);
        }
      });
      hasNextPage = result.data.products.pageInfo.hasNextPage;
      cursor = result.data.products.pageInfo.endCursor;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`All Vendors for ${shopName}:`, Array.from(allVendors));
  return Array.from(allVendors);
};

export const fetchGiftCardInventory = async (accessToken, shopName) => {
  const shopDomain = getShopifyDomain(shopName);
  let allGiftCards = [];
  let cursor = null;
  let hasNextPage = true;

  const query = `
    query getGiftCards($cursor: String) {
      giftCards(first: 250, after: $cursor) {
        edges {
          node {
            id
            balance {
              amount
              currencyCode
            }
            lastCharacters
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  while(hasNextPage) {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { cursor }
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Error fetching Shopify gift card inventory:", result.errors);
      break;
    }

    if (result.data && result.data.giftCards) {
      allGiftCards = allGiftCards.concat(result.data.giftCards.edges.map(edge => edge.node));
      hasNextPage = result.data.giftCards.pageInfo.hasNextPage;
      cursor = result.data.giftCards.pageInfo.endCursor;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`All Gift Card Inventory for ${shopName}:`, allGiftCards);
  return allGiftCards;
};