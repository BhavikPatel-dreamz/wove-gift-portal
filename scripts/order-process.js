import { processOrderQueue } from "../src/lib/action/cronProcessor.js";
import { prisma } from "../src/lib/db.js";


async function processOrderQueueStart() {
  console.log("🔄 Starting scheduled order processor...");
  console.log("⏰ Cron job triggered at", new Date().toISOString());

  try {
    const result = await processOrderQueue();

    console.log("✅ Order queue job finished:", result);
  } catch (error) {
    console.error("❌ Scheduled order processor error:", error);
    process.exitCode = 1; // ✅ don’t hard exit unless required
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  }
}

// ✅ Run immediately when script executes
processOrderQueueStart();