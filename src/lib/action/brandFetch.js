"use server";

import prisma from '../db';

export async function getBrandsForClient({
  searchTerm = "",
  category = "All Categories",
  page = 1,
  limit = 12,
  sortBy = "featured" // featured, name, newest
} = {}) {
  try {
    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const whereClause = {
      isActive: true,
      ...(searchTerm && {
        OR: [
          { brandName: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tagline: { contains: searchTerm, mode: 'insensitive' } },
        ]
      }),
      ...(category && category !== "All Categories" && {
        categoryName: category
      })
    };

    // Build orderBy clause
    let orderBy;
    switch (sortBy) {
      case "name":
        orderBy = { brandName: 'asc' };
        break;
      case "newest":
        orderBy = { createdAt: 'desc' };
        break;
      case "featured":
      default:
        orderBy = [
          { isFeature: 'desc' },
          { brandName: 'asc' }
        ];
    }

    // Fetch brands with pagination
    const [brands, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where: whereClause,
        include: {
          vouchers: {
            where: { isActive: true },
            include: {
              denominations: {
                where: { isActive: true },
                orderBy: { value: 'asc' }
              }
            }
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.brand.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: brands,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasMore: page < totalPages
      }
    };

  } catch (error) {
    console.error('Error fetching brands for client:', error);
    return {
      success: false,
      message: 'Failed to fetch brands',
      error: error.message,
    };
  }
}

export async function getBrandCategories() {
  try {
    const categories = await prisma.brand.findMany({
      where: { isActive: true },
      select: { categoryName: true },
      distinct: ['categoryName'],
      orderBy: { categoryName: 'asc' }
    });

    return {
      success: true,
      data: ['All Categories', ...categories.map(c => c.categoryName).filter(Boolean)]
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      message: 'Failed to fetch categories',
      data: ['All Categories']
    };
  }
}

export const getBrands = async () => {
  try {
    const brands = await prisma?.brand?.findMany({
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