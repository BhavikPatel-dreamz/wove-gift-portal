import shopify from './shopify.js';
import { PrismaSessionStorage } from './session-storage.js';

const sessionStorage = new PrismaSessionStorage();

/**
 * Create a product in Shopify using the stored session
 * @param {string} shopDomain - The shop domain (e.g., 'mystore.myshopify.com')
 * @param {Object} productData - The product data object
 * @returns {Promise<Object>} - The created product data
 */
export async function createShopifyProduct(shopDomain, productData) {
  try {
    // Load the session for the shop
    const session = await sessionStorage.loadSession(shopDomain);
    
    if (!session) {
      throw new Error(`No session found for shop: ${shopDomain}`);
    }

    // Create a GraphQL client instance
    const client = new shopify.clients.Graphql({ session });

    // Validate required product data
    const requiredFields = ['title', 'descriptionHtml', 'productType'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Build the product input object
    const productInput = {
      title: productData.title,
      descriptionHtml: productData.descriptionHtml,
      productType: productData.productType,
      vendor: productData.vendor || 'Wove Gift Portal',
      status: productData.status || 'DRAFT',
      tags: productData.tags || [],
      options: productData.options || ['Title'],
    };

    // Add SEO fields if provided
    if (productData.seo) {
      productInput.seo = {
        title: productData.seo.title,
        description: productData.seo.description,
      };
    }

    // Add images if provided
    if (productData.images && productData.images.length > 0) {
      productInput.images = productData.images.map(image => ({
        src: image.src,
        altText: image.altText || productData.title,
      }));
    }

    // Add variants if provided
    if (productData.variants && productData.variants.length > 0) {
      productInput.variants = productData.variants.map(variant => ({
        price: variant.price.toString(),
        compareAtPrice: variant.compareAtPrice ? variant.compareAtPrice.toString() : null,
        sku: variant.sku || null,
        inventoryQuantity: variant.inventoryQuantity || 0,
        inventoryManagement: variant.inventoryManagement || 'SHOPIFY',
        inventoryPolicy: variant.inventoryPolicy || 'DENY',
        requiresShipping: variant.requiresShipping !== false,
        taxable: variant.taxable !== false,
        weight: variant.weight || 0,
        weightUnit: variant.weightUnit || 'GRAMS',
        options: variant.options || ['Default Title'],
      }));
    } else {
      // Default variant if none provided
      productInput.variants = [{
        price: productData.price ? productData.price.toString() : '0.00',
        compareAtPrice: productData.compareAtPrice ? productData.compareAtPrice.toString() : null,
        inventoryQuantity: productData.inventoryQuantity || 0,
        inventoryManagement: 'SHOPIFY',
        inventoryPolicy: 'DENY',
        requiresShipping: true,
        taxable: true,
        weight: 0,
        weightUnit: 'GRAMS',
      }];
    }

    // GraphQL mutation to create product
    const createProductMutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            createdAt
            updatedAt
            vendor
            productType
            tags
            descriptionHtml
            seo {
              title
              description
            }
            images(first: 10) {
              edges {
                node {
                  id
                  src
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                  inventoryQuantity
                  weight
                  weightUnit
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Execute the mutation
    const response = await client.query({
      data: {
        query: createProductMutation,
        variables: {
          input: productInput,
        },
      },
    });


    if (response.body.data.productCreate.userErrors.length > 0) {
      throw new Error(
        `Shopify API errors: ${response.body.data.productCreate.userErrors
          .map(error => `${error.field}: ${error.message}`)
          .join(', ')}`
      );
    }

    const createdProduct = response.body.data.productCreate.product;

    return createdProduct;

  } catch (error) {
    console.error('Error creating Shopify product:', error);
    throw error;
  }
}

/**
 * Create multiple products in batch
 * @param {string} shopDomain - The shop domain
 * @param {Array<Object>} productsData - Array of product data objects
 * @returns {Promise<Array<Object>>} - Array of created products
 */
export async function createMultipleShopifyProducts(shopDomain, productsData) {
  const results = [];
  const errors = [];

  for (let i = 0; i < productsData.length; i++) {
    try {
      const product = await createShopifyProduct(shopDomain, productsData[i]);
      results.push({ index: i, success: true, product });
      
      // Add a small delay to avoid rate limiting
      if (i < productsData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error creating product ${i}:`, error);
      errors.push({ index: i, error: error.message });
      results.push({ index: i, success: false, error: error.message });
    }
  }

  return {
    results,
    successCount: results.filter(r => r.success).length,
    errorCount: errors.length,
    errors,
  };
}

/**
 * Helper function to create a gift card product
 * @param {string} shopDomain - The shop domain
 * @param {Object} giftCardData - Gift card specific data
 * @returns {Promise<Object>} - The created gift card product
 */
export async function createGiftCardProduct(shopDomain, giftCardData) {
  const productData = {
    title: giftCardData.title || 'Gift Card',
    descriptionHtml: giftCardData.description || '<p>Give the gift of choice with our digital gift card.</p>',
    productType: 'Gift Card',
    vendor: 'Wove Gift Portal',
    status: 'ACTIVE',
    tags: ['gift-card', 'digital', ...(giftCardData.tags || [])],
    price: giftCardData.amount || 25.00,
    inventoryPolicy: 'CONTINUE', // Gift cards don't track inventory
    requiresShipping: false,
    taxable: false,
    seo: {
      title: giftCardData.seoTitle || `${giftCardData.title || 'Gift Card'} - Wove Gift Portal`,
      description: giftCardData.seoDescription || 'Perfect for any occasion. Our digital gift cards are delivered instantly.',
    },
    images: giftCardData.images || [],
    variants: giftCardData.amounts ? giftCardData.amounts.map(amount => ({
      price: amount,
      title: `$${amount}`,
      inventoryPolicy: 'CONTINUE',
      requiresShipping: false,
      taxable: false,
      options: [`$${amount}`],
    })) : undefined,
  };

  return createShopifyProduct(shopDomain, productData);
}

// Example usage data
export const exampleProductData = {
  basic: {
    title: 'Premium Gift Card',
    descriptionHtml: '<p>A beautiful premium gift card perfect for any occasion.</p>',
    productType: 'Gift Card',
    vendor: 'Wove Gift Portal',
    status: 'DRAFT',
    price: 50.00,
    compareAtPrice: 60.00,
    inventoryQuantity: 100,
    tags: ['gift-card', 'premium', 'digital'],
    seo: {
      title: 'Premium Gift Card - Wove Gift Portal',
      description: 'Premium digital gift card perfect for gifting',
    },
    images: [
      {
        src: 'https://example.com/gift-card-image.jpg',
        altText: 'Premium Gift Card',
      },
    ],
  },
  withVariants: {
    title: 'Multi-Value Gift Card',
    descriptionHtml: '<p>Choose from multiple denominations for the perfect gift amount.</p>',
    productType: 'Gift Card',
    vendor: 'Wove Gift Portal',
    status: 'ACTIVE',
    tags: ['gift-card', 'multi-value'],
    variants: [
      {
        price: 25.00,
        title: '$25 Gift Card',
        sku: 'GC-25',
        inventoryQuantity: 1000,
        options: ['$25'],
      },
      {
        price: 50.00,
        title: '$50 Gift Card',
        sku: 'GC-50',
        inventoryQuantity: 1000,
        options: ['$50'],
      },
      {
        price: 100.00,
        title: '$100 Gift Card',
        sku: 'GC-100',
        inventoryQuantity: 1000,
        options: ['$100'],
      },
    ],
  },
};