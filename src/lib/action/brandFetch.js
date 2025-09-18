"use server";

import prisma from '../db';

export async function getBrandsForClient() {
    try {
        const brands = await prisma.brand.findMany({
            where: {
                isActive: true,
            },
            include: {
                vouchers: true,
            },
            orderBy: {
                isFeature: 'desc', 
            }
        });

        return {
            success: true,
            data: brands,
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
