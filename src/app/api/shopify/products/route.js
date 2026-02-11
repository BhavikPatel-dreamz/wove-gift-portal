import { NextResponse } from 'next/server';
import { 
  createShopifyProduct, 
  createMultipleShopifyProducts, 
  createGiftCardProduct 
} from '@/lib/shopify-product-creator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, type = 'single', productData, productsData, giftCardData } = body;

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop domain is required' },
        { status: 400 }
      );
    }

    // Ensure shop domain is properly formatted
    const shopDomain = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;

    let result;

    switch (type) {
      case 'single':
        if (!productData) {
          return NextResponse.json(
            { error: 'productData is required for single product creation' },
            { status: 400 }
          );
        }
        result = await createShopifyProduct(shopDomain, productData);
        break;

      case 'multiple':
        if (!productsData || !Array.isArray(productsData)) {
          return NextResponse.json(
            { error: 'productsData array is required for multiple product creation' },
            { status: 400 }
          );
        }
        result = await createMultipleShopifyProducts(shopDomain, productsData);
        break;

      case 'gift-card':
        if (!giftCardData) {
          return NextResponse.json(
            { error: 'giftCardData is required for gift card creation' },
            { status: 400 }
          );
        }
        result = await createGiftCardProduct(shopDomain, giftCardData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "single", "multiple", or "gift-card"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Product creation API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create product(s)',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return example usage and documentation
  return NextResponse.json({
    message: 'Shopify Product Creator API',
    usage: {
      endpoint: '/api/shopify/products',
      method: 'POST',
      types: {
        single: {
          description: 'Create a single product',
          body: {
            shop: 'your-shop.myshopify.com',
            type: 'single',
            productData: {
              title: 'Product Title',
              descriptionHtml: '<p>Product description</p>',
              productType: 'Gift Card',
              price: 25.00,
              vendor: 'Your Vendor',
              status: 'DRAFT', // or 'ACTIVE'
              tags: ['tag1', 'tag2'],
              seo: {
                title: 'SEO Title',
                description: 'SEO Description'
              },
              images: [
                {
                  src: 'https://example.com/image.jpg',
                  altText: 'Image description'
                }
              ]
            }
          }
        },
        multiple: {
          description: 'Create multiple products in batch',
          body: {
            shop: 'your-shop.myshopify.com',
            type: 'multiple',
            productsData: [
              // Array of product data objects
            ]
          }
        },
        'gift-card': {
          description: 'Create a gift card product with predefined settings',
          body: {
            shop: 'your-shop.myshopify.com',
            type: 'gift-card',
            giftCardData: {
              title: 'Gift Card',
              description: 'Gift card description',
              amount: 50.00,
              amounts: [25, 50, 100], // For multiple variants
              tags: ['custom-tag']
            }
          }
        }
      }
    },
    examples: {
      singleProduct: {
        shop: 'demo-shop.myshopify.com',
        type: 'single',
        productData: {
          title: 'Premium Gift Card',
          descriptionHtml: '<p>A beautiful premium gift card perfect for any occasion.</p>',
          productType: 'Gift Card',
          vendor: 'Wove Gift Portal',
          status: 'DRAFT',
          price: 50.00,
          tags: ['gift-card', 'premium']
        }
      },
      giftCard: {
        shop: 'demo-shop.myshopify.com',
        type: 'gift-card',
        giftCardData: {
          title: 'Multi-Value Gift Card',
          description: 'Choose from multiple denominations',
          amounts: [25, 50, 100, 200],
          tags: ['multi-value']
        }
      }
    }
  });
}