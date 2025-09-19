
"use server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "./userAction/session";

const prisma = new PrismaClient();

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function generateGiftCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let giftCode = "";
  for (let i = 0; i < 10; i++) {
    giftCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return giftCode;
}

export const createOrder = async (orderData) => {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    return {
      error: "User not authenticated.",
    };
  }

  const {
    selectedBrand,
    selectedAmount,
    selectedOccasion,
    selectedSubCategory,
    selectedSubSubCategory,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedPaymentMethod,
  } = orderData;

  try {
    const receiver = await prisma.receiverDetail.create({
      data: {
        name: deliveryDetails.recipientFullName,
        email: deliveryDetails.recipientEmailAddress,
        phone: deliveryDetails.recipientWhatsAppNumber,
      },
    });

    const order = await prisma.order.create({
      data: {
        brandId: selectedBrand.id,
        occasionId: selectedOccasion,
        subCategoryId: selectedSubCategory,
        subSubCategoryId: selectedSubSubCategory,
        amount: selectedAmount.value,
        currency: selectedAmount.currency,
        message: personalMessage,
        deliveryMethod: deliveryMethod,
        senderDetails: JSON.stringify({
          yourFullName: deliveryDetails.yourFullName,
          yourEmailAddress: deliveryDetails.yourEmailAddress,
        }),
        giftCode: generateGiftCode(),
        orderNumber: generateOrderNumber(),
        paymentMethod: selectedPaymentMethod === "card" ? "Stripe" : "COD",
        totalAmount: selectedAmount.value,
        userId: String(userId),
        receiverDetailId: receiver.id,
        sendType: orderData.selectedTiming.type === 'immediate' ? 'sendImmediately' : 'scheduleLater',
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      error: "Failed to create order.",
    };
  }
};
