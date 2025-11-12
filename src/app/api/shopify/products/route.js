import { NextResponse } from "next/server";
import { getShopifyClient } from "../../../../lib/shopify-auth";

// CREATE a product
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  let shop = searchParams.get("shop");

  if (shop) {
    shop = shop.replace(/\/$/, "");
  }

  if (!shop) {
    return NextResponse.json(
      { error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  try {
    const productData = await request.json();
    const { graphql } = await getShopifyClient(shop);

    // Remove variants from productData if it exists, as it's not a valid field on ProductInput
    const { variants, ...cleanProductData } = productData;

    const createProductMutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            descriptionHtml
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
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

    const data = await graphql.request(createProductMutation, {
      variables: {
        input: cleanProductData,
      },
    });

    if (data.data.productCreate.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.data.productCreate.userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data.productCreate.product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Error creating product" },
      { status: 500 }
    );
  }
}

// READ product(s)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let shop = searchParams.get("shop");
  const id = searchParams.get("id");

  if (shop) {
    shop = shop.replace(/\/$/, "");
  }

  if (!shop) {
    return NextResponse.json(
      { error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  try {
    const { graphql } = await getShopifyClient(shop);

    if (id) {
      // Fetch a single product
      const getProductQuery = `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            handle
            descriptionHtml
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
                }
              }
            }
          }
        }
      `;

      const data = await graphql.request(getProductQuery, {
        variables: {
          id: id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`,
        },
      });

      if (!data.data.product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(data.data.product);
    } else {
      // Fetch all products
      const getProductsQuery = `
        query getProducts {
          products(first: 10) {
            edges {
              node {
                id
                title
                handle
                descriptionHtml
                status
              }
            }
          }
        }
      `;

      const data = await graphql.request(getProductsQuery);

      return NextResponse.json(
        data.data.products.edges.map((edge) => edge.node)
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching data" },
      { status: 500 }
    );
  }
}

// UPDATE a product
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  let shop = searchParams.get("shop");
  const id = searchParams.get("id");

  if (shop) {
    shop = shop.replace(/\/$/, "");
  }

  if (!shop) {
    return NextResponse.json(
      { error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: "Missing product id parameter" },
      { status: 400 }
    );
  }

  try {
    const productData = await request.json();
    const { graphql } = await getShopifyClient(shop);

    // Remove variants from productData if it exists
    const { variants, ...cleanProductData } = productData;

    const updateProductMutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            handle
            descriptionHtml
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
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

    // Ensure the product ID is in the correct format
    const productId = id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;

    const data = await graphql.request(updateProductMutation, {
      variables: {
        input: {
          id: productId,
          ...cleanProductData,
        },
      },
    });

    if (data.data.productUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.data.productUpdate.userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data.productUpdate.product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Error updating product" },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  let shop = searchParams.get("shop");
  const id = searchParams.get("id");

  if (shop) {
    shop = shop.replace(/\/$/, "");
  }

  if (!shop) {
    return NextResponse.json(
      { error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: "Missing product id parameter" },
      { status: 400 }
    );
  }

  try {
    const { graphql } = await getShopifyClient(shop);

    const deleteProductMutation = `
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Ensure the product ID is in the correct format
    const productId = id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;

    const data = await graphql.request(deleteProductMutation, {
      variables: {
        input: {
          id: productId,
        },
      },
    });

    if (data.data.productDelete.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.data.productDelete.userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedProductId: data.data.productDelete.deletedProductId,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: error.message || "Error deleting product" },
      { status: 500 }
    );
  }
}