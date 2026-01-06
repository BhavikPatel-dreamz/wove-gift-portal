"use server"

import { prisma } from '../db'
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const OccasionSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    emoji: z.string().optional(),
    description: z.string()
        .max(500, "Description must be less than 500 characters")
        .default('')
        .transform(val => val?.trim() || ''),
    type: z.string()
        .min(1, "Type is required")
        .max(100, "Type must be less than 100 characters")
        .trim(),
    isActive: z.boolean().default(false),
    image: z.string().optional(),
});

const UpdateOccasionSchema = OccasionSchema.partial().extend({
    id: z.string().min(1, "Occasion ID is required").trim(),
});

const OccasionCategorySchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    description: z.string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters")
        .trim(),
    emoji: z.string()
        .min(1, "Emoji is required")
        .max(10, "Emoji must be less than 10 characters"),
    category: z.string()
        .min(1, "Category is required")
        .max(100, "Category must be less than 100 characters")
        .trim(),
    isActive: z.boolean().default(false),
    occasionId: z.string().min(1, "Occasion ID is required").trim(),
    image: z.string().optional(),
});

const UpdateOccasionCategorySchema = OccasionCategorySchema.partial().extend({
    id: z.string().min(1, "Category ID is required").trim(),
});

const GetOccasionsSchema = z.object({
    id: z.string().optional(),
    search: z.string().optional(),
    isActive: z.boolean().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(12),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const IdSchema = z.string().min(1, "ID is required").trim();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function handleValidationError(validationResult) {
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return {
            success: false,
            message: `Validation error: ${errors}`,
            status: 400,
            errors: validationResult.error.errors
        };
    }
    return null;
}

function createStandardResponse(success, message, status, data = null, meta = null) {
    const response = { success, message, status };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return response;
}

async function handleImageUpload(imageFile, uploadPath, namePrefix) {
    if (!imageFile || typeof imageFile === 'string' || imageFile.size === 0) {
        return typeof imageFile === 'string' && imageFile.trim() ? imageFile.trim() : '';
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', uploadPath);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${namePrefix.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

    const filePath = join(uploadDir, filename);
    const bytes = await imageFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return `/uploads/${uploadPath}/${filename}`;
}

async function deleteImageFile(imagePath) {
    if (!imagePath || imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return;
    }

    try {
        const filePath = join(process.cwd(), 'public', imagePath);
        if (existsSync(filePath)) {
            await unlink(filePath);
        }
    } catch (error) {
        console.warn(`Failed to delete image file: ${error.message}`);
    }
}

function parseFormData(formData, fields) {
    const result = {};
    for (const [key, parser] of Object.entries(fields)) {
        const value = formData.get(key);
        result[key] = parser ? parser(value) : value;
    }
    return result;
}

// ============================================================================
// OCCASION ACTIONS
// ============================================================================

export async function addOccasion(formData) {
    try {
        const parsedData = parseFormData(formData, {
            name: (val) => val?.toString().trim() || '',
            emoji: (val) => val?.toString() || '🎉',
            description: (val) => val?.toString().trim() || '',
            type: (val) => val?.toString().trim() || '',
            isActive: (val) => val === 'true' || val === 'on'
        });

        const validationResult = OccasionSchema.safeParse(parsedData);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const { name, emoji, description, type, isActive } = validationResult.data;

        // Check for existing occasion
        const existingOccasion = await prisma.occasion.findUnique({
            where: { name }
        });

        if (existingOccasion) {
            return createStandardResponse(
                false,
                "Occasion with this name already exists",
                409
            );
        }

        // Handle image upload
        const imageFile = formData.get('image');
        const imagePath = await handleImageUpload(imageFile, 'occasions', name);

        const newOccasion = await prisma.occasion.create({
            data: {
                name,
                emoji,
                description,
                type,
                isActive,
                image: imagePath,
            }
        });

        return createStandardResponse(
            true,
            "Occasion created successfully",
            201,
            newOccasion
        );

    } catch (error) {
        console.error("addOccasion error:", error);
        return createStandardResponse(
            false,
            "Failed to create occasion. Please try again.",
            500
        );
    }
}

export async function updateOccasion(formData) {
    try {
        const parsedData = parseFormData(formData, {
            id: (val) => val?.toString().trim() || '',
            name: (val) => val?.toString().trim(),
            emoji: (val) => val?.toString(),
            description: (val) => val?.toString().trim(),
            type: (val) => val?.toString().trim(),
            isActive: (val) => val === 'true' || val === 'on' ? true : val === 'false' ? false : undefined
        });

        // Remove undefined values so Zod can handle partial updates properly
        Object.keys(parsedData).forEach(key => {
            if (parsedData[key] === undefined || parsedData[key] === null) {
                delete parsedData[key];
            }
        });

        const validationResult = UpdateOccasionSchema.safeParse(parsedData);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const { id, ...updateData } = validationResult.data;

        // Find existing occasion
        const existingOccasion = await prisma.occasion.findUnique({
            where: { id }
        });

        if (!existingOccasion) {
            return createStandardResponse(false, "Occasion not found", 404);
        }

        // Check for name conflicts
        if (updateData.name && updateData.name !== existingOccasion.name) {
            const nameConflict = await prisma.occasion.findFirst({
                where: {
                    name: updateData.name,
                    id: { not: id }
                }
            });

            if (nameConflict) {
                return createStandardResponse(
                    false,
                    "An occasion with this name already exists",
                    409
                );
            }
        }

        // Handle image upload
        const imageFile = formData.get('image');
        let imagePath = existingOccasion.image;

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            // Delete old image
            await deleteImageFile(existingOccasion.image);
            
            // Upload new image
            const occasionName = updateData.name || existingOccasion.name;
            imagePath = await handleImageUpload(imageFile, 'occasions', occasionName);
        } else if (typeof imageFile === 'string' && imageFile.trim()) {
            imagePath = imageFile.trim();
        }

        const finalUpdateData = {
            ...updateData,
            image: imagePath,
            updatedAt: new Date()
        };

        const updatedOccasion = await prisma.occasion.update({
            where: { id },
            data: finalUpdateData
        });

        return createStandardResponse(
            true,
            "Occasion updated successfully",
            200,
            updatedOccasion
        );

    } catch (error) {
        console.error("updateOccasion error:", error);
        return createStandardResponse(
            false,
            "Failed to update occasion. Please try again.",
            500
        );
    }
}

export async function deleteOccasion(id) {
    try {
        const validationResult = IdSchema.safeParse(id);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const validId = validationResult.data;

        const occasionData = await prisma.occasion.findUnique({
            where: { id: validId }
        });

        if (!occasionData) {
            return createStandardResponse(false, "Occasion not found", 404);
        }

        // Delete associated image
        await deleteImageFile(occasionData.image);

        // Delete occasion and related records in transaction
       await prisma.$transaction(async (tx) => {
    // 1. Delete orders referencing this occasion
    await tx.order.deleteMany({
        where: { occasionId: validId }
    });

    // 2. Delete occasion categories
    await tx.occasionCategory.deleteMany({
        where: { occasionId: validId }
    });

    // 3. Delete the occasion
    await tx.occasion.delete({
        where: { id: validId }
    });
});


        return createStandardResponse(
            true,
            "Occasion deleted successfully",
            200
        );

    } catch (error) {
        console.error("deleteOccasion error:", error);
        return createStandardResponse(
            false,
            "Failed to delete occasion. Please try again.",
            500
        );
    }
}

export async function getOccasions(params = {}) {
    try {
        // Parse and validate parameters
        const page = Math.max(1, parseInt(params.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 12));
        const search = params.search?.trim() || '';
        const sortBy = ['name', 'createdAt', 'updatedAt'].includes(params.sortBy) 
            ? params.sortBy 
            : 'createdAt';
        const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
        const isActive = params.isActive !== undefined 
            ? String(params.isActive) === 'true' 
            : undefined;

        // Validate with schema if you have one
        const validationResult = GetOccasionsSchema.safeParse({
            page, limit, search, sortBy, sortOrder, isActive
        });
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        // Build where clause
        const where = {};
        
        if (params.id) {
            where.id = params.id;
        }
        
        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        
        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch data with parallel queries for better performance
        const [occasions, totalItems] = await Promise.all([
            prisma.occasion.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.occasion.count({ where })
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch card counts in batch (more efficient than individual queries)
        const occasionIds = occasions.map(o => o.id);
        const cardCounts = await prisma.occasionCategory.groupBy({
            by: ['occasionId'],
            where: {
                occasionId: { in: occasionIds }
            },
            _count: {
                id: true
            }
        });

        // Create a map for quick lookup
        const cardCountMap = cardCounts.reduce((acc, item) => {
            acc[item.occasionId] = item._count.id;
            return acc;
        }, {});

        // Add card counts to occasions
        const occasionsWithCounts = occasions.map(occasion => ({
            ...occasion,
            cardCount: cardCountMap[occasion.id] || 0,
            active: occasion.isActive,
        }));

        // Build pagination metadata
        const pagination = {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            startIndex: totalItems > 0 ? skip + 1 : 0,
            endIndex: Math.min(skip + limit, totalItems),
        };

        return createStandardResponse(
            true,
            "Occasions fetched successfully",
            200,
            occasionsWithCounts,
            { pagination }
        );

    } catch (error) {
        console.error("getOccasions error:", error);
        return createStandardResponse(
            false,
            "Failed to fetch occasions. Please try again.",
            500
        );
    }
}

export async function getOccasionById(id) {
    try {
        const validationResult = IdSchema.safeParse(id);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const validId = validationResult.data;

        const occasion = await prisma.occasion.findUnique({
            where: { id: validId }
        });

        if (!occasion) {
            return createStandardResponse(false, "Occasion not found", 404);
        }

        // Get card count
        const cardCount = await prisma.occasionCategory.count({
            where: { occasionId: occasion.id }
        }).catch(() => 0);

        const transformedOccasion = {
            ...occasion,
            cardCount,
            active: occasion.isActive,
        };

        return createStandardResponse(
            true,
            "Occasion fetched successfully",
            200,
            transformedOccasion
        );

    } catch (error) {
        console.error("getOccasionById error:", error);
        return createStandardResponse(
            false,
            "Failed to fetch occasion. Please try again.",
            500
        );
    }
}

// ============================================================================
// OCCASION CATEGORY ACTIONS
// ============================================================================

export async function addOccasionCategory(formData) {
    try {
        // formData is already a FormData object, no need to await req.formData()
const parsedData = parseFormData(formData, {
            name: (val) => val?.toString().trim() || '',
            description: (val) => val?.toString().trim() || '',
            emoji: (val) => val?.toString() || '',
            category: (val) => val?.toString().trim() || '',
            isActive: (val) => val === 'true' || val === 'on',
            occasionId: (val) => val?.toString().trim() || '',
        });

        const validationResult = OccasionCategorySchema.safeParse(parsedData);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const { name, description, emoji, category, isActive, occasionId } = validationResult.data;

        // Check if category already exists
        const existingCategory = await prisma.occasionCategory.findUnique({
            where: { name }
        });

        if (existingCategory) {
            return createStandardResponse(
                false,
                'Category with this name already exists!',
                409
            );
        }

        // Verify occasion exists
        const occasion = await prisma.occasion.findUnique({
            where: { id: occasionId }
        });

        if (!occasion) {
            return createStandardResponse(false, "Occasion not found", 404);
        }

        // Handle image upload
        const imageFile = formData.get('image');
        const imagePath = await handleImageUpload(imageFile, 'occasion_categories', name);

        const newOccasionCategory = await prisma.occasionCategory.create({
            data: {
                name,
                description,
                emoji,
                category,
                image: imagePath,
                isActive,
                occasionId,
            }
        });

        return createStandardResponse(
            true,
            "Occasion category created successfully",
            201,
            newOccasionCategory
        );

    } catch (error) {
        console.error("Error adding occasion category:", error);
        return createStandardResponse(
            false,
            "Failed to create occasion category. Please try again.",
            500
        );
    }
}

export async function updateOccasionCategory(formData) {
    try {
        // formData is already a FormData object, no need to await req.formData()
        
        const parsedData = parseFormData(formData, {
            id: (val) => val?.toString().trim() || '',
            name: (val) => val?.toString().trim(),
            description: (val) => val?.toString().trim(),
            emoji: (val) => val?.toString(),
            category: (val) => val?.toString().trim(),
            isActive: (val) => val === 'true' || val === 'on' ? true : val === 'false' ? false : undefined,
            occasionId: (val) => val?.toString().trim(),
        });

        // Remove undefined values
        Object.keys(parsedData).forEach(key => {
            if (parsedData[key] === undefined || parsedData[key] === null) {
                delete parsedData[key];
            }
        });

        const validationResult = UpdateOccasionCategorySchema.safeParse(parsedData);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const { id, ...updatePayload } = validationResult.data;

        const existingCategory = await prisma.occasionCategory.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            return createStandardResponse(
                false,
                "Occasion category not found",
                404
            );
        }

        // Check for name conflicts
        if (updatePayload.name && updatePayload.name !== existingCategory.name) {
            const duplicateCategory = await prisma.occasionCategory.findFirst({
                where: {
                    name: updatePayload.name,
                    id: { not: id }
                }
            });

            if (duplicateCategory) {
                return createStandardResponse(
                    false,
                    "A category with this name already exists.",
                    409
                );
            }
        }

        // Verify occasion exists if occasionId is being updated
        if (updatePayload.occasionId) {
            const occasion = await prisma.occasion.findUnique({
                where: { id: updatePayload.occasionId }
            });

            if (!occasion) {
                return createStandardResponse(false, "Occasion not found", 404);
            }
        }

        // Handle image upload
        const imageFile = formData.get('image');
        let imagePath = existingCategory.image;

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            // Delete old image
            await deleteImageFile(existingCategory.image);
            
            // Upload new image
            const categoryName = updatePayload.name || existingCategory.name;
            imagePath = await handleImageUpload(imageFile, 'occasion_categories', categoryName);
        } else if (typeof imageFile === 'string' && imageFile.trim()) {
            imagePath = imageFile.trim();
        }

        const finalUpdateData = {
            ...updatePayload,
            image: imagePath,
            updatedAt: new Date(),
        };

        const updatedCategory = await prisma.occasionCategory.update({
            where: { id },
            data: finalUpdateData,
        });

        return createStandardResponse(
            true,
            "Occasion category updated successfully",
            200,
            updatedCategory
        );

    } catch (error) {
        console.error("Error updating occasion category:", error);
        return createStandardResponse(
            false,
            "Failed to update occasion category. Please try again.",
            500
        );
    }
}

export async function deleteOccasionCategory(id) {
    try {
        const validationResult = IdSchema.safeParse(id);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const validId = validationResult.data;

        const categoryData = await prisma.occasionCategory.findUnique({
            where: { id: validId }
        });

        if (!categoryData) {
            return createStandardResponse(
                false,
                "Occasion category not found",
                404
            );
        }

        // Delete associated image
        await deleteImageFile(categoryData.image);

        // Delete category
        await prisma.occasionCategory.delete({
            where: { id: validId }
        });

        return createStandardResponse(
            true,
            "Occasion category deleted successfully",
            200
        );

    } catch (error) {
        console.error("deleteOccasionCategory error:", error);
        return createStandardResponse(
            false,
            "Failed to delete occasion category. Please try again.",
            500
        );
    }
}

export async function getOccasionCategories(params = {}) {
    try {
        const processedParams = {
            ...params,
            page: params.page ? parseInt(params.page, 10) : undefined,
            limit: params.limit ? parseInt(params.limit, 10) : undefined,
            isActive: params.isActive !== undefined ? String(params.isActive) === 'true' : undefined
        };

        const validationResult = GetOccasionsSchema.extend({
            occasionId: z.string().optional()
        }).safeParse(processedParams);
        
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const {
            id,
            search,
            isActive,
            page,
            limit,
            sortBy,
            sortOrder,
            occasionId
        } = validationResult.data;

        const where = {};
        if (id) where.id = id;
        if (occasionId) where.occasionId = occasionId;
        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        if (isActive !== undefined) where.isActive = isActive;

        const skip = (page - 1) * limit;

        // Fetch selected occasion details if occasionId is provided
        let selectedOccasion = null;
        if (occasionId) {
            selectedOccasion = await prisma.occasion.findUnique({
                where: { id: occasionId },
                select: { id: true, name: true, emoji: true, description: true, type: true }
            });
            if (!selectedOccasion) {
                return createStandardResponse(false, "Occasion not found", 404);
            }
        }

        // Remove the problematic include for now
        const [categories, totalItems] = await Promise.all([
            prisma.occasionCategory.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                // Remove the include section that's causing the error
                // include: {
                //     occasion: {
                //         select: { name: true, emoji: true }
                //     }
                // }
            }),
            prisma.occasionCategory.count({ where })
        ]);

        // If you need occasion data, fetch it separately
        let categoriesWithOccasion = categories;
        if (categories.length > 0 && !occasionId) {
            // Only fetch occasion data if we're not filtering by occasionId already
            const occasionIds = [...new Set(categories.map(cat => cat.occasionId))];
            const occasions = await prisma.occasion.findMany({
                where: { id: { in: occasionIds } },
                select: { id: true, name: true, emoji: true }
            });
            
            const occasionMap = occasions.reduce((acc, occasion) => {
                acc[occasion.id] = occasion;
                return acc;
            }, {});
            
            categoriesWithOccasion = categories.map(category => ({
                ...category,
                occasion: occasionMap[category.occasionId] || null
            }));
        }

        const totalPages = Math.ceil(totalItems / limit);

        const pagination = {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            startIndex: skip + 1,
            endIndex: Math.min(skip + limit, totalItems),
        };

        const meta = { pagination };
        if (selectedOccasion) {
            meta.occasion = selectedOccasion;
        }

        return createStandardResponse(
            true,
            "Occasion categories fetched successfully",
            200,
            categoriesWithOccasion,
            meta
        );

    } catch (error) {
        console.error("getOccasionCategories error:", error);
        return createStandardResponse(
            false,
            "Failed to fetch occasion categories. Please try again.",
            500
        );
    }
}

// ============================================================================\n// GET OCCASION BY ID\n// ============================================================================\n\nexport async function getOccasionById(id) {\n    try {\n        const validationResult = IdSchema.safeParse(id);\n        if (!validationResult.success) {\n            return createStandardResponse(false, \"Invalid ID format\", 400);\n        }\n\n        const occasion = await prisma.occasion.findUnique({\n            where: { id },\n            include: {\n                _count: {\n                    select: { occasionCategories: true },\n                },\n            },\n        });\n\n        if (!occasion) {\n            return createStandardResponse(false, \"Occasion not found\", 404);\n        }\n\n        // Map _count to cardCount for consistency with getOccasions\n        const { _count, ...rest } = occasion;\n        const formattedOccasion = {\n            ...rest,\n            cardCount: _count?.occasionCategories || 0,\n        };\n\n        return createStandardResponse(\n            true,\n            \"Occasion retrieved successfully\",\n            200,\n            formattedOccasion\n        );\n\n    } catch (error) {\n        console.error(`getOccasionById error for id: ${id}:`, error);\n        return createStandardResponse(\n            false,\n            \"Failed to retrieve occasion. Please try again.\",\n            500\n        );\n    }\n}
export async function getOccasionCategoryById(id) {
    try {
        const validationResult = IdSchema.safeParse(id);
        const validationError = handleValidationError(validationResult);
        if (validationError) return validationError;

        const validId = validationResult.data;

        const category = await prisma.occasionCategory.findUnique({
            where: { id: validId },
            // Remove the problematic include section
        });

        if (!category) {
            return createStandardResponse(
                false,
                "Occasion category not found",
                404
            );
        }

        // If you need occasion data, fetch it separately
        let categoryWithOccasion = category;
        if (category.occasionId) {
            const occasion = await prisma.occasion.findUnique({
                where: { id: category.occasionId },
                select: { id: true, name: true, emoji: true }
            });
            
            categoryWithOccasion = {
                ...category,
                occasion: occasion || null
            };
        }

        return createStandardResponse(
            true,
            "Occasion category fetched successfully",
            200,
            categoryWithOccasion
        );

    } catch (error) {
        console.error("getOccasionCategoryById error:", error);
        return createStandardResponse(
            false,
            "Failed to fetch occasion category. Please try again.",
            500
        );
    }
}