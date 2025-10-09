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
      return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 });
    }

    const input = await req.json();
    if (!input?.customerEmail) {
      return NextResponse.json({ error: "customerEmail is required" }, { status: 400 });
    }
    if (!denominationType) {
      return NextResponse.json({ error: "denominationType is required" }, { status: 400 });
    }

    // Fetch stored access token
    const session = await prisma.appInstallation.findUnique({ where: { shop } });
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Shop not installed or access token missing" }, { status: 401 });
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
      return NextResponse.json({ success: false, error: "No active voucher found for this denominationType" }, { status: 400 });
    }

    const voucher = brand.vouchers[0];

    let denominationValue;
    let selectedDenomId = null;
    let expiresAt = null;

    // Handle fixed vs variable vouchers
    if (voucher.denominationType === "fixed") {
      if (!voucher.denominations.length) {
        return NextResponse.json({ success: false, error: "No active denominations found for this voucher" }, { status: 400 });
      }

      const selectedDenom = voucher.denominations.find(d => d.value === input.denominationValue);
      if (!selectedDenom) {
        return NextResponse.json({ success: false, error: "Selected denomination not found" }, { status: 400 });
      }

      denominationValue = selectedDenom.value;
      selectedDenomId = selectedDenom.id;
      expiresAt = selectedDenom.expiresAt || null; // Use denomination expiry
    } else {
      if (!input.denominationValue) {
        return NextResponse.json({ success: false, error: "Denomination value is required for variable vouchers" }, { status: 400 });
      }
      denominationValue = input.denominationValue;
      expiresAt = voucher.expiresAt || null; // Use voucher expiry for variable
    }

    // Step 2: Fetch or create Shopify customer
    let customerId = null;

    const customerResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": session.accessToken },
      body: JSON.stringify({
        query: `
          query getCustomerByEmail($query: String!) {
            customers(first: 1, query: $query) { edges { node { id } } }
          }
        `,
        variables: { query: `email:${input.customerEmail}` },
      }),
    });

    const customerData = await customerResponse.json();
    customerId = customerData?.data?.customers?.edges?.[0]?.node?.id || null;

    if (!customerId) {
      const createCustomerResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": session.accessToken },
        body: JSON.stringify({
          query: `
            mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) { customer { id } userErrors { field message } }
            }
          `,
          variables: { input: { email: input.customerEmail, firstName: input.firstName || "Gift", lastName: input.lastName || "Customer" } },
        }),
      });

      const createCustomerData = await createCustomerResponse.json();
      customerId = createCustomerData?.data?.customerCreate?.customer?.id;

      if (!customerId) {
        return NextResponse.json({
          success: false,
          error: "Failed to create customer in Shopify",
          details: createCustomerData?.data?.customerCreate?.userErrors || createCustomerData.errors,
        }, { status: 400 });
      }
    }

    // Step 3: Prepare Shopify gift card input
    const formattedInput = {
      initialValue: parseFloat(denominationValue.toFixed(2)),
      note: input.note || null,
      expiresOn: expiresAt ? new Date(expiresAt).toISOString().split("T")[0] : null, // ✅ Correct expiry
      customerId,
    };

    // Step 4: Create gift card in Shopify
    const createGiftCardResponse = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": session.accessToken },
      body: JSON.stringify({
        query: `
          mutation giftCardCreate($input: GiftCardCreateInput!) {
            giftCardCreate(input: $input) {
              giftCard { id maskedCode initialValue { amount currencyCode } balance { amount currencyCode } createdAt expiresOn note customer { id } }
              userErrors { field message code }
            }
          }
        `,
        variables: { input: formattedInput },
      }),
    });

    const createData = await createGiftCardResponse.json();
    const giftCard = createData?.data?.giftCardCreate?.giftCard;

    if (!giftCard) {
      return NextResponse.json({
        success: false,
        error: "Failed to create gift card in Shopify",
        details: createData?.data?.giftCardCreate?.userErrors || createData.errors,
      }, { status: 400 });
    }

    // Step 5: Save to local DB
    const newLocalGiftCard = await prisma.giftCard.create({
      data: {
        shop,
        shopifyId: giftCard.id,
        code: giftCard.maskedCode,
        initialValue: parseFloat(giftCard.initialValue.amount),
        balance: parseFloat(giftCard.balance.amount),
        note: giftCard.note,
        expiresAt: giftCard.expiresOn ? new Date(giftCard.expiresOn) : null,
        isVirtual: true,
        isActive: true,
        customerEmail: input.customerEmail,
        denominationId: selectedDenomId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gift card created successfully",
      gift_card: { ...giftCard, localId: newLocalGiftCard.id, denominationId: selectedDenomId || null },
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