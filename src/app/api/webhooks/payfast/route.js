/**
 * PayFast Webhook Handler (ITN - Instant Transaction Notification)
 * Route: /api/webhooks/payfast
 */

import { NextResponse } from 'next/server';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';
import { validatePayFastSignature } from '../../../../lib/payfast/payfastUtils';

export async function POST(request) {
  try {
    console.log('📨 PayFast ITN received');
    
    // Parse form data
    const formData = await request.formData();
    const postData = Object.fromEntries(formData.entries());
    
    console.log('📦 ITN Data:', {
      payment_id: postData.pf_payment_id,
      payment_status: postData.payment_status,
      amount_gross: postData.amount_gross,
      amount_fee: postData.amount_fee,
      amount_net: postData.amount_net,
      custom_str1: postData.custom_str1,
      custom_str2: postData.custom_str2,
    });
    
    
    // Verify payment is complete
    if (postData.payment_status !== 'COMPLETE') {
      console.warn(`⚠️ Payment not complete: ${postData.payment_status}`);
      return NextResponse.json(
        { error: `Payment not complete: ${postData.payment_status}` },
        { status: 400 }
      );
    }
    
    const orderId = postData.custom_str1;
    
    if (!orderId) {
      console.error('❌ No order ID in ITN data');
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      );
    }
    
    // Complete the order
    const paymentDetails = {
      paymentIntentId: postData.pf_payment_id,
      paymentMethod: 'payfast',
      amount: Math.round(parseFloat(postData.amount_gross) * 100), // Convert to cents
      currency: 'ZAR',
      status: postData.payment_status,
    };
    
    console.log('🔄 Completing order:', orderId);
    
    const result = await completeOrderAfterPayment(orderId, paymentDetails);
    
    if (result.success) {
      console.log('✅ Order completed successfully');
      return NextResponse.json({ success: true });
    } else {
      console.error('❌ Failed to complete order:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ ITN processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    message: 'PayFast webhook endpoint is active'
  });
}