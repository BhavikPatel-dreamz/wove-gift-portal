import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, initialValue, customerEmail, note, expiresAt } = body;

    if (!shop || !initialValue) {
      return NextResponse.json({ 
        error: 'Shop and initial value are required' 
      }, { status: 400 });
    }

    // Generate a unique gift card code
    const code = generateGiftCardCode();

    // Create virtual gift card in your database
    const giftCard = await prisma.giftCard.create({
      data: {
        shop,
        shopifyId: null, // No Shopify ID for virtual cards
        code: code,
        initialValue: parseFloat(initialValue),
        balance: parseFloat(initialValue),
        customerEmail: customerEmail || null,
        note: note || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
        isVirtual: true, // Add this field to distinguish virtual cards
      }
    });

    // You can send email notification to customer here if needed
    if (customerEmail) {
      await sendGiftCardEmail(customerEmail, giftCard);
    }

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
        isVirtual: true
      }
    });

  } catch (error) {
    console.error('Error creating virtual gift card:', error);
    return NextResponse.json({ 
      error: 'Failed to create virtual gift card', 
      details: error.message 
    }, { status: 500 });
  }
}

function generateGiftCardCode() {
  // Generate a random 16-character code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Format as XXXX-XXXX-XXXX-XXXX
  return result.replace(/(.{4})/g, '$1-').slice(0, -1);
}

async function sendGiftCardEmail(email, giftCard) {
  // Implement email sending logic here
  // You can use services like SendGrid, Nodemailer, etc.
  // TODO: Implement actual email sending
  return {email, giftCard};
}