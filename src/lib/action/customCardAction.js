"use server";

import prisma from "../db";
import { z } from "zod";

const CustomCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bgColor: z.string().optional().nullable(),
  bgImage: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
});

export async function createCustomCard(data) {
  const validationResult = CustomCardSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation error",
      errors: validationResult.error.errors,
    };
  }

  try {
    const newCustomCard = await prisma.customCard.create({
      data: validationResult.data,
    });
    return {
      success: true,
      message: "Custom card created successfully",
      data: newCustomCard,
    };
  } catch (error) {
    console.log("error",error);
    
    return {
      success: false,
      message: "Failed to create custom card",
      error: error.message,
    };
  }
}
