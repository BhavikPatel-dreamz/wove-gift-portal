"use server"

import prisma from '../db'
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function addOccasion(formData) {
    try {
        const name = formData.get('name');
        const emoji = formData.get('emoji');
        const description = formData.get('description');
        const isActive = formData.get('isActive') === 'true';
        const imageFile = formData.get('image');

        // Validate required fields
        if (!name || !name.trim()) {
            return {
                success: false,
                message: "Occasion name is required",
                status: 400
            };
        }

        // Check if occasion already exists
        const existingOccasion = await prisma.occasion.findUnique({
            where: { name: name.trim() },
        });

        if (existingOccasion) {
            return {
                success: false,
                message: "Occasion with this name already exists",
                status: 409
            };
        }

        let imagePath = "";
        
        // Handle image upload
        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'occasions');
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split('.').pop();
            const filename = `${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

            const filePath = join(uploadDir, filename);
            const bytes = await imageFile.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));

            imagePath = `/uploads/occasions/${filename}`;
        } else if (typeof imageFile === 'string' && imageFile.trim()) {
            // Handle case where image is a URL string
            imagePath = imageFile.trim();
        }

        const newOccasion = await prisma.occasion.create({
            data: {
                name: name.trim(),
                emoji: emoji || '🎉',
                image: imagePath,
                description: description?.trim() || '',
                isActive,
            }
        });

        return {
            success: true,
            message: "Occasion created successfully",
            data: newOccasion,
            status: 201
        };

    } catch (error) {
        console.error("addOccasion error:", error);
        return {
            success: false,
            message: "Failed to create occasion. Please try again.",
            status: 500
        };
    }
}

export async function updateOccasion(formData) {
    try {
        const id = formData.get('id');

        if (!id || !id.trim()) {
            return { 
                success: false, 
                message: "Occasion ID is required", 
                status: 400 
            };
        }

        // Find existing occasion
        const existingOccasion = await prisma.occasion.findUnique({ 
            where: { id: id.trim() } 
        });

        if (!existingOccasion) {
            return { 
                success: false, 
                message: "Occasion not found", 
                status: 404 
            };
        }

        const name = formData.get('name');
        
        // Check for name conflicts if name is being updated
        if (name && name.trim() && name.trim() !== existingOccasion.name) {
            const nameConflict = await prisma.occasion.findFirst({
                where: {
                    name: name.trim(),
                    id: { not: id.trim() },
                },
            });

            if (nameConflict) {
                return {
                    success: false,
                    message: "An occasion with this name already exists",
                    status: 409,
                };
            }
        }

        let imagePath = existingOccasion.image;
        const imageFile = formData.get('image');

        // Handle new image upload
        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), "public", "uploads", "occasions");
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split(".").pop();
            const occasionName = (name && name.trim()) || existingOccasion.name;
            const filename = `${occasionName.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.${extension}`;
            const newFilePath = join(uploadDir, filename);

            const bytes = await imageFile.arrayBuffer();
            await writeFile(newFilePath, Buffer.from(bytes));

            // Delete old image file if it exists and is not a URL
            if (existingOccasion.image && 
                !existingOccasion.image.startsWith('http') && 
                !existingOccasion.image.startsWith('data:')) {
                try {
                    const oldFilePath = join(process.cwd(), "public", existingOccasion.image);
                    if (existsSync(oldFilePath)) {
                        await unlink(oldFilePath);
                    }
                } catch (e) {
                    console.warn(`Failed to delete old image: ${e.message}`);
                }
            }
            
            imagePath = `/uploads/occasions/${filename}`;
        } else if (typeof imageFile === 'string' && imageFile.trim()) {
            imagePath = imageFile.trim();
        }

        // Build update data
        const updateData = {
            image: imagePath,
            updatedAt: new Date(),
        };

        // Only update fields that are provided
        if (name && name.trim()) updateData.name = name.trim();
        if (formData.get('emoji')) updateData.emoji = formData.get('emoji');
        if (formData.get('description') !== null) updateData.description = formData.get('description')?.trim() || '';
        if (formData.get('isActive') !== null) updateData.isActive = formData.get('isActive') === 'true';

        const updatedOccasion = await prisma.occasion.update({
            where: { id: id.trim() },
            data: updateData,
        });

        return {
            success: true,
            message: "Occasion updated successfully",
            data: updatedOccasion,
            status: 200
        };

    } catch (error) {
        console.error("updateOccasion error:", error);
        return {
            success: false,
            message: "Failed to update occasion. Please try again.",
            status: 500
        };
    }
}

export async function deleteOccasion(id) {
    try {
        if (!id || !id.trim()) {
            return { 
                success: false, 
                message: "Occasion ID is required", 
                status: 400 
            };
        }

        const occasionData = await prisma.occasion.findUnique({
            where: { id: id.trim() },
        });

        if (!occasionData) {
            return {
                success: false,
                message: "Occasion not found",
                status: 404
            };
        }

        // Delete associated image file if it exists and is not a URL
        if (occasionData.image && 
            !occasionData.image.startsWith('http') && 
            !occasionData.image.startsWith('data:')) {
            try {
                const filePath = join(process.cwd(), "public", occasionData.image);
                if (existsSync(filePath)) {
                    await unlink(filePath);
                }
            } catch (e) {
                console.warn(`Failed to delete image file: ${e.message}`);
            }
        }

        // Delete occasion and related records in a transaction
        await prisma.$transaction(async (tx) => {
            // Try to delete related occasion categories - using multiple possible field names
            try {
                await tx.occasionCategory.deleteMany({
                    where: { occasionId: id.trim() },
                });
            } catch (e) {
                console.warn("No related occasion categories to delete or different field name");
            }

            // Delete the occasion
            await tx.occasion.delete({
                where: { id: id.trim() },
            });
        });

        return {
            success: true,
            message: "Occasion deleted successfully",
            status: 200
        };

    } catch (error) {
        console.error("deleteOccasion error:", error);
        return {
            success: false,
            message: "Failed to delete occasion. Please try again.",
            status: 500
        };
    }
}

export async function getOccasions(params = {}) {
    try {
        const { id, name, isActive, page = 1, limit = 100 } = params;

        let where = {};
        
        if (id) where.id = id;
        if (name) where.name = { contains: name, mode: "insensitive" };
        if (isActive !== null && isActive !== undefined) {
            where.isActive = String(isActive) === "true";
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get occasions without relation counting to avoid field errors
        const [occasions, total] = await Promise.all([
            prisma.occasion.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: parseInt(limit),
            }),
            prisma.occasion.count({ where })
        ]);

        // Get card counts separately to avoid field name issues
        const occasionsWithCounts = await Promise.all(
            occasions.map(async (occasion) => {
                let cardCount = 0;
                
                // Try different possible relation names/table names
                try {
                    // Try occasionCategory first
                    cardCount = await prisma.occasionCategory.count({
                        where: { occasionId: occasion.id }
                    });
                } catch (e) {
                    try {
                        // Try cards table if it exists
                        cardCount = await prisma.card?.count({
                            where: { occasionId: occasion.id }
                        }) || 0;
                    } catch (e2) {
                        // If both fail, default to 0
                        cardCount = 0;
                    }
                }

                return {
                    ...occasion,
                    cardCount,
                    active: occasion.isActive,
                };
            })
        );

        return {
            success: true,
            message: "Occasions fetched successfully",
            data: occasionsWithCounts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            status: 200,
        };

    } catch (error) {
        console.error("getOccasions error:", error);
        return {
            success: false,
            message: "Failed to fetch occasions. Please try again.",
            status: 500,
        };
    }
}

export async function getOccasionById(id) {
    try {
        if (!id || !id.trim()) {
            return {
                success: false,
                message: "Occasion ID is required",
                status: 400
            };
        }

        const occasion = await prisma.occasion.findUnique({
            where: { id: id.trim() },
        });

        if (!occasion) {
            return {
                success: false,
                message: "Occasion not found",
                status: 404
            };
        }

        // Get card count separately
        let cardCount = 0;
        try {
            cardCount = await prisma.occasionCategory.count({
                where: { occasionId: occasion.id }
            });
        } catch (e) {
            try {
                cardCount = await prisma.card?.count({
                    where: { occasionId: occasion.id }
                }) || 0;
            } catch (e2) {
                cardCount = 0;
            }
        }

        const transformedOccasion = {
            ...occasion,
            cardCount,
            active: occasion.isActive,
        };

        return {
            success: true,
            message: "Occasion fetched successfully",
            data: transformedOccasion,
            status: 200
        };

    } catch (error) {
        console.error("getOccasionById error:", error);
        return {
            success: false,
            message: "Failed to fetch occasion. Please try again.",
            status: 500
        };
    }
}