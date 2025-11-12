"use server";

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import prisma from "../../../lib/db";

const SHOPIFY_API_VERSION = "2025-07";

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const denominationType = url.searchParams.get("denominationType");

    if (!shop) {
      return NextResponse.json(
        { error: "Shop parameter is required" },
        { status: 400 }
      );
    }

    const input = await req.json();

    const customerEmail = input?.customerEmail || null;

    if (!denominationType) {
      return NextResponse.json(
        { error: "denominationType is required" },
        { status: 400 }
      );
    }

    // Fetch stored access token
    const session = await prisma.appInstallation.findUnique({
      where: { shop },
    });
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Shop not installed or access token missing" },
        { status: 401 }
      );
    }

    // Step 1: Find brand and voucher
    const brand = await prisma.brand.findUnique({
      where: { domain: shop },
      include: {
        vouchers: {
          where: { isActive: true, denominationType: denominationType },
          include: { denominations: { where: { isActive: true } } },
        },
      },
    });

    if (!brand || !brand.vouchers.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No active voucher found for this denominationType",
        },
        { status: 400 }
      );
    }

    const voucher = brand.vouchers[0];

    let denominationValue;
    let selectedDenomId = null;
    let expiresAt = null;
    let shouldSetExpiry = false;

    // Handle fixed vs variable vouchers
    if (voucher.denominationType === "fixed") {
      if (!voucher.denominations.length) {
        return NextResponse.json(
          {
            success: false,
            error: "No active denominations found for this voucher",
          },
          { status: 400 }
        );
      }

      const selectedDenom = voucher.denominations.find(
        (d) => d.value === input.denominationValue
      );
      if (!selectedDenom) {
        return NextResponse.json(
          { success: false, error: "Selected denomination not found" },
          { status: 400 }
        );
      }

      denominationValue = selectedDenom.value;
      selectedDenomId = selectedDenom.id;

      if (selectedDenom.isExpiry && selectedDenom.expiresAt) {
        shouldSetExpiry = true;
        expiresAt = selectedDenom.expiresAt;
      }
    } else {
      if (!input.denominationValue) {
        return NextResponse.json(
          {
            success: false,
            error: "Denomination value is required for variable vouchers",
          },
          { status: 400 }
        );
      }
      denominationValue = input.denominationValue;

      if (voucher.isExpiry && voucher.expiresAt) {
        shouldSetExpiry = true;
        expiresAt = voucher.expiresAt;
      }
    }

    // Step 2: Fetch or create Shopify customer
    let customerId = null;
    let customerIdNumeric = null;

    if (customerEmail) {
      const customerResponse = await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken,
          },
          body: JSON.stringify({
            query: `
            query getCustomerByEmail($query: String!) {
              customers(first: 1, query: $query) { edges { node { id legacyResourceId } } }
            }
          `,
            variables: { query: `email:${customerEmail}` },
          }),
        }
      );

      const customerData = await customerResponse.json();
      const customerNode = customerData?.data?.customers?.edges?.[0]?.node;
      customerId = customerNode?.id || null;
      customerIdNumeric = customerNode?.legacyResourceId || null;

      if (!customerId) {
        const createCustomerResponse = await fetch(
          `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": session.accessToken,
            },
            body: JSON.stringify({
              query: `
              mutation customerCreate($input: CustomerInput!) {
                customerCreate(input: $input) { 
                  customer { id legacyResourceId } 
                  userErrors { field message } 
                }
              }
            `,
              variables: {
                input: {
                  email: customerEmail,
                  firstName: input.firstName || "Gift",
                  lastName: input.lastName || "Customer",
                },
              },
            }),
          }
        );

        const createCustomerData = await createCustomerResponse.json();
        const createdCustomer =
          createCustomerData?.data?.customerCreate?.customer;
        customerId = createdCustomer?.id;
        customerIdNumeric = createdCustomer?.legacyResourceId;

        if (!customerId) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create customer in Shopify",
              details:
                createCustomerData?.data?.customerCreate?.userErrors ||
                createCustomerData.errors,
            },
            { status: 400 }
          );
        }
      }
    }

    // Step 3: Use REST API to create gift card (returns full code)
    const restApiPayload = {
      gift_card: {
        initial_value: parseFloat(denominationValue.toFixed(2)),
        note: input.note || null,
      },
    };

    // Add expiry date if needed
    if (shouldSetExpiry && expiresAt) {
      restApiPayload.gift_card.expires_on = new Date(expiresAt)
        .toISOString()
        .split("T")[0];
    }

    // Add customer ID if exists (use numeric ID for REST API)
    if (customerIdNumeric) {
      restApiPayload.gift_card.customer_id = parseInt(customerIdNumeric);
    }

    
    const createGiftCardResponse = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/gift_cards.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken,
        },
        body: JSON.stringify(restApiPayload),
      }
    );

    const createData = await createGiftCardResponse.json();

    if (!createData.gift_card) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create gift card in Shopify",
          details: createData.errors || createData,
        },
        { status: 400 }
      );
    }

    const giftCard = createData.gift_card;

    // ✅ REST API returns the FULL CODE
    const fullGiftCardCode = giftCard.code;
    const shopifyGid = `gid://shopify/GiftCard/${giftCard.id}`;


    // Step 4: Save to local DB with full code
    const newLocalGiftCard = await prisma.giftCard.create({
      data: {
        shop,
        shopifyId: shopifyGid,
        code: fullGiftCardCode, // ✅ Store the FULL unmasked code
        initialValue: parseFloat(giftCard.initial_value),
        balance: parseFloat(giftCard.balance),
        note: giftCard.note,
        expiresAt:
          shouldSetExpiry && giftCard.expires_on
            ? new Date(giftCard.expires_on)
            : null,
        isVirtual: true,
        isActive: true,
        customerEmail: customerEmail,
        denominationId: selectedDenomId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gift card created successfully",
      gift_card: {
        id: shopifyGid,
        code: fullGiftCardCode, // ✅ Full unmasked code (e.g., "ABCD-EFGH-IJKL-47e7")
        maskedCode: giftCard.masked_code
          ? giftCard.masked_code
          : `•••• •••• •••• ${giftCard.last_characters}`,
        initialValue: {
          amount: giftCard.initial_value.toString(),
          currencyCode: giftCard.currency,
        },
        balance: {
          amount: giftCard.balance.toString(),
          currencyCode: giftCard.currency,
        },
        createdAt: giftCard.created_at,
        expiresOn: giftCard.expires_on,
        note: giftCard.note,
        customer: customerId ? { id: customerId } : null,
        localId: newLocalGiftCard.id,
        denominationId: selectedDenomId || null,
        hasExpiry: shouldSetExpiry,
      },
    });
  } catch (error) {
    console.error("Error creating gift card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return NextResponse.json(
        { error: "Shop parameter is required" },
        { status: 400 }
      );
    }

    const giftCards = await prisma.giftCard.findMany({
      where: {
        shop: shop,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, giftCards });
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
