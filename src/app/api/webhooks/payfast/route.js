/**
 * PayFast Webhook Handler (ITN - Instant Transaction Notification)
 * Route: /api/webhooks/payfast
 */

import { NextResponse } from 'next/server';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';
import { getPayFastConfig, verifyPayFastPayment } from '../../../../lib/payfast/payfastUtils';

/**
 * Validate PayFast server IPs (security measure)
 */
const PAYFAST_VALID_IPS = [
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  '197.97.145.147',
  '197.97.145.148',
];

/**
 * Additional IP ranges for sandbox
 */
const PAYFAST_SANDBOX_IPS = [
  '41.74.179.194',
  '41.74.179.195',
  '41.74.179.196',
  '41.74.179.197',
];

function validatePayFastIP(ip, isSandbox) {
  const validIPs = isSandbox 
    ? [...PAYFAST_VALID_IPS, ...PAYFAST_SANDBOX_IPS]
    : PAYFAST_VALID_IPS;
  
  return validIPs.includes(ip);
}

/**
 * Verify payment with PayFast server (optional additional security)
 */
async function verifyPaymentWithPayFast(paymentId, isSandbox) {
  const baseUrl = isSandbox
    ? 'https://sandbox.payfast.co.za'
    : 'https://www.payfast.co.za';
  
  try {
    const response = await fetch(`${baseUrl}/eng/query/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_id': paymentId,
      }),
    });
    
    const text = await response.text();
    return text === 'VALID';
  } catch (error) {
    console.error('❌ PayFast validation error:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    console.log('📨 PayFast webhook received');
    
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');
    
    console.log('🌐 Request from IP:', clientIP);
    
    // Get PayFast config
    const config = getPayFastConfig();
    
    // Validate IP (optional but recommended for production)
    if (process.env.NODE_ENV === 'production' && !config.isSandbox) {
      if (!validatePayFastIP(clientIP, config.isSandbox)) {
        console.error('❌ Invalid IP address:', clientIP);
        return NextResponse.json(
          { error: 'Unauthorized IP address' },
          { status: 403 }
        );
      }
    }
    
    // Parse POST data
    const formData = await request.formData();
    const postData = {};
    
    for (const [key, value] of formData.entries()) {
      postData[key] = value;
    }
    
    console.log('📦 PayFast data received:', {
      payment_id: postData.pf_payment_id,
      payment_status: postData.payment_status,
      order_id: postData.custom_str1,
      order_number: postData.custom_str2,
      amount: postData.amount_gross,
    });
    
    // Verify signature and payment
    const verification = await verifyPayFastPayment(postData, config.passphrase);
    
    if (!verification.valid) {
      console.error('❌ PayFast verification failed:', verification.error);
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }
    
    console.log('✅ PayFast signature verified');
    
    // Optional: Additional verification with PayFast server
    if (process.env.PAYFAST_VERIFY_WITH_SERVER === 'true') {
      const serverVerified = await verifyPaymentWithPayFast(
        postData.pf_payment_id,
        config.isSandbox
      );
      
      if (!serverVerified) {
        console.error('❌ PayFast server verification failed');
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
      
      console.log('✅ PayFast server verification passed');
    }
    
    // Extract order information
    const orderId = verification.data.orderId;
    
    if (!orderId) {
      console.error('❌ No order ID in PayFast data');
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
      fee: Math.round(parseFloat(postData.amount_fee || 0) * 100),
      net: Math.round(parseFloat(postData.amount_net || 0) * 100),
      status: postData.payment_status,
    };
    
    console.log('🔄 Completing order:', orderId);
    
    const result = await completeOrderAfterPayment(orderId, paymentDetails);
    
    if (result.success) {
      console.log('✅ Order completed successfully:', orderId);
      return NextResponse.json({ success: true });
    } else {
      console.error('❌ Failed to complete order:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ PayFast webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET method for validation (PayFast may send GET request first)
export async function GET(request) {
  console.log('📨 PayFast webhook GET request received');
  return NextResponse.json({ status: 'ready' });
}