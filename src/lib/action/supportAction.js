'use server'

import { prisma } from "../db";

function generateSupportId() {
  const prefix = "WG-SUP";
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNumber}`;
}

export async function createSupportRequest(formData) {
  try {
    const supportId = generateSupportId()

    const newSupportRequest = await prisma.supportRequest.create({
      data: {
        ...formData,
        supportId,
      },
    })

    return {
      success: true,
      data: newSupportRequest,
    };
  } catch (error) {
    console.error("Error creating support request:", error);
    return {
      success: false,
      message: "Failed to create support request",
      error: error.message,
    };
  }
}