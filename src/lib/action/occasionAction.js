
import prisma from '../db'
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function addOccasion(req) {
    try {
        const formData = await req.formData();
        const name = formData.get('name');
        const emoji = formData.get('emoji');
        const description = formData.get('description');
        const isActive = formData.get('isActive') === 'true' || false;
        const imageFile = formData.get('image');

        const existingOccasion = await prisma.occasion.findUnique({
            where: { name: name },
        })
        if (existingOccasion) {
            return {
                success: false,
                message: "Occasion already exists",
                status: 409
            };
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
        } else if (typeof formData.get('image') === 'string') {
            // Handle case where image is a URL string
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
        console.log(error, "error")
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
        const id = formData.get('id');

        if (!id) {
            return { success: false, message: "Occasion ID is required", status: 400 };
        }

        const existingOccasionById = await prisma.occasion.findUnique({ where: { id } });
        if (!existingOccasionById) {
            return { success: false, message: "Occasion not found", status: 404 };
        }

        const name = formData.get('name');
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
        const imageFile = formData.get('image');

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

        const updateData = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'id' && key !== 'image' && value !== null && value !== undefined) {
                updateData[key] = key === 'isActive' ? (value === 'true') : value;
            }
        }
        updateData.image = imagePath;
        updateData.updatedAt = new Date();

        const updatedOccasion = await prisma.occasion.update({
            where: { id: id },
            data: updateData,
        })
        return {
            success: true,
            message: "Occasion updated successfully",
            data: updatedOccasion,
            status: 200
        }
    } catch (error) {
        console.log(error, "error");
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
        const id = searchParams.get('id');
        if (!id) {
            return { success: false, message: "Occasion ID is required", status: 400 };
        }
        const occasionData = await prisma.occasion.findUnique({
            where: { id },
        })
        if (!occasionData) {
            return {
                success: false,
                message: "Occasion not found",
                status: 404
            };
        }
        await prisma.occasion.delete({
            where: { id },
        })
        await prisma.occasionCategory.deleteMany({
            where: { occasionId: id },
        })
        return {
            success: true,
            message: "Occasion deleted successfully",
            status: 200
        }

    } catch (error) {
        console.log(error, "error")
        return {
            success: false,
            message: "Internal server error",
            status: 500
        };
    }
}
