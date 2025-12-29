import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, initialValue, customerEmail, note, expiresAt } = body;

    if (!shop || !initialValue) {
      return NextResponse.json({ 
        error: 'Shop and initial value are required' 
      }, { status: 400 });
    }

    // Get Shopify session
    const session = await prisma.appInstallation.findUnique({
      where: { shop }
    });


    if (!session) {
      return NextResponse.json({ 
        error: 'Shop not authenticated' 
      }, { status: 401 });
    }

    // Create gift card in Shopify using GraphQL
    const shopifyGiftCard = await createShopifyGiftCard(
      shop, 
      session.accessToken, 
      {
        initialValue: parseFloat(initialValue),
        note,
        expiresAt
      }
    );

    // Save to our database as well
    const giftCard = await prisma.giftCard.create({
      data: {
        shop,
        shopifyId: shopifyGiftCard.id?.replace('gid://shopify/GiftCard/', ''),
        code: shopifyGiftCard.maskedCode,
        initialValue: parseFloat(initialValue),
        balance: parseFloat(shopifyGiftCard.balance?.amount || initialValue),
        customerEmail: customerEmail || null,
        note: note || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        initialValue: giftCard.initialValue,
        balance: giftCard.balance,
        customerEmail: giftCard.customerEmail,
        status: 'active',
        createdAt: giftCard.createdAt,
        shopifyId: shopifyGiftCard.id
      }
    });

  } catch (error) {
    console.error('Error creating gift card:', error);
    return NextResponse.json({ 
      error: 'Failed to create gift card', 
      details: error.message 
    }, { status: 500 });
  }
}

async function createShopifyGiftCard(shop, accessToken, { initialValue, note, expiresAt }) {
  try {
    // Prepare GraphQL input
    const giftCardInput = {
      initialValue: parseFloat(initialValue.toFixed(2)),
      note: note || null,
      expiresOn: expiresAt || null
    };

    // Create gift card using GraphQL
    const createResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
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
        variables: { input: giftCardInput }
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Shopify GraphQL error: ${JSON.stringify(errorData)}`);
    }

    const createData = await createResponse.json();

    const giftCard = createData?.data?.giftCardCreate?.giftCard;
    const userErrors = createData?.data?.giftCardCreate?.userErrors || [];

    if (!giftCard) {
      throw new Error(`Failed to create gift card: ${JSON.stringify(userErrors)}`);
    }

    // Fetch gift card masked code
    const codeResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
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

    if (!codeResponse.ok) {
      console.warn('Failed to fetch gift card code, proceeding without it');
    } else {
      const codeData = await codeResponse.json();
      const maskedCode = codeData?.data?.giftCard?.maskedCode;
      if (maskedCode) {
        giftCard.maskedCode = maskedCode;
      }
    }

    return giftCard;

  } catch (error) {
    console.error('Error creating Shopify gift card:', error);
    throw error;
  }
}