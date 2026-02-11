import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';


export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, code, amount } = body;

    if (!shop || !code) {
      return NextResponse.json({ 
        error: 'Shop and gift card code are required' 
      }, { status: 400 });
    }

    // Find the gift card
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        shop,
        code,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!giftCard) {
      return NextResponse.json({ 
        error: 'Invalid or expired gift card' 
      }, { status: 404 });
    }

    if (amount && parseFloat(amount) > giftCard.balance) {
      return NextResponse.json({ 
        error: 'Insufficient gift card balance' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        balance: giftCard.balance,
        initialValue: giftCard.initialValue,
        customerEmail: giftCard.customerEmail,
        isVirtual: giftCard.isVirtual,
        valid: true
      }
    });

  } catch (error) {
    console.error('Error validating gift card:', error);
    return NextResponse.json({ 
      error: 'Failed to validate gift card', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { shop, code, amount } = body;

    if (!shop || !code || !amount) {
      return NextResponse.json({ 
        error: 'Shop, gift card code, and amount are required' 
      }, { status: 400 });
    }

    const redemptionAmount = parseFloat(amount);

    // Find and update the gift card
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        shop,
        code,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!giftCard) {
      return NextResponse.json({ 
        error: 'Invalid or expired gift card' 
      }, { status: 404 });
    }

    if (redemptionAmount > giftCard.balance) {
      return NextResponse.json({ 
        error: 'Insufficient gift card balance' 
      }, { status: 400 });
    }

    // Update the balance
    const newBalance = giftCard.balance - redemptionAmount;
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        balance: newBalance,
        isActive: newBalance > 0, // Deactivate if balance is 0
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      redemption: {
        amount: redemptionAmount,
        remainingBalance: newBalance,
        giftCardId: updatedGiftCard.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error redeeming gift card:', error);
    return NextResponse.json({ 
      error: 'Failed to redeem gift card', 
      details: error.message 
    }, { status: 500 });
  }
}