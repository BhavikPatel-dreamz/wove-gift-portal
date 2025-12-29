import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
    }

    // Get Shopify session
    const session = await prisma.appInstallation.findUnique({
      where: { shop }
    });

    if (!session) {
      return NextResponse.json({ error: 'Shop not authenticated' }, { status: 401 });
    }

    // Fetch gift cards from Shopify
    const shopifyGiftCards = await fetchShopifyGiftCards(shop, session.accessToken);
    
    // Also fetch our internal gift cards for this shop
    const internalGiftCards = await prisma.GiftCard.findMany({
      where: { shop },
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
    const response = await fetch(`https://${shop}/admin/api/2023-10/gift_cards.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data.gift_cards || []).map(card => ({
      id: card.id,
      code: card.code,
      initialValue: parseFloat(card.initial_value),
      balance: parseFloat(card.balance),
      customerEmail: card.customer?.email || null,
      status: card.disabled_at ? 'expired' : (parseFloat(card.balance) > 0 ? 'active' : 'used'),
      createdAt: card.created_at,
      source: 'shopify'
    }));

  } catch (error) {
    console.error('Error fetching Shopify gift cards:', error);
    return [];
  }
}