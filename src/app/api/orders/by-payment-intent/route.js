import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { paymentIntentId } = await request.json();

    console.log("paymentIntentId",paymentIntentId)

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching orders with payment intent:', paymentIntentId);

    // ✅ Find all orders with the same payment intent
    const orders = await prisma.order.findMany({
      where: {
        paymentIntentId: paymentIntentId,
      },
      include: {
        brand: true,
        receiverDetail: true,
        occasion: true,
        voucherCodes: {
          include: {
            voucher: true,
            giftCard: {
              select: {
                code: true,
                balance: true,
                initialValue: true,
                expiresAt: true,
              },
            },
          },
        },
        bulkRecipients: true,
        deliveryLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Return in order they were created
      },
    });

    console.log(`✅ Found ${orders.length} orders with payment intent ${paymentIntentId}`);

    // ✅ Format orders with voucher codes
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      bulkOrderNumber: order.bulkOrderNumber,
      amount: order.amount,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      currency: order.currency,
      quantity: order.quantity,
      paymentStatus: order.paymentStatus,
      deliveryMethod: order.deliveryMethod,
      sendType: order.sendType,
      scheduledFor: order.scheduledFor,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      brand: order.brand,
      occasion: order.occasion,
      receiverDetail: order.receiverDetail,
      message: order.message,
      senderName: order.senderName,
      senderEmail: order.senderEmail,
      voucherCodes: order.voucherCodes.map(vc => ({
        id: vc.id,
        code: vc.code,
        giftCard: vc.giftCard ? {
          code: vc.giftCard.code,
          balance: vc.giftCard.balance,
          initialValue: vc.giftCard.initialValue,
          expiresAt: vc.giftCard.expiresAt,
        } : null,
        originalValue: vc.originalValue,
        remainingValue: vc.remainingValue,
        expiresAt: vc.expiresAt,
        pin: vc.pin,
        qrCode: vc.qrCode,
        tokenizedLink: vc.tokenizedLink,
        voucher: vc.voucher,
      })),
      bulkRecipients: order.bulkRecipients,
      deliveryLogs: order.deliveryLogs,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });

  } catch (error) {
    console.error('❌ Error fetching orders by payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}