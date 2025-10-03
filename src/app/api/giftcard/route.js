import { NextResponse } from "next/server";
import fetch from "node-fetch";
import prisma from "../../../lib/db";

const SHOPIFY_API_VERSION = "2025-07";

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    if (!shop) {
      return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 });
    }

    const input = await req.json();
    if (!input?.initialValue) {
      return NextResponse.json({ error: "initialValue is required" }, { status: 400 });
    }
    if (!input?.customerEmail) {
      return NextResponse.json({ error: "customerEmail is required" }, { status: 400 });
    }

    const amount = parseFloat(input.initialValue);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount value" }, { status: 400 });
    }

   
    
    // Fetch stored access token
    const session = await prisma.appInstallation.findUnique({ where: { shop } });
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Shop not installed or access token missing" }, { status: 401 });
    }

     console.log("***********",session);

    let customerId = null;

    // Step 1: Try to get customer by email (removed email from response)
    const customerResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({
        query: `
          query getCustomerByEmail($query: String!) {
            customers(first: 1, query: $query) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: { query: `email:${input.customerEmail}` },
      }),
    });

    const customerData = await customerResponse.json();
    
    // Check for errors
    if (customerData.errors) {
      console.error("Customer query errors:", customerData.errors);
    }
    
    customerId = customerData?.data?.customers?.edges?.[0]?.node?.id || null;

    // Step 2: If customer not found, create a new customer
    if (!customerId) {
      const createCustomerResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken,
        },
        body: JSON.stringify({
          query: `
            mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer {
                  id
                }
                userErrors { field message }
              }
            }
          `,
          variables: {
            input: {
              email: input.customerEmail,
              firstName: input.firstName || "Gift",
              lastName: input.lastName || "Customer",
            },
          },
        }),
      });

      const createCustomerData = await createCustomerResponse.json();
      
      // Check for errors
      if (createCustomerData.errors) {
        console.error("Customer creation errors:", createCustomerData.errors);
      }
      
      customerId = createCustomerData?.data?.customerCreate?.customer?.id;

      console.log("createCustomerData", createCustomerData);

      if (!customerId) {
        return NextResponse.json({
          success: false,
          error: "Failed to create customer in Shopify",
          details: createCustomerData?.data?.customerCreate?.userErrors || createCustomerData.errors,
        }, { status: 400 });
      }
    }

    console.log("customerId", customerId);
    
    // Step 3: Prepare input for gift card
    const formattedInput = {
      initialValue: parseFloat(amount.toFixed(2)),
      note: input.note || null,
      expiresOn: input.expiresAt || null,
      customerId: customerId,
    };

    // Step 4: Create gift card in Shopify (removed email from response)
    const createGiftCardResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({
        query: `
          mutation giftCardCreate($input: GiftCardCreateInput!) {
            giftCardCreate(input: $input) {
              giftCard {
                id
                maskedCode
                initialValue { amount currencyCode }
                balance { amount currencyCode }
                createdAt
                expiresOn
                note
                customer {
                  id
                }
              }
              userErrors { field message code }
            }
          }
        `,
        variables: { input: formattedInput },
      }),
    });

    const createData = await createGiftCardResponse.json();
    
    // Check for errors but don't fail if it's just the email warning
    if (createData.errors) {
      console.warn("Gift card creation warnings:", createData.errors);
      // Only fail if there's no gift card data
      if (!createData?.data?.giftCardCreate?.giftCard) {
        return NextResponse.json({
          success: false,
          error: "Failed to create gift card",
          details: createData.errors,
        }, { status: 400 });
      }
    }
    
    const giftCard = createData?.data?.giftCardCreate?.giftCard;
    const userErrors = createData?.data?.giftCardCreate?.userErrors || [];

    console.log("createData", createData);

    if (!giftCard) {
      return NextResponse.json({
        success: false,
        errors: userErrors.length ? userErrors : ["Unknown error creating gift card"],
      }, { status: 400 });
    }

    // Step 5: Save to local DB (store the customer email from input)
    try {
      await prisma.giftCard.create({
        data: {
          shop: shop,
          shopifyId: giftCard.id,
          code: giftCard.maskedCode,
          initialValue: parseFloat(giftCard.initialValue.amount),
          balance: parseFloat(giftCard.balance.amount),
          note: giftCard.note,
          expiresAt: giftCard.expiresOn ? new Date(giftCard.expiresOn) : null,
          isVirtual: true,
          isActive: true,
          // Store customer email from input if you have this field in your schema
          customerEmail: input.customerEmail,
        },
      });
    } catch (dbError) {
      console.error("Error saving gift card to DB:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Gift card created and email sent to customer by Shopify",
      gift_card: {
        ...giftCard,
        // Include customer email from input for response
        customerEmail: input.customerEmail,
      },
    });

  } catch (error) {
    console.error("Error creating gift card:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 });
    }

    const giftCards = await prisma.giftCard.findMany({
      where: {
        shop: shop,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, giftCards });
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}