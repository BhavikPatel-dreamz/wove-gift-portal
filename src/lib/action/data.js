'use server'
import prisma from "../db";


export const getBrands = async () => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        isFeature: true,
      }
    });
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Could not fetch brands.");
  }
};

export const getOccasions = async () => {
  try {
    const occasions = await prisma.occasion.findMany({
      where: {
        isActive: true,
      }
    });
    return occasions;
  } catch (error) {
    console.error("Error fetching occasions:", error);
    throw new Error("Could not fetch occasions.");
  }
};

export const getShops = async () => {
  try {
    const shops = await prisma.shopInfo.findMany();
    return shops;
  } catch (error) {
    console.error("Error fetching shops:", error);
    throw new Error("Could not fetch shops.");
  }
};
