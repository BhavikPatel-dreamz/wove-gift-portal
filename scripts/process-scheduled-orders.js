import {
  sendBulkDelivery,
  sendDeliveryMessage,
  createDeliveryLog,
} from "../src/lib/action/orderAction.js";
import { prisma } from "../src/lib/db.js";

const processScheduledOrders = async () => {
  // Get current date and time in UTC
  const now = new Date();
  
  console.log(`Current UTC time: ${now.toISOString()}`);
  console.log(`Current UTC time (readable): ${now.toUTCString()}`);
  
  const ordersToProcess = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      sendType: "scheduleLater",
      // Compare UTC to UTC - scheduledFor should be stored as UTC in DB
      scheduledFor: {
        lte: now,
      },
      deliveryLogs: {
        none: {},
      },
    },
    include: {
      brand: {
        include: {
          vouchers: {
            include: {
              denominations: true,
            },
          },
        },
      },
      receiverDetail: true,
      occasion: {
        include: {
          occasionCategories: true,
        },
      },
      bulkRecipients: {
        orderBy: {
          rowNumber: "asc",
        },
      },
      voucherCodes: {
        include: {
          giftCard: true,
        },
      },
    },
  });

  console.log(`Found ${ordersToProcess.length} scheduled orders to process.`);

  for (const order of ordersToProcess) {
    try {
      // Get the scheduled time from DB (already in UTC)
      const scheduledTimeUTC = new Date(order.scheduledFor);
      
      // Double-check that the scheduled time has actually passed
      if (scheduledTimeUTC > now) {
        console.log(
          `Skipping order ${order.orderNumber}:`,
          `\n  Scheduled UTC: ${scheduledTimeUTC.toISOString()}`,
          `\n  Current UTC:   ${now.toISOString()}`,
          `\n  Time until scheduled: ${Math.round((scheduledTimeUTC - now) / 60000)} minutes`
        );
        continue;
      }

      console.log(
        `\n✓ Processing scheduled order: ${order.orderNumber}`,
        `\n  Scheduled UTC: ${scheduledTimeUTC.toISOString()} (${scheduledTimeUTC.toUTCString()})`,
        `\n  Current UTC:   ${now.toISOString()} (${now.toUTCString()})`,
        `\n  Delay: ${Math.round((now - scheduledTimeUTC) / 60000)} minutes past scheduled time`
      );
      
      const isBulkOrder = !!order.bulkOrderNumber;
      const selectedBrand = order.brand;

      let occasionCategoryDetails = null;
      if (!order?.isCustom) {
        occasionCategoryDetails = await prisma.occasionCategory.findUnique({
          where: { id: order.subCategoryId },
        });
      } else {
        occasionCategoryDetails = await prisma.customCard.findUnique({
          where: { id: order.customCardId },
        });
      }

      const orderData = {
        selectedBrand,
        selectedSubCategory: occasionCategoryDetails,
        selectedAmount: {
          value: order.amount,
          currency: order.currency,
        },
        quantity: order.quantity,
        isBulkOrder,
        companyInfo: isBulkOrder
          ? {
              companyName: order.senderName,
              contactEmail: order.senderEmail,
              contactNumber: order.receiverDetail.phone,
            }
          : null,
        deliveryOption: isBulkOrder ? "email" : null,
        deliveryMethod: order.deliveryMethod,
        deliveryDetails: !isBulkOrder
          ? {
              recipientFullName: order.receiverDetail.name,
              recipientEmailAddress: order.receiverDetail.email,
              recipientWhatsAppNumber: order.receiverDetail.phone,
              recipientCountryCode: order.receiverDetail.countryCode,
            }
          : null,
        personalMessage: order.message,
      };

      if (isBulkOrder) {
        const voucherCodes = order.voucherCodes;
        const giftCards = voucherCodes.map((vc) => vc.giftCard).filter(Boolean);
        const bulkRecipients = order.bulkRecipients;

        const deliveryResult = await sendBulkDelivery(
          orderData,
          voucherCodes,
          giftCards,
          bulkRecipients
        );

        for (const voucherCode of voucherCodes) {
          await createDeliveryLog(
            order,
            voucherCode.id,
            orderData,
            deliveryResult
          );
        }
        console.log(`✓ Bulk order ${order.orderNumber} processed successfully.`);
      } else {
        const voucherCode = order.voucherCodes[0];
        if (!voucherCode) {
          throw new Error(
            `No voucher code found for single order ${order.orderNumber}`
          );
        }

        // Use the actual gift card code from the GiftCard table, not the masked code
        const shopifyGiftCard = {
          code: voucherCode.giftCard?.code || voucherCode.code,
        };

        const deliveryResult = await sendDeliveryMessage(
          orderData,
          shopifyGiftCard,
          orderData.deliveryMethod
        );

        if (!deliveryResult.success && orderData.deliveryMethod !== "print") {
          throw new Error(
            `Message delivery failed for order ${order.orderNumber}: ${deliveryResult.message}`
          );
        }

        await createDeliveryLog(
          order,
          voucherCode.id,
          orderData,
          deliveryResult
        );
        console.log(
          `✓ Single order ${order.orderNumber} processed successfully.`
        );
      }
    } catch (error) {
      console.error(
        `✗ Failed to process scheduled order ${order.orderNumber}:`,
        error
      );
    }
  }
  
  console.log(`\n--- Processing completed at ${now.toISOString()} ---`);
};

processScheduledOrders()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });