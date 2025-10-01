# Shopify Product Creator & Gift Card Manager

This module provides comprehensive functionality for creating Shopify products and managing gift cards using the stored Shopify session from your Wove Gift Portal application.

## Features

### Product Creator
- ✅ Create single products
- ✅ Create multiple products in batch
- ✅ Create gift card products with predefined settings
- ✅ Support for product variants (multiple denominations)
- ✅ SEO optimization fields
- ✅ Image support
- ✅ Error handling and validation
- ✅ Rate limiting protection
- ✅ Command-line interface
- ✅ REST API endpoint

### Gift Card Manager
- ✅ Create, view, and manage gift cards through web interface
- ✅ Command line tools for batch operations
- ✅ Direct integration with Shopify's Gift Card API
- ✅ Local database tracking for enhanced analytics
- ✅ Automatic customer creation and assignment
- ✅ Gift card statistics and reporting

## Files Structure

```
src/lib/shopify-product-creator.js    # Core product creation functions
src/app/api/shopify/products/route.js # REST API endpoint
src/app/api/shopify/gift-cards/       # Gift card API endpoints
src/app/shopify/main/                 # Gift card web interface
scripts/create-shopify-product.js     # Command-line script for products
scripts/gift-card-manager.js          # Command-line script for gift cards
scripts/examples/                     # Example configuration files
  ├── single-gift-card.json          # Single gift card with variants
  └── multiple-occasion-cards.json   # Multiple themed gift cards
```

## Prerequisites

1. Shopify app must be installed on the target store
2. Valid Shopify session must exist in the database
3. Required environment variables:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_SECRET_KEY`
   - `SHOPIFY_APP_URL`

## Usage

### 1. Programmatic Usage

```javascript
import { 
  createShopifyProduct, 
  createMultipleShopifyProducts, 
  createGiftCardProduct 
} from '@/lib/shopify-product-creator';

// Create a single product
const product = await createShopifyProduct('mystore.myshopify.com', {
  title: 'Premium Gift Card',
  descriptionHtml: '<p>Perfect for any occasion</p>',
  productType: 'Gift Card',
  price: 50.00,
  status: 'ACTIVE'
});

// Create a gift card with multiple denominations
const giftCard = await createGiftCardProduct('mystore.myshopify.com', {
  title: 'Multi-Value Gift Card',
  description: 'Choose your amount',
  amounts: [25, 50, 100, 200]
});

// Create multiple products
const results = await createMultipleShopifyProducts('mystore.myshopify.com', [
  { title: 'Product 1', /* ... */ },
  { title: 'Product 2', /* ... */ }
]);
```

### 2. REST API Usage

**Endpoint:** `POST /api/shopify/products`

#### Create Single Product
```bash
curl -X POST http://localhost:3000/api/shopify/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "shop": "mystore.myshopify.com",
    "type": "single",
    "productData": {
      "title": "Premium Gift Card",
      "descriptionHtml": "<p>Perfect for any occasion</p>",
      "productType": "Gift Card",
      "price": 50.00,
      "status": "ACTIVE"
    }
  }'
```

#### Create Gift Card
```bash
curl -X POST http://localhost:3000/api/shopify/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "shop": "mystore.myshopify.com",
    "type": "gift-card",
    "giftCardData": {
      "title": "Multi-Value Gift Card",
      "description": "Choose your amount",
      "amounts": [25, 50, 100, 200]
    }
  }'
```

#### Create Multiple Products
```bash
curl -X POST http://localhost:3000/api/shopify/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "shop": "mystore.myshopify.com",
    "type": "multiple",
    "productsData": [
      {
        "title": "Birthday Gift Card",
        "descriptionHtml": "<p>Perfect for birthdays</p>",
        "productType": "Gift Card",
        "price": 30.00
      },
      {
        "title": "Wedding Gift Card",
        "descriptionHtml": "<p>Perfect for weddings</p>",
        "productType": "Gift Card",
        "price": 75.00
      }
    ]
  }'
```

### 3. Command Line Usage

```bash
# Basic usage
node scripts/create-shopify-product.js --shop mystore.myshopify.com --title "My Gift Card" --price 25.00

# Use example data
node scripts/create-shopify-product.js --shop mystore.myshopify.com --example

# Create gift card with multiple denominations
node scripts/create-shopify-product.js --shop mystore.myshopify.com --type gift-card --title "Multi-Value Gift Card"

# Create from configuration file
node scripts/create-shopify-product.js --shop mystore.myshopify.com --config scripts/examples/single-gift-card.json

# Create multiple products from configuration
node scripts/create-shopify-product.js --shop mystore.myshopify.com --type multiple --config scripts/examples/multiple-occasion-cards.json

# Advanced options
node scripts/create-shopify-product.js \\
  --shop mystore.myshopify.com \\
  --title "Premium Gift Card" \\
  --description "<p>A beautiful premium gift card</p>" \\
  --price 50.00 \\
  --product-type "Gift Card" \\
  --status "ACTIVE" \\
  --tags "gift-card,premium,digital"
```

#### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--shop <domain>` | Shopify shop domain (required) | - |
| `--type <type>` | Creation type: single, multiple, gift-card | single |
| `--title <title>` | Product title | Default Gift Card |
| `--description <desc>` | Product description (HTML) | Default description |
| `--price <price>` | Product price | 25.00 |
| `--product-type <type>` | Product type | Gift Card |
| `--status <status>` | Product status: DRAFT or ACTIVE | DRAFT |
| `--tags <tags>` | Comma-separated tags | gift-card |
| `--example` | Use example data | false |
| `--config <file>` | Load data from JSON file | - |
| `--help` | Show help message | - |

## Product Data Structure

### Basic Product Object
```javascript
{
  title: "Product Title",                    // Required
  descriptionHtml: "<p>Description</p>",     // Required
  productType: "Gift Card",                  // Required
  vendor: "Wove Gift Portal",               // Optional
  status: "DRAFT" | "ACTIVE",               // Optional, default: DRAFT
  price: 25.00,                             // For single variant
  compareAtPrice: 30.00,                    // Optional
  inventoryQuantity: 100,                   // Optional, default: 0
  tags: ["tag1", "tag2"],                   // Optional
  seo: {                                    // Optional
    title: "SEO Title",
    description: "SEO Description"
  },
  images: [{                                // Optional
    src: "https://example.com/image.jpg",
    altText: "Image description"
  }],
  variants: [{                              // Optional, for multiple variants
    price: 25.00,
    title: "$25 Gift Card",
    sku: "GC-25",
    inventoryQuantity: 1000,
    options: ["$25"]
  }]
}
```

### Gift Card Data Object
```javascript
{
  title: "Gift Card Title",                 // Optional
  description: "Gift card description",     // Optional
  amount: 50.00,                           // For single amount
  amounts: [25, 50, 100, 200],            // For multiple amounts
  tags: ["custom-tag"],                    // Optional additional tags
  images: [{                               // Optional
    src: "https://example.com/image.jpg",
    altText: "Gift card image"
  }]
}
```

## Error Handling

The functions include comprehensive error handling:

- **Session Validation**: Checks if Shopify session exists for the shop
- **Required Field Validation**: Validates required product fields
- **Shopify API Errors**: Handles and reports Shopify API validation errors
- **Rate Limiting**: Includes delays between batch operations
- **Detailed Error Messages**: Provides specific error information

## Examples

### Example Responses

#### Single Product Success
```javascript
{
  success: true,
  data: {
    id: "gid://shopify/Product/123456789",
    title: "Premium Gift Card",
    handle: "premium-gift-card",
    status: "DRAFT",
    createdAt: "2023-01-01T00:00:00Z",
    // ... additional product data
  }
}
```

#### Multiple Products Success
```javascript
{
  success: true,
  data: {
    results: [
      { index: 0, success: true, product: { /* product data */ } },
      { index: 1, success: false, error: "Error message" }
    ],
    successCount: 1,
    errorCount: 1,
    errors: [
      { index: 1, error: "Error message" }
    ]
  }
}
```

### Configuration File Examples

See the `scripts/examples/` directory for complete configuration file examples:

- `single-gift-card.json` - Single gift card with multiple variants
- `multiple-occasion-cards.json` - Multiple themed gift cards

## Rate Limiting

The batch creation function includes a 500ms delay between products to avoid Shopify's rate limits. For high-volume operations, consider:

- Using Shopify's Bulk Operations API for large datasets
- Implementing exponential backoff for retries
- Monitoring your API call limits

## Security Notes

- Shop domains are validated and sanitized
- All GraphQL queries use parameterized inputs
- Session tokens are securely stored in the database
- Error messages don't expose sensitive information

## Troubleshooting

### Common Issues

1. **"No session found for shop"**
   - Ensure the Shopify app is installed on the target store
   - Check if the session exists in the database

2. **"Missing required field"**
   - Verify all required fields are provided: title, descriptionHtml, productType

3. **Shopify API errors**
   - Check if the product data meets Shopify's validation requirements
   - Ensure the access token has the required permissions (write_products)

4. **Rate limiting**
   - Reduce batch size or increase delays between requests
   - Monitor your API call limits in Shopify Partner Dashboard

### Debug Mode

To enable debug logging, set the environment variable:
```bash
DEBUG=shopify-product-creator node scripts/create-shopify-product.js
```

## Contributing

When contributing to this module:

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for any API changes
4. Test with actual Shopify stores before submitting

## License

This module is part of the Wove Gift Portal application and follows the same license terms.

---

# Gift Card Manager

## Overview

The Gift Card Manager provides comprehensive gift card management for your Shopify store through both web interface and command line tools.

## Getting Started

### Web Interface

1. Navigate to `/shopify` in your application
2. Enter your Shopify store domain (e.g., `yourstore.myshopify.com`)
3. Complete the Shopify app installation process
4. Access the gift card management interface at `/shopify/main`

### Command Line Interface

#### Create a Gift Card
```bash
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=create \
  --value=50.00 \
  --email=customer@example.com \
  --note="Welcome gift card"
```

#### List All Gift Cards
```bash
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=list \
  --format=table
```

#### Get Gift Card Details
```bash
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=get \
  --code=GIFT123ABC
```

#### View Gift Card Statistics
```bash
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=stats \
  --format=json
```

#### Disable a Gift Card
```bash
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=disable \
  --code=GIFT123ABC
```

## Gift Card API Endpoints

### GET /api/shopify/gift-cards
Fetch all gift cards for a shop
```bash
curl "https://yourapp.com/api/shopify/gift-cards?shop=yourstore.myshopify.com"
```

### POST /api/shopify/gift-cards/create
Create a new gift card
```bash
curl -X POST "https://yourapp.com/api/shopify/gift-cards/create" \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "yourstore.myshopify.com",
    "initialValue": 50.00,
    "customerEmail": "customer@example.com",
    "note": "Welcome gift"
  }'
```

### GET /api/shopify/shop
Get shop information
```bash
curl "https://yourapp.com/api/shopify/shop?shop=yourstore.myshopify.com"
```

## Command Line Options

- `--shop` (required): Your Shopify store domain
- `--action` (required): Action to perform (create, list, get, update, disable, stats)
- `--value`: Gift card value for create action
- `--email`: Customer email (optional)
- `--code`: Gift card code for get/update/disable actions
- `--note`: Gift card note (optional)
- `--expires`: Expiration date in YYYY-MM-DD format (optional)
- `--format`: Output format (table, json) - default is table

## Examples

### Bulk Gift Card Creation
```bash
#!/bin/bash
# Create 10 gift cards with $25 value each

for i in {1..10}; do
  node scripts/gift-card-manager.js \
    --shop=yourstore.myshopify.com \
    --action=create \
    --value=25.00 \
    --note="Bulk gift card #$i"
  sleep 1  # Rate limiting
done
```

### Export Gift Card Data
```bash
# Export all gift cards to JSON
node scripts/gift-card-manager.js \
  --shop=yourstore.myshopify.com \
  --action=list \
  --format=json > gift-cards-export.json
```