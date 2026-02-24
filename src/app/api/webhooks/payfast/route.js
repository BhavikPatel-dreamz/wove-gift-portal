/**
 * IMPROVED PAYFAST WEBHOOK HANDLER
 * 
 * This handler receives payment confirmations from PayFast ITN (Instant Transaction Notification).
 * 
 * Flow:
 * 1. Receive webhook from PayFast with payment status
 * 2. Validate payment status is COMPLETE
 * 3. Find all orders related to this payment
 * 4. Mark orders as PAID (isPaid = true)
 * 5. Set processingStatus = PAYMENT_CONFIRMED
 * 6. Trigger Voucher Processor after 5 seconds
 * 7. Trigger Notification Processor right after voucher processing completes
 * 8. Retry Notification Processor after 5 seconds
 * 
 * Database checks ensure:
 * ✅ Order exists and is PENDING before marking as paid
 * ✅ No duplicate processing if webhook is received twice
 * ✅ Atomic updates with transaction
 */

import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processVouchersQueue } from "../../../../lib/action/cronProcessor";
import { processNotificationsQueue } from "../../../../lib/action/Notificationprocessorcron";

export const runtime = "nodejs";
export const maxDuration = 300;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPostPaymentProcessingSequence({ sequenceId, orderNumbers }) {
  console.log(
    `🚀 [${sequenceId}] Starting sequence for orders: ${
      orderNumbers.join(", ") || "N/A"
    }`
  );

  let voucherResult = null;

  try {
    voucherResult = await processVouchersQueue();
    console.log(`✅ [${sequenceId}] Voucher processor completed:`, voucherResult);
  } catch (error) {
    console.error(`❌ [${sequenceId}] Voucher processor failed:`, error.message);
  }

  // Run notifications only after voucher processing has finished.
  // This avoids "No orders ready for notification" while vouchers are still being created.
  try {
    const notificationResult1 = await processNotificationsQueue();
    console.log(
      `✅ [${sequenceId}] Notification processor #1 completed:`,
      notificationResult1
    );
  } catch (error) {
    console.error(
      `❌ [${sequenceId}] Notification processor #1 failed:`,
      error.message
    );
  }

  await delay(2000);

  try {
    const notificationResult2 = await processNotificationsQueue();
    console.log(
      `✅ [${sequenceId}] Notification processor #2 completed:`,
      notificationResult2
    );
  } catch (error) {
    console.error(
      `❌ [${sequenceId}] Notification processor #2 failed:`,
      error.message
    );
  }

  console.log(`🏁 [${sequenceId}] Sequence finished`);
}

function schedulePostPaymentProcessing({ paymentId, orderNumbers }) {
  const safeOrderNumbers = Array.isArray(orderNumbers) ? orderNumbers : [];
  const sequenceId = `${paymentId || "payfast"}-${Date.now()}`;

  console.log(
    `⏳ [${sequenceId}] Scheduling processors for orders: ${
      safeOrderNumbers.join(", ") || "N/A"
    }`
  );

  // Use Next.js after() instead of setTimeout fire-and-forget.
  // In serverless environments (e.g. Vercel), this keeps post-response work alive.
  after(async () => {
    try {
      await delay(2000);
      await runPostPaymentProcessingSequence({
        sequenceId,
        orderNumbers: safeOrderNumbers,
      });
    } catch (error) {
      console.error(
        `❌ [${sequenceId}] Failed to run post-payment sequence in after():`,
        error?.message || error
      );
    }
  });

  return sequenceId;
}

/**
 * PayFast ITN Webhook Handler
 * POST /api/payfast-webhook
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    console.log("\n" + "=".repeat(80));
    console.log("🌐 [PAYFAST WEBHOOK] Received ITN notification");
    console.log("=".repeat(80));

    // Parse form data from PayFast
    const formData = await request.formData();
    const postData = Object.fromEntries(formData.entries());

    // Log received data
    console.log("📨 ITN Data received:");
    console.log(`  - Payment ID: ${postData.pf_payment_id}`);
    console.log(`  - Status: ${postData.payment_status}`);
    console.log(`  - Amount: ${postData.amount_gross}`);
    console.log(`  - Order ID: ${postData.custom_str1}`);

    // ==================== VALIDATION ====================

    // Check payment status
    if (postData.payment_status !== "COMPLETE") {
      console.warn(`⚠️ Payment not complete: ${postData.payment_status}`);
      return NextResponse.json(
        {
          success: false,
          error: `Payment status is not COMPLETE: ${postData.payment_status}`,
        },
        { status: 400 }
      );
    }

    // Check order ID
    const primaryOrderId = postData.custom_str1;
    if (!primaryOrderId) {
      console.error("❌ No order ID in ITN data");
      return NextResponse.json(
        { success: false, error: "Missing order ID in webhook" },
        { status: 400 }
      );
    }

    console.log(`\n📋 Looking up orders for order ID: ${primaryOrderId}`);

    // ==================== FIND ORDERS ====================

    let ordersToUpdate = [];

    // Check if this is a multi-order payment
    const allOrderNumbers = postData.custom_str2
      ? postData.custom_str2.split(",")
      : [];

    if (allOrderNumbers.length > 0) {
      // Multi-order payment
      console.log(
        `📊 Multi-order payment detected with ${allOrderNumbers.length} orders`
      );

      ordersToUpdate = await prisma.order.findMany({
        where: {
          orderNumber: { in: allOrderNumbers },
          paymentStatus: "PENDING", // Only update PENDING orders
          isPaid: false, // Only if not already marked as paid
        },
        select: {
          id: true,
          orderNumber: true,
          paymentStatus: true,
          processingStatus: true,
          isPaid: true,
        },
      });

      console.log(`✅ Found ${ordersToUpdate.length} pending orders to update`);
    } else {
      // Single order payment
      console.log(`📊 Single order payment detected`);

      const order = await prisma.order.findUnique({
        where: { id: primaryOrderId },
        select: {
          id: true,
          orderNumber: true,
          paymentStatus: true,
          processingStatus: true,
          isPaid: true,
        },
      });

      if (order) {
        // Double-check it's still pending
        if (order.paymentStatus === "PENDING" && !order.isPaid) {
          ordersToUpdate = [order];
          console.log(`✅ Found order ${order.orderNumber} to update`);
        } else {
          console.log(
            `⏭️ Order ${order?.orderNumber} already processed or not pending`
          );
        }
      }
    }

    // ==================== CHECK FOR DUPLICATES ====================

    if (ordersToUpdate.length === 0) {
      console.log("⚠️ No pending orders found - webhook may be duplicate");
      return NextResponse.json(
        {
          success: true,
          message: "No pending orders found (possibly duplicate webhook)",
          ordersFound: 0,
        },
        { status: 200 }
      );
    }

    // ==================== UPDATE ORDERS ====================

    console.log(
      `\n🔄 Updating ${ordersToUpdate.length} orders to PAYMENT_CONFIRMED...`
    );

    const paymentDetails = {
      paymentIntentId: postData.pf_payment_id,
      paymentMethod: "payfast",
      amount: Math.round(parseFloat(postData.amount_gross) * 100),
      currency: postData.custom_currency || "ZAR",
      status: postData.payment_status,
      paidAt: new Date(),
    };

    const updateResults = [];

    for (const order of ordersToUpdate) {
      try {
        // Update order with transaction for atomicity
        const result = await prisma.$transaction(
          async (tx) => {
            // Lock the order to prevent concurrent updates
            await tx.$executeRaw`
              SELECT * FROM "Order" 
              WHERE id = ${order.id}
              FOR UPDATE
            `;

            // Double-check it's still PENDING (in case of race condition)
            const currentOrder = await tx.order.findUnique({
              where: { id: order.id },
              select: { paymentStatus: true, isPaid: true },
            });

            if (currentOrder.paymentStatus !== "PENDING" || currentOrder.isPaid) {
              console.log(
                `⏭️ Order ${order.orderNumber} was already updated, skipping`
              );
              return {
                orderId: order.id,
                orderNumber: order.orderNumber,
                success: false,
                error: "Order already processed",
              };
            }

            // Update the order
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: "COMPLETED",
                paymentIntentId: paymentDetails.paymentIntentId,
                paidAt: paymentDetails.paidAt,
                isPaid: true, // ✅ Mark as paid to unlock cron processing
                processingStatus: "PAYMENT_CONFIRMED", // ✅ Cron will pick this up
                lastProcessedAt: new Date(),
              },
            });

            console.log(
              `✅ [${order.orderNumber}] Updated to PAYMENT_CONFIRMED`
            );

            return {
              orderId: order.id,
              orderNumber: order.orderNumber,
              success: true,
              message: "Order marked as paid",
            };
          },
          { isolationLevel: "Serializable" }
        );

        updateResults.push(result);
      } catch (error) {
        console.error(
          `❌ Failed to update order ${order.orderNumber}:`,
          error.message
        );

        updateResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: error.message,
        });
      }
    }

    // ==================== GENERATE RESPONSE ====================

    const successCount = updateResults.filter((r) => r.success).length;
    const failureCount = updateResults.filter((r) => !r.success).length;

    const processingTime = Date.now() - startTime;

    console.log(`\n📊 Webhook processing summary:`);
    console.log(`  ✅ Successfully updated: ${successCount}`);
    console.log(`  ❌ Failed to update: ${failureCount}`);
    console.log(`  ⏱️ Processing time: ${processingTime}ms`);
    let backgroundSequenceId = null;

    if (successCount > 0) {
      const paidOrderNumbers = updateResults
        .filter((r) => r.success)
        .map((r) => r.orderNumber);

      backgroundSequenceId = schedulePostPaymentProcessing({
        paymentId: paymentDetails.paymentIntentId,
        orderNumbers: paidOrderNumbers,
      });
    }

    const responseTime = Date.now() - startTime;
    console.log(`\n🚀 Returning webhook success immediately`);
    console.log(`  ⏱️ Response time: ${responseTime}ms`);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(
      {
        success: true,
        message:
          "Orders marked as paid. Delayed processor sequence started in background.",
        summary: {
          totalOrders: ordersToUpdate.length,
          successfulUpdates: successCount,
          failedUpdates: failureCount,
          processingTimeMs: responseTime,
        },
        results: updateResults,
        nextSteps: {
          step1: "Voucher Processor scheduled at +2 seconds",
          step2: "Notification Processor runs after voucher processing completes",
          step3: "Notification Processor retries 2 seconds later",
        },
        backgroundSequenceId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [PAYFAST WEBHOOK] Fatal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook status check
 * Use this to verify the endpoint is alive
 */
export async function GET() {
  try {
    const orderStats = await prisma.order.groupBy({
      by: ["processingStatus"],
      _count: true,
      where: { isPaid: true },
    });

    return NextResponse.json({
      status: "ready",
      message: "PayFast webhook endpoint is active",
      timestamp: new Date().toISOString(),
      orderStats: orderStats,
      endpoint: "/api/payfast-webhook",
      expectedMethod: "POST",
      requiredFields: {
        pf_payment_id: "PayFast transaction ID",
        payment_status: "Must be COMPLETE",
        amount_gross: "Total payment amount",
        custom_str1: "Primary order ID",
        custom_str2: "Comma-separated order numbers (optional for multi-order)",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to manually trigger payment confirmation (for testing)
 * Remove this in production or protect with API key
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.orderIds || body.orderIds.length === 0) {
      return NextResponse.json(
        { error: "Missing orderIds" },
        { status: 400 }
      );
    }

    console.log("\n🧪 [TEST] Manually marking orders as paid:");
    console.log(`   Orders: ${body.orderIds.join(", ")}`);

    const updated = await prisma.order.updateMany({
      where: {
        id: { in: body.orderIds },
      },
      data: {
        paymentStatus: "COMPLETED",
        isPaid: true,
        processingStatus: "PAYMENT_CONFIRMED",
        paidAt: new Date(),
      },
    });

    console.log(`✅ Updated ${updated.count} orders`);

    return NextResponse.json({
      success: true,
      message: `Marked ${updated.count} orders as paid (TEST MODE)`,
      count: updated.count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
