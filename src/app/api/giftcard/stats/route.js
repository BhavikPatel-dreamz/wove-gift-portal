import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }

    // Get brand for this shop
    const brand = await prisma.brand.findFirst({
      where: { domain: shop },
    });

    if (!brand) {
      return NextResponse.json({
        total: 0,
        totalValue: 0,
        active: 0,
        redeemed: 0,
      });
    }

    // Get gift card statistics
    const [totalCards, activeCards, redeemedCards, valueSum] = await Promise.all([
      // Total gift cards
      prisma.giftCard.count({
        where: { brandId: brand.id },
      }),
      // Active gift cards
      prisma.giftCard.count({
        where: { 
          brandId: brand.id,
          isActive: true,
        },
      }),
      // Redeemed gift cards (not active or balance = 0)
      prisma.giftCard.count({
        where: { 
          brandId: brand.id,
          OR: [
            { isActive: false },
            { balance: 0 },
          ],
        },
      }),
      // Total value
      prisma.giftCard.aggregate({
        where: { brandId: brand.id },
        _sum: {
          initialValue: true,
        },
      }),
    ]);

    return NextResponse.json({
      total: totalCards,
      totalValue: valueSum._sum.initialValue || 0,
      active: activeCards,
      redeemed: redeemedCards,
    });
  } catch (error) {
    console.error('Error fetching gift card stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
