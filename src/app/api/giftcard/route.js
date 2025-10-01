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

    const amount = parseFloat(input.initialValue);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount value" }, { status: 400 });
    }

    // Fetch stored access token
    const session = await prisma.appInstallation.findUnique({ where: { shop } });
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Shop not installed or access token missing" }, { status: 401 });
    }

    // Prepare input for Shopify 2025-07
    const formattedInput = {
      initialValue: parseFloat(amount.toFixed(2)), // Decimal
      note: input.note || null,
      expiresOn: input.expiresAt || null
    };

    // Create gift card
    const createResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken
      },
      body: JSON.stringify({
        query: `
          mutation giftCardCreate($input: GiftCardCreateInput!) {
            giftCardCreate(input: $input) {
              giftCard {
                id
                initialValue { amount currencyCode }
                balance { amount currencyCode }
                createdAt
                expiresOn
                note
              }
              userErrors { field message code }
            }
          }
        `,
        variables: { input: formattedInput }
      })
    });

    const createData = await createResponse.json();
    console.log("Gift card create response:", JSON.stringify(createData, null, 2));

    const giftCard = createData?.data?.giftCardCreate?.giftCard;
    const userErrors = createData?.data?.giftCardCreate?.userErrors || [];

    if (!giftCard) {
      return NextResponse.json({
        success: false,
        errors: userErrors.length ? userErrors : ["Unknown error creating gift card"]
      }, { status: 400 });
    }

    // Fetch gift card masked code
    const codeResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken
      },
      body: JSON.stringify({
        query: `
          query getGiftCard($id: ID!) {
            giftCard(id: $id) {
              id
              maskedCode
            }
          }
        `,
        variables: { id: giftCard.id }
      })
    });

    const codeData = await codeResponse.json();
    const maskedCode = codeData?.data?.giftCard?.maskedCode || null;

    return NextResponse.json({
      success: true,
      gift_card: { ...giftCard, maskedCode }
    });

  } catch (error) {
    console.error("Error creating gift card:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
