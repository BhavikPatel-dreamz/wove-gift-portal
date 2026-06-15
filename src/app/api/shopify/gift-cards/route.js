import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import {
  getValidShopifySession,
  normalizeShopDomain,
} from '@/lib/shopify/request-session';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const shopDomain = normalizeShopDomain(shop);

    if (!shopDomain) {
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
    }

    const session = await getValidShopifySession(shopDomain, {
      request,
      requireSessionToken: true,
    });

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Shop not authenticated' }, { status: 401 });
    }

    // Fetch gift cards from Shopify
    const shopifyGiftCards = await fetchShopifyGiftCards(shopDomain, session.accessToken);
    
    // Also fetch our internal gift cards for this shop
    const internalGiftCards = await prisma.GiftCard.findMany({
      where: { shop: shopDomain },
      orderBy: { createdAt: 'desc' }
    });

    // Combine and format the data
    const giftCards = [
      ...shopifyGiftCards,
      ...internalGiftCards.map(card => ({
        id: card.id,
        code: card.code,
        initialValue: card.initialValue,
        balance: card.balance,
        customerEmail: card.customerEmail,
        status: card.isActive ? (card.balance > 0 ? 'active' : 'used') : 'expired',
        createdAt: card.createdAt,
        source: 'internal'
      }))
    ];

    return NextResponse.json({ 
      success: true, 
      giftCards,
      total: giftCards.length 
    });

  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch gift cards', 
      details: error.message 
    }, { status: 500 });
  }
}

async function fetchShopifyGiftCards(shop, accessToken) {
  try {
    // Using GraphQL API (compliant with latest Shopify requirements as of April 1, 2025)
    const query = `
      query FetchGiftCards($first: Int!) {
        giftCards(first: $first) {
          edges {
            node {
              id
              legacyResourceId
              code
              state
              balance {
                amount
                currencyCode
              }
              createdAt
              lastCharacteristics {
                expiresOn
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: 100 },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
    }

    return (result.data?.giftCards?.edges || []).map(edge => {
      const card = edge.node;
      const balance = parseFloat(card.balance.amount || 0);
      
      return {
        id: card.id,
        legacyResourceId: card.legacyResourceId,
        code: card.code,
        initialValue: balance,
        balance: balance,
        status: card.state === 'DISABLED' ? 'expired' : (balance > 0 ? 'active' : 'used'),
        createdAt: card.createdAt,
        expiresOn: card.lastCharacteristics?.expiresOn,
        source: 'shopify'
      };
    });

  } catch (error) {
    console.error('Error fetching Shopify gift cards:', error);
    return [];
  }
}
