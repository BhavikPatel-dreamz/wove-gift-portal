"use server";

import { prisma } from "../db";
import { z } from "zod";

const CustomCardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().optional(), // Changed from 'image' to 'imagePath'
  emoji: z.string().optional(),
  category: z.string().optional()
  
});

export async function saveCustomCard(data) {
  // Validate the data directly since image is already processed
  const validationResult = CustomCardSchema.safeParse(data);
  console.log("Validation result:", validationResult);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation error",
      errors: validationResult.error.errors,
    };
  }

  try {
    //const { name, description, image, emoji, category } = validationResult.data;
    // const cardData = {
    //   name,
    //   description,
    //   image,
    //   emoji,
    //   category,
    // };
    const newCustomCard = await prisma.customCard.create({
      data: {
        ...validationResult.data,
        name: `${validationResult.data.name} - ${Date.now()}`
      },
    });

    return {
      success: true,
      message: "Custom card created successfully",
      data: newCustomCard,
    };
  } catch (error) {
    console.error("Error creating custom card:", error);
    return {
      success: false,
      message: "Failed to create custom card",
      error: error.message,
    };
  }
}