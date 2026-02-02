// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';
import { prisma } from '../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('✅ Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        
        // ✅ Handle payment success without waiting for completion
        handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        handlePaymentFailure(paymentIntent);
        break;
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object;
        console.log('⏳ Payment processing:', paymentIntent.id);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        console.log('🚫 Payment canceled:', paymentIntent.id);
        
        handlePaymentCanceled(paymentIntent);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    // ✅ Return immediately - don't wait for order processing
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ✅ Handle successful payment (non-blocking)
async function handlePaymentSuccess(paymentIntent) {
  try {
    // ✅ Find ALL orders associated with this payment intent
    const orders = await prisma.order.findMany({
      where: { 
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'PENDING'
      },
    });

    if (!orders || orders.length === 0) {
      console.error('❌ No pending orders found for payment intent:', paymentIntent.id);
      return;
    }

    console.log(`🔄 Processing ${orders.length} orders for payment: ${paymentIntent.id}`);

    // ✅ Process all orders in parallel
    const processingPromises = orders.map(async (order) => {
      try {
        console.log(`📦 Processing order: ${order.orderNumber} (${order.id})`);

        const result = await completeOrderAfterPayment(order.id, {
          paymentIntentId: paymentIntent.id,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

        if (result.success) {
          console.log(`✅ Order queued for processing: ${order.orderNumber}`);
          return { success: true, orderId: order.id, orderNumber: order.orderNumber };
        } else {
          console.error(`❌ Failed to queue order ${order.orderNumber}:`, result.error);
          return { success: false, orderId: order.id, orderNumber: order.orderNumber, error: result.error };
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
        return { success: false, orderId: order.id, error: error.message };
      }
    });

    const results = await Promise.all(processingPromises);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`📊 Payment processing summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📦 Total: ${orders.length}`);

    // ✅ If any failed, log them for manual review
    if (failedCount > 0) {
      const failedOrders = results.filter(r => !r.success);
      console.error('⚠️ Failed orders requiring attention:', failedOrders);
    }

  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    
    // ✅ Fallback: Try to mark all orders as completed even if there's an error
    try {
      await prisma.order.updateMany({
        where: { 
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'PENDING'
        },
        data: {
          paymentStatus: 'COMPLETED',
          paidAt: new Date(),
        },
      });
      console.log(`✅ Marked all orders as paid (fallback) for payment: ${paymentIntent.id}`);
    } catch (fallbackError) {
      console.error('❌ Critical: Could not mark orders as completed:', fallbackError);
    }
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    // ✅ Find ALL orders associated with this payment intent
    const orders = await prisma.order.findMany({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!orders || orders.length === 0) {
      console.error('No orders found for failed payment intent');
      return;
    }

    console.log(`❌ Marking ${orders.length} orders as failed`);

    // ✅ Update all orders to FAILED status
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    console.log(`✅ ${orders.length} orders marked as failed`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent) {
  try {
    // ✅ Find ALL orders associated with this payment intent
    const orders = await prisma.order.findMany({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!orders || orders.length === 0) {
      console.error('No orders found for cancelled payment intent');
      return;
    }

    console.log(`🚫 Marking ${orders.length} orders as cancelled`);

    // ✅ Update all orders to CANCELLED status
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'CANCELLED',
      },
    });

    console.log(`✅ ${orders.length} orders marked as cancelled`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}