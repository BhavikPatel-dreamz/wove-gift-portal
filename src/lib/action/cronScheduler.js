/**
 * IMPROVED CRON SCHEDULER
 * 
 * This scheduler manages two independent cron jobs:
 * 
 * JOB 1: Voucher Processor (runs every 10 seconds)
 * - Finds orders with PAYMENT_CONFIRMED status
 * - Creates vouchers and gift cards in Shopify
 * - Updates order to VOUCHERS_CREATED
 * 
 * JOB 2: Notification Processor (runs every 15 seconds)
 * - Finds orders with VOUCHERS_CREATED status
 * - Sends notifications (email/WhatsApp/print)
 * - Updates order to COMPLETED
 * 
 * Both jobs use database locks (FOR UPDATE SKIP LOCKED) to prevent:
 * ✅ Concurrent processing of same order
 * ✅ Duplicate voucher creation
 * ✅ Duplicate notification sending
 * ✅ Race conditions between webhook and cron
 */

import cron from "node-cron";
import voucherProcessorCron from "./cronProcessor.js";
import notificationProcessorCron from "./Notificationprocessorcron.js";
import { prisma } from "../db.js";


// ==================== INITIALIZE CRON JOBS ====================

/**
 * Start all cron jobs
 */
export function startCronJobs() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 STARTING CRON SCHEDULER");
  console.log("=".repeat(80));

  // Start Job 1: Voucher Processor
  console.log("\n📝 Initializing Job 1: Voucher Processor");
  voucherProcessorCron();

  // Start Job 2: Notification Processor
  console.log("📧 Initializing Job 2: Notification Processor");
  notificationProcessorCron();

  // Start health check
  startHealthCheck();

  console.log("\n" + "=".repeat(80));
  console.log("✅ CRON SCHEDULER STARTED");
  console.log("=".repeat(80));
  console.log(`
🎟️  Job 1 (Voucher Processor):
   - Runs every 10 seconds
   - Creates vouchers and gift cards for paid orders
   - Processes 1 order at a time sequentially
   - Updates order to VOUCHERS_CREATED when done

📧 Job 2 (Notification Processor):
   - Runs every 15 seconds
   - Sends notifications for orders with ready vouchers
   - Processes up to 5 orders per run
   - Updates order to COMPLETED when done

🔒 Both jobs use database locks to prevent:
   - Concurrent processing
   - Duplicate vouchers
   - Duplicate notifications
   - Race conditions

💡 For immediate testing, make a payment via webhook
  `);
}

/**
 * Health check - logs stats every minute
 */
function startHealthCheck() {
  cron.schedule("0 * * * * *", async () => {
    try {
      const stats = await getOrderStats();
      console.log("\n📊 [HEALTH CHECK]", new Date().toLocaleTimeString());
      console.log(`  ✅ PAYMENT_CONFIRMED: ${stats.paymentConfirmed}`);
      console.log(`  🎟️ VOUCHERS_CREATING: ${stats.vouchersCreating}`);
      console.log(`  ✅ VOUCHERS_CREATED: ${stats.vouchersCreated}`);
      console.log(`  📧 NOTIFICATIONS_SENDING: ${stats.notificationsSending}`);
      console.log(`  ✅ COMPLETED: ${stats.completed}`);
      console.log(`  ❌ FAILED: ${stats.failed}`);
      console.log(`  🔄 RETRYING: ${stats.retrying}`);
    } catch (error) {
      console.error("❌ Health check error:", error.message);
    }
  });
}

/**
 * Get order statistics
 */
async function getOrderStats() {
  try {
    const stats = await prisma.order.groupBy({
      by: ["processingStatus"],
      _count: true,
      where: {
        isPaid: true,
      },
    });

    const result = {
      paymentConfirmed: 0,
      vouchersCreating: 0,
      vouchersCreated: 0,
      notificationsSending: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
    };

    for (const stat of stats) {
      const key = stat._count.processingStatus;
      if (stat.processingStatus === "PAYMENT_CONFIRMED")
        result.paymentConfirmed += key;
      else if (stat.processingStatus === "VOUCHERS_CREATING")
        result.vouchersCreating += key;
      else if (stat.processingStatus === "VOUCHERS_CREATED")
        result.vouchersCreated += key;
      else if (stat.processingStatus === "NOTIFICATIONS_SENDING")
        result.notificationsSending += key;
      else if (stat.processingStatus === "COMPLETED") result.completed += key;
      else if (stat.processingStatus === "FAILED") result.failed += key;
      else if (stat.processingStatus === "RETRYING") result.retrying += key;
    }

    return result;
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      paymentConfirmed: 0,
      vouchersCreating: 0,
      vouchersCreated: 0,
      notificationsSending: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
    };
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

/**
 * Gracefully shutdown cron and database
 */
export async function stopCronJobs() {
  console.log("\n🛑 Stopping cron scheduler...");
  
  try {
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting Prisma:", error);
  }

  process.exit(0);
}

// Handle process termination
process.on("SIGTERM", stopCronJobs);
process.on("SIGINT", stopCronJobs);

export default startCronJobs;