"use server";

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { prisma } from "../../../lib/db";

const SHOPIFY_API_VERSION = "2025-07";

export async function POST(req) {
  const startTime = Date.now();
  let logContext = {
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substring(7),
  };

  try {
    // ============ STEP 0: Parse Request Parameters ============
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const denominationType = url.searchParams.get("denominationType");
    const input = await req.json();

    console.log("url", url);

    logContext = {
      ...logContext,
      shop,
      denominationType,
      input: {
        ...input,
        customerEmail: input?.customerEmail || null,
      },
    };

    console.log("🚀 [START] Gift Card Creation Request", logContext);

    // Validate shop parameter
    if (!shop) {
      console.error("❌ [FAIL] Missing shop parameter", logContext);
      return NextResponse.json(
        { error: "Shop parameter is required" },
        { status: 400 }
      );
    }

    const customerEmail = input?.customerEmail || null;

    // Validate denominationType
    if (!denominationType) {
      console.error("❌ [FAIL] Missing denominationType", logContext);
      return NextResponse.json(
        { error: "denominationType is required" },
        { status: 400 }
      );
    }

    // ============ STEP 1: Fetch Access Token ============
    console.log("📋 [STEP 1] Fetching access token from database", {
      ...logContext,
      step: "fetch_session",
    });

    const session = await prisma.appInstallation.findUnique({
      where: { shop },
    });

    if (!session?.accessToken) {
      console.error("❌ [FAIL] No access token found", {
        ...logContext,
        sessionFound: !!session,
        hasAccessToken: !!session?.accessToken,
      });
      return NextResponse.json(
        { error: "Shop not installed or access token missing" },
        { status: 401 }
      );
    }

    console.log("✅ [STEP 1] Access token retrieved successfully");

    // ============ STEP 2: Find Brand and Voucher ============
    console.log("📋 [STEP 2] Fetching brand and vouchers", {
      ...logContext,
      step: "fetch_brand",
      query: {
        domain: shop,
        voucherFilter: {
          isActive: true,
          denominationType: [denominationType, "both"],
        },
      },
    });

    const brand = await prisma.brand.findUnique({
      where: { domain: shop },
      include: {
        vouchers: {
          where: {
            isActive: true,
            OR: [
              { denominationType: denominationType },
              { denominationType: "both" },
            ],
          },
          include: { denominations: { where: { isActive: true } } },
          orderBy: {
            denominationType: "asc", // Prefer specific over 'both'
          },
        },
      },
    });

    console.log("📊 [STEP 2] Brand query result", {
      ...logContext,
      brandFound: !!brand,
      brandId: brand?.id,
      vouchersCount: brand?.vouchers?.length || 0,
      vouchers: brand?.vouchers?.map((v) => ({
        id: v.id,
        denominationType: v.denominationType,
        isActive: v.isActive,
        denominationsCount: v.denominations?.length || 0,
      })),
    });

    if (!brand || !brand.vouchers.length) {
      console.error("❌ [FAIL] No active voucher found", {
        ...logContext,
        brandExists: !!brand,
        vouchersLength: brand?.vouchers?.length || 0,
        requestedDenominationType: denominationType,
      });
      return NextResponse.json(
        {
          success: false,
          error: "No active voucher found for this denominationType",
        },
        { status: 400 }
      );
    }

    const voucher = brand.vouchers[0];

    console.log("✅ [STEP 2] Voucher selected", {
      ...logContext,
      voucherId: voucher.id,
      voucherType: voucher.denominationType,
      denominationsCount: voucher.denominations?.length || 0,
      denominations: voucher.denominations?.map((d) => ({
        id: d.id,
        value: d.value,
        isActive: d.isActive,
        isExpiry: d.isExpiry,
      })),
    });

    // ============ STEP 3: Handle Denomination Logic ============
    console.log("📋 [STEP 3] Processing denomination", {
      ...logContext,
      step: "process_denomination",
      voucherType: voucher.denominationType,
      inputValue: input.denominationValue,
    });

    let denominationValue;
    let selectedDenomId = null;
    let expiresAt = null;
    let shouldSetExpiry = false;

    // Handle fixed vs variable vouchers
    if (voucher.denominationType === "fixed") {
      console.log("🔢 [STEP 3a] Processing FIXED denomination");

      if (!voucher.denominations.length) {
        console.error("❌ [FAIL] No active denominations for fixed voucher", {
          ...logContext,
          voucherId: voucher.id,
        });
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
        console.error("❌ [FAIL] Selected denomination not found", {
          ...logContext,
          requestedValue: input.denominationValue,
          availableDenominations: voucher.denominations.map((d) => d.value),
        });
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

      console.log("✅ [STEP 3a] Fixed denomination processed", {
        denominationValue,
        selectedDenomId,
        shouldSetExpiry,
        expiresAt,
      });
    } else if (voucher.denominationType === "amount") {
      console.log("🔢 [STEP 3b] Processing AMOUNT (variable) denomination");

      if (!input.denominationValue) {
        console.error(
          "❌ [FAIL] Missing denomination value for variable voucher",
          logContext
        );
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

      console.log("✅ [STEP 3b] Variable denomination processed", {
        denominationValue,
        shouldSetExpiry,
        expiresAt,
      });
    } else if (voucher.denominationType === "both") {
      console.log("🔢 [STEP 3c] Processing BOTH (hybrid) denomination");

      if (!input.denominationValue) {
        console.error(
          "❌ [FAIL] Missing denomination value for 'both' voucher",
          logContext
        );
        return NextResponse.json(
          {
            success: false,
            error: "Denomination value is required",
          },
          { status: 400 }
        );
      }

      const selectedDenom = voucher.denominations.find(
        (d) => d.value === input.denominationValue
      );

      if (selectedDenom) {
        console.log(
          "✓ [STEP 3c] Matched fixed denomination in 'both' voucher",
          {
            denominationId: selectedDenom.id,
            value: selectedDenom.value,
          }
        );

        denominationValue = selectedDenom.value;
        selectedDenomId = selectedDenom.id;

        if (selectedDenom.isExpiry && selectedDenom.expiresAt) {
          shouldSetExpiry = true;
          expiresAt = selectedDenom.expiresAt;
        }
      } else {
        console.log("✓ [STEP 3c] Using custom amount for 'both' voucher", {
          customValue: input.denominationValue,
        });

        denominationValue = input.denominationValue;

        if (voucher.isExpiry && voucher.expiresAt) {
          shouldSetExpiry = true;
          expiresAt = voucher.expiresAt;
        }
      }

      console.log("✅ [STEP 3c] 'Both' denomination processed", {
        denominationValue,
        selectedDenomId,
        shouldSetExpiry,
        expiresAt,
        matchedFixed: !!selectedDenom,
      });
    }

    // ============ STEP 4: Fetch or Create Customer (OPTIONAL - for future use) ============
    let customerId = null;
    let customerIdNumeric = null;

    if (customerEmail) {
      console.log("📋 [STEP 4] Processing customer for record keeping", {
        ...logContext,
        step: "customer_lookup",
        customerEmail,
        note: "Customer will NOT be associated with gift card to prevent emails",
      });

      // Fetch existing customer
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

      console.log("📊 [STEP 4] Customer lookup result", {
        found: !!customerId,
        customerId,
        customerIdNumeric,
      });

      // Create customer if not found (for future reference only)
      if (!customerId) {
        console.log("🔄 [STEP 4] Creating new customer for record keeping");

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
        const userErrors = createCustomerData?.data?.customerCreate?.userErrors;

        if (createdCustomer) {
          customerId = createdCustomer.id;
          customerIdNumeric = createdCustomer.legacyResourceId;
          console.log("📊 [STEP 4] Customer creation successful", {
            success: true,
            customerId,
            customerIdNumeric,
          });
        } else if (
          userErrors &&
          userErrors.some((e) => e.message === "Email has already been taken")
        ) {
          console.log("👨‍👩‍👧 [STEP 4] Customer already exists, re-fetching...");

          const customerRefetchResponse = await fetch(
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

          const customerRefetchData = await customerRefetchResponse.json();
          const customerNode =
            customerRefetchData?.data?.customers?.edges?.[0]?.node;
          customerId = customerNode?.id || null;
          customerIdNumeric = customerNode?.legacyResourceId || null;

          console.log("📊 [STEP 4] Customer re-fetch result", {
            found: !!customerId,
            customerId,
            customerIdNumeric,
          });
        }

        if (!customerId) {
          console.warn("⚠️ [STEP 4] Could not create or find customer", {
            ...logContext,
            customerEmail,
            errors: userErrors || createCustomerData.errors,
            note: "Proceeding without customer association",
          });
        }
      }

      console.log("✅ [STEP 4] Customer processed (will NOT be linked to gift card)");
    } else {
      console.log(
        "⏭️  [STEP 4] No customer email provided, skipping customer creation"
      );
    }

    // ============ STEP 5: Create Gift Card via REST API (WITHOUT customer) ============
    console.log("📋 [STEP 5] Creating gift card in Shopify WITHOUT customer association", {
      ...logContext,
      step: "create_gift_card",
      note: "No customer_id will be included to prevent email notifications",
    });

    const value = Number(denominationValue);

    const restApiPayload = {
      gift_card: {
        initial_value: Number.isNaN(value) ? 0 : Number(value.toFixed(2)),
        note: input.note || null,
        // DO NOT include customer_id - this prevents Shopify from sending emails
        // DO NOT include send_email_to_customer - unreliable parameter
      },
    };

    // Add expiry date if needed
    if (shouldSetExpiry && expiresAt) {
      restApiPayload.gift_card.expires_on = new Date(expiresAt)
        .toISOString()
        .split("T")[0];
    }

    console.log("📤 [STEP 5] REST API payload (no customer association)", {
      payload: restApiPayload,
      endpoint: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/gift_cards.json`,
    });

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

    console.log("📊 [STEP 5] Shopify gift card creation response", {
      success: !!createData.gift_card,
      status: createGiftCardResponse.status,
      giftCardId: createData.gift_card?.id,
      errors: createData.errors,
    });

    if (!createData.gift_card) {
      console.error("❌ [FAIL] Failed to create gift card in Shopify", {
        ...logContext,
        responseStatus: createGiftCardResponse.status,
        errors: createData.errors || createData,
        payload: restApiPayload,
      });
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
    const fullGiftCardCode = giftCard.code;
    const shopifyGid = `gid://shopify/GiftCard/${giftCard.id}`;

    console.log("✅ [STEP 5] Gift card created in Shopify (without customer)", {
      shopifyGid,
      code: fullGiftCardCode,
      initialValue: giftCard.initial_value,
      customerAssociated: false,
    });


    // ============ STEP 6: Save to Local Database ============
    console.log("📋 [STEP 6] Saving gift card to local database", {
      ...logContext,
      step: "save_to_db",
    });

    const newLocalGiftCard = await prisma.giftCard.create({
      data: {
        shop,
        shopifyId: shopifyGid,
        code: fullGiftCardCode,
        initialValue: parseFloat(giftCard.initial_value),
        balance: parseFloat(giftCard.balance),
        note: giftCard.note,
        expiresAt:
          shouldSetExpiry && giftCard.expires_on
            ? new Date(giftCard.expires_on)
            : null,
        isVirtual: true,
        isActive: true,
        customerEmail: customerEmail, // Store email for your own reference
        denominationId: selectedDenomId || undefined,
      },
    });

    console.log("✅ [STEP 6] Gift card saved to database", {
      localId: newLocalGiftCard.id,
      shopifyId: shopifyGid,
      customerEmailStored: !!customerEmail,
    });

    // ============ SUCCESS RESPONSE ============
    const duration = Date.now() - startTime;
    const successResponse = {
      success: true,
      message: "Gift card created successfully (no email sent)",
      gift_card: {
        id: shopifyGid,
        code: fullGiftCardCode,
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
        customer: null, // No customer associated to prevent emails
        customerEmail: customerEmail, // Stored in your database for reference
        localId: newLocalGiftCard.id,
        denominationId: selectedDenomId || null,
        hasExpiry: shouldSetExpiry,
      },
    };

    console.log("🎉 [SUCCESS] Gift card creation completed (no email sent)", {
      ...logContext,
      duration: `${duration}ms`,
      giftCardId: shopifyGid,
      localId: newLocalGiftCard.id,
      emailPrevented: true,
    });

    return NextResponse.json(successResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("💥 [FATAL ERROR] Unhandled exception", {
      ...logContext,
      duration: `${duration}ms`,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        requestId: logContext.requestId,
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