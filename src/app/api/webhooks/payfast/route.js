/**
 * PayFast Webhook Handler (ITN - Instant Transaction Notification)
 * Route: /api/webhooks/payfast
 */

import { NextResponse } from 'next/server';
import { completeOrderAfterPayment } from '@/lib/action/orderAction';
import { validatePayFastSignature } from '../../../../lib/payfast/payfastUtils';
import { prisma } from '@/lib/db';

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
    
    const primaryOrderId = postData.custom_str1;
    const allOrderNumbers = postData.custom_str2 ? postData.custom_str2.split(',') : [];
    
    if (!primaryOrderId) {
      console.error('❌ No order ID in ITN data');
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      );
    }
    
    console.log('📋 Processing orders:', {
      primaryOrderId,
      orderNumbers: allOrderNumbers,
      totalOrders: allOrderNumbers.length || 1
    });
    
    // ✅ Find ALL orders to complete
    let ordersToComplete = [];
    
    if (allOrderNumbers.length > 0) {
      // Multi-cart order: Find all orders by order numbers
      ordersToComplete = await prisma.order.findMany({
        where: {
          orderNumber: { in: allOrderNumbers },
          paymentStatus: 'PENDING'
        }
      });
      
      console.log(`✅ Found ${ordersToComplete.length} pending orders from order numbers`);
    } else {
      // Single order: Just get the primary order
      const order = await prisma.order.findUnique({
        where: { 
          id: primaryOrderId,
          paymentStatus: 'PENDING'
        }
      });
      
      if (order) {
        ordersToComplete = [order];
        console.log(`✅ Found single pending order: ${order.orderNumber}`);
      }
    }
    
    if (ordersToComplete.length === 0) {
      console.warn('⚠️ No pending orders found to complete');
      return NextResponse.json(
        { 
          success: true, 
          message: 'No pending orders found (may have been processed already)' 
        },
        { status: 200 }
      );
    }
    
    // ✅ Process ALL orders
    const paymentDetails = {
      paymentIntentId: postData.pf_payment_id,
      paymentMethod: 'payfast',
      amount: Math.round(parseFloat(postData.amount_gross) * 100), // Convert to cents
      currency: 'ZAR',
      status: postData.payment_status,
    };
    
    const completionResults = [];
    
    for (const order of ordersToComplete) {
      console.log(`🔄 Completing order: ${order.id} (${order.orderNumber})`);
      
      try {
        const result = await completeOrderAfterPayment(order.id, paymentDetails);
        
        completionResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: result.success,
          error: result.error
        });
        
        if (result.success) {
          console.log(`✅ Order ${order.orderNumber} queued for processing`);
        } else {
          console.error(`❌ Failed to complete order ${order.orderNumber}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Exception completing order ${order.orderNumber}:`, error);
        completionResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: error.message
        });
      }
    }
    
    // ✅ Log summary
    const successCount = completionResults.filter(r => r.success).length;
    const failedCount = completionResults.length - successCount;
    
    console.log(`📊 Completion summary: ${successCount}/${ordersToComplete.length} orders processed successfully`);
    
    if (failedCount > 0) {
      console.error('⚠️ Some orders failed:', completionResults.filter(r => !r.success));
    }
    
    if (successCount === 0) {
      console.error('❌ All orders failed to process');
      return NextResponse.json(
        { 
          error: 'All orders failed to process',
          results: completionResults
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Webhook processing completed');
    return NextResponse.json({ 
      success: true,
      processedOrders: successCount,
      totalOrders: ordersToComplete.length,
      results: completionResults
    });
    
  } catch (error) {
    console.error('❌ ITN processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
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