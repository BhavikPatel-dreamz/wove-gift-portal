// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';

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
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('❌ No orderId in payment intent metadata');
      return;
    }

    console.log(`🔄 Processing payment for order: ${orderId}`);

    // ✅ Call completeOrderAfterPayment - it will:
    // 1. Mark payment as completed immediately
    // 2. Create delivery queue entries
    // 3. Start background processing
    // 4. Return immediately
    const result = await completeOrderAfterPayment(orderId, {
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    if (result.success) {
      console.log(`✅ Order queued for processing: ${orderId}`);
      console.log(`📊 Processing status: ${result.data.processingStatus}`);
    } else {
      console.error(`❌ Failed to queue order ${orderId}:`, result.error);
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    
    // ✅ Still mark payment as completed even if there's an error
    try {
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        const { prisma } = await import('@/lib/db');
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            paymentIntentId: paymentIntent.id,
            paidAt: new Date(),
          },
        });
        console.log(`✅ Order ${orderId} marked as paid (fallback)`);
      }
    } catch (fallbackError) {
      console.error('❌ Critical: Could not mark order as completed:', fallbackError);
    }
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    const { prisma } = await import('@/lib/db');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    console.log('❌ Order marked as failed:', orderId);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    const { prisma } = await import('@/lib/db');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'CANCELLED',
      },
    });

    console.log('🚫 Order marked as cancelled:', orderId);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}