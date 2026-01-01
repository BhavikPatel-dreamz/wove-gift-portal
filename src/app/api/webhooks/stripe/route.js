// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// IMPORTANT: Disable body parsing for webhook
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
        
        // Complete the order
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object;
        console.log('⏳ Payment processing:', paymentIntent.id);
        // Order already in PROCESSING status
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        console.log('🚫 Payment canceled:', paymentIntent.id);
        
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Complete the order (generate vouchers, send emails, etc.)
    const result = await completeOrderAfterPayment(orderId, {
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    if (result.success) {
      console.log('✅ Order completed successfully:', orderId);
    } else {
      console.error('❌ Failed to complete order:', result.error);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
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