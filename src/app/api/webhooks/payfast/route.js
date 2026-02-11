import { NextResponse } from 'next/server';
import { markOrderAsPaid } from '@/lib/action/orderAction';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    console.log('📨 PayFast ITN received');
    
    const formData = await request.formData();
    const postData = Object.fromEntries(formData.entries());
    
    console.log('📦 ITN Data:', {
      payment_id: postData.pf_payment_id,
      payment_status: postData.payment_status,
      amount_gross: postData.amount_gross,
      custom_str1: postData.custom_str1,
      custom_str2: postData.custom_str2,
    });
    
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
    
    let ordersToUpdate = [];
    
    if (allOrderNumbers.length > 0) {
      ordersToUpdate = await prisma.order.findMany({
        where: {
          orderNumber: { in: allOrderNumbers },
          paymentStatus: 'PENDING'
        }
      });
    } else {
      const order = await prisma.order.findUnique({
        where: { 
          id: primaryOrderId,
          paymentStatus: 'PENDING'
        }
      });
      
      if (order) {
        ordersToUpdate = [order];
      }
    }
    
    if (ordersToUpdate.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No pending orders found' },
        { status: 200 }
      );
    }
    
    const paymentDetails = {
      paymentIntentId: postData.pf_payment_id,
      paymentMethod: 'payfast',
      amount: Math.round(parseFloat(postData.amount_gross) * 100),
      currency: 'ZAR',
      status: postData.payment_status,
    };
    
    const updateResults = [];
    
    for (const order of ordersToUpdate) {
      try {
        const result = await markOrderAsPaid(order.id, paymentDetails);
        updateResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        updateResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = updateResults.filter(r => r.success).length;
    
    console.log('✅ Webhook completed - Cron will process vouchers');
    return NextResponse.json({ 
      success: true,
      message: 'Orders marked as paid, processing will begin shortly',
      markedAsPaid: successCount,
      totalOrders: ordersToUpdate.length,
      results: updateResults
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