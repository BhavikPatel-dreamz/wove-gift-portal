
import prisma from '../db'
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { z } from "zod";

const OccasionSchema = z.object({
    name: z.string().min(1, "Occasion Name is required"),
    emoji: z.string().min(1, "Emoji is required"),
    description: z.string().min(1, "Description is required"),
    isActive: z.boolean().default(false),
});

const UpdateOccasionSchema = OccasionSchema.partial().extend({
    id: z.string().min(1, "Occasion ID is required"),
});

const DeleteOccasionSchema = z.object({
    id: z.string().min(1, "Occasion ID is required"),
});

const GetOccasionSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).default(10),
    search: z.string().optional().default(''),
});

const OccasionCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    emoji: z.string().min(1, "Emoji is required"),
    isActive: z.boolean().default(false),
    occasionId: z.string().min(1, "Occasion ID is required"),
});

const UpdateOccasionCategorySchema = OccasionCategorySchema.partial().extend({
    id: z.string().min(1, "Category ID is required"),
});

export function handleValidationError(validationResult) {
    if (validationResult.success) {
        return null; // No error
    }

    const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    const firstError = validationResult.error.issues[0];
    const specificMessage = firstError.message;
    
    return { 
        success: false, 
        message: specificMessage,
        errors: errorMessages,
        status: 400 
    };
}


export async function addOccasion(req) {
    try {
        const formData = await req.formData()
        const imageFile = formData.get('image')

        const parsedData = {
            name: formData.get('name') || '',
            emoji: formData.get('emoji') || '',
            description: formData.get('description') || '',
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on' || false,
        }

        const validationResult = OccasionSchema.safeParse(parsedData);

        // Use the common validation error handler
        const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }

        const { name, emoji, description, isActive } = validationResult.data;

        const existingOccasion = await prisma.occasion.findUnique({
            where: { name: name },
        })
        if (existingOccasion) {
            return { success: false, message: "Occasion already exists", status: 409 };
        }

        let imagePath = "";
        if (imageFile && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'occasions');
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split('.').pop();
            const filename = `${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

            const filePath = join(uploadDir, filename);
            const bytes = await imageFile.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));

            imagePath = `/uploads/occasions/${filename}`;
        } else if (imageFile && typeof imageFile === 'string') {
            // Handle case where image is a URL string (though less common for creation)
            imagePath = formData.get('image');
        }

        const newOccasion = await prisma.occasion.create({
            data: {
                name,
                emoji,
                image: imagePath,
                description,
                isActive,
            }
        })
        return {
            success: true,
            message: "Occasion created successfully",
            data: newOccasion,
            status: 201
        }

    } catch (error) {
        console.error("Error creating occasion:", error)
        return {
            success: false,
            message: "Internal server error",
            status: 500
        };
    }

}

export async function updateOccasion(req) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');

        const parsedData = {
            id: formData.get('id') || '',
            name: formData.get('name') || '',
            emoji: formData.get('emoji') || '',
            description: formData.get('description') || '',
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on' || undefined,
        };

        const validationResult = UpdateOccasionSchema.safeParse(parsedData);

       const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }
        const { id, ...updatePayload } = validationResult.data;

        const existingOccasionById = await prisma.occasion.findUnique({ where: { id: id } });
        if (!existingOccasionById) {
            return { success: false, message: "Occasion not found", status: 404 };
        }

        const name = updatePayload.name;
        if (name) {
            const existingOccasion = await prisma.occasion.findFirst({
                where: {
                    name: name,
                    id: { not: id },
                },
            });

            if (existingOccasion) {
                return {
                    success: false,
                    message: "An occasion with this name already exists.",
                    status: 409,
                };
            }
        }

        let imagePath = existingOccasionById.image;

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), "public", "uploads", "occasions");
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split(".").pop();
            const occasionName = name || existingOccasionById.name;
            const filename = `${occasionName.replace(/\s+/g, "_")}_${timestamp}.${extension}`;
            const newFilePath = join(uploadDir, filename);

            const bytes = await imageFile.arrayBuffer();
            await writeFile(newFilePath, Buffer.from(bytes));

            if (existingOccasionById.image && !existingOccasionById.image.startsWith('http')) {
                try {
                    const oldFilePath = join(process.cwd(), "public", existingOccasionById.image);
                    if (existsSync(oldFilePath)) {
                        await unlink(oldFilePath);
                    }
                } catch (e) {
                    console.warn(`Failed to delete old image: ${e.message}`);
                }
            }
            imagePath = `/uploads/occasions/${filename}`;
        }

        const finalUpdateData = {
            ...updatePayload,
            image: imagePath,
            updatedAt: new Date(),
        };

        const updatedOccasion = await prisma.occasion.update({
            where: { id: id },
            data: finalUpdateData,
        })
        return {
            success: true,
            message: "Occasion updated successfully",
            data: updatedOccasion,
            status: 200
        }
    } catch (error) {
        console.error("Error updating occasion:", error);
        return {
            success: false,
            message: "Internal server error",
            status: 500
        };
    }
}

export async function deleteOccasion(req) {
    try {
        const { searchParams } = new URL(req.url);
        let id = searchParams.get('id');

        // Convert null/empty to empty string for proper Zod validation
        const parsedData = { id: id || '' }; 
        
        const validationResult = DeleteOccasionSchema.safeParse(parsedData);
       
        const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }

        // Use the validated data
        const { id: validatedId } = validationResult.data;

        const occasionData = await prisma.occasion.findUnique({
            where: { id: validatedId },
        });
        
        if (!occasionData) {
            return {
                success: false,
                message: "Occasion not found",
                status: 404
            };
        }

        // Use tr
            // Then delete the occasion
            await prisma.occasion.delete({
                where: { id: validatedId }
            });
    

        return {
            success: true,
            message: "Occasion deleted successfully",
            status: 200
        };

    } catch (error) {
        console.error("Error deleting occasion:", error);
        return {
            success: false,
            message: "Internal server error",
            status: 500
        };
    }
}

export async function getOccasion(req) {
    try {
        const { searchParams } = new URL(req.url);
        const parsedParams = {
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 10,
            search: searchParams.get('search'),
        };

        const validationResult = GetOccasionSchema.safeParse(parsedParams);


        const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }

        const { page, limit, search } = validationResult.data;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const [occasions, total] = await prisma.$transaction([
            prisma.occasion.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.occasion.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        return {
            success: true,
            data: {
                occasions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalOccation: total,
                    hasNextPage,
                    hasPrevPage,
                    limit,
                }
            },
            status: 200,
        };
    } catch (error) {
        console.error('Error fetching occasions:', error);
        return { success: false, message: 'Failed to fetch occasions', status: 500 };
    }
}

export async function addOccationCategory(req) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');

        const parsedData = {
            name: formData.get('name') || '', // Convert null to empty string
            description: formData.get('description') || '',
            emoji: formData.get('emoji') || '',
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on' || false,
            occasionId: formData.get('occasionId') || '',
        };

        const validationResult = OccasionCategorySchema.safeParse(parsedData);
        
        const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }

        // Rest of your code remains the same...
        const { name, description, emoji, isActive, occasionId } = validationResult.data;
        
        const OccasionCategoryData = await prisma.occasionCategory.findUnique({
            where: { name } // Added 'where' clause that was missing
        });
        
        if (OccasionCategoryData) {
            return {
                success: false,
                message: 'Category already exist!',
                status: 400
            }
        }

        const occasionDate = await prisma.occasion.findUnique({ where: { id: occasionId } });
        if (!occasionDate) {
            return {
                success: false,
                message: "Occasion not found",
                status: 404
            }
        }

        let imagePath = "";
        if (imageFile && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'occasion_categories');
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split('.').pop();
            const filename = `${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

            const filePath = join(uploadDir, filename);
            const bytes = await imageFile.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));

            imagePath = `/uploads/occasion_categories/${filename}`;
        }

        const newOccasionCategory = await prisma.occasionCategory.create({
            data: {
                name,
                description,
                emoji,
                image: imagePath,
                isActive,
                occasionId,
            }
        });

        return {
            success: true,
            message: "Occasion category created successfully",
            data: newOccasionCategory,
            status: 201
        };

    } catch (error) {
        console.error("Error adding occasion category:", error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}

export async function updateOccationCategory(req){
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');

        const parsedData = {
            id: formData.get('id'),
            name: formData.get('name'),
            description: formData.get('description'),
            emoji: formData.get('emoji'),
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on' || undefined,
            occasionId: formData.get('occasionId'),
        };

        // Filter out null/undefined values so Zod can apply defaults
        Object.keys(parsedData).forEach(key => (parsedData[key] == null) && delete parsedData[key]);

        const validationResult = UpdateOccasionCategorySchema.safeParse(parsedData);
        
        const validationError = handleValidationError(validationResult);
        if (validationError) {
            return validationError;
        }

        const { id, ...updatePayload } = validationResult.data;

        const existingCategory = await prisma.occasionCategory.findUnique({ where: { id } });

        if (!existingCategory) {
            return { success: false, message: "Occasion category not found", status: 404 };
        }

        if (updatePayload.name && updatePayload.name !== existingCategory.name) {
            const duplicateCategory = await prisma.occasionCategory.findFirst({
                where: {
                    name: updatePayload.name,
                    id: { not: id },
                },
            });
            if (duplicateCategory) {
                return { success: false, message: "A category with this name already exists.", status: 409 };
            }
        }

        let imagePath = existingCategory.image;
        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const uploadDir = join(process.cwd(), "public", "uploads", "occasion_categories");
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = imageFile.name.split(".").pop();
            const categoryName = updatePayload.name || existingCategory.name;
            const filename = `${categoryName.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.${extension}`;
            const newFilePath = join(uploadDir, filename);

            const bytes = await imageFile.arrayBuffer();
            await writeFile(newFilePath, Buffer.from(bytes));

            if (existingCategory.image && !existingCategory.image.startsWith('http')) {
                try {
                    const oldFilePath = join(process.cwd(), "public", existingCategory.image);
                    if (existsSync(oldFilePath)) {
                        await unlink(oldFilePath);
                    }
                } catch (e) {
                    console.warn(`Failed to delete old image: ${e.message}`);
                }
            }
            imagePath = `/uploads/occasion_categories/${filename}`;
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

        return { success: true, message: "Occasion category updated successfully", data: updatedCategory, status: 200 };

    } catch (error) {
        console.error("Error updating occasion category:", error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}
