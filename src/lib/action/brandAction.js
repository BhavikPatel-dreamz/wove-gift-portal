import prisma from '../db'
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';



export async function addBrand(req) {
    try {
        const formData = await req.formData();

        // Get form fields
        const brandName = formData.get('brandName');
        const logoFile = formData.get('logo');
        const description = formData.get('description') || "";
        const website = formData.get('website') || "";
        const contact = formData.get('contact') || "";
        const isActive = formData.get('isActive') || false;
        const isFeature = formData.get('isFeature') || false;

        // Validate required fields
        if (!brandName) {
            return {
                success: false,
                message: "brandName is required",
                status: 400
            };
        }

        let logoPath = "";

        // Handle logo upload
        if (logoFile && logoFile.size > 0) {
            // Create upload directory
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'brands');
            await mkdir(uploadDir, { recursive: true });

            // Generate filename
            const timestamp = Date.now();
            const extension = logoFile.name.split('.').pop();
            const filename = `${brandName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${extension}`;

            // Save file
            const filePath = join(uploadDir, filename);
            const bytes = await logoFile.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));

            logoPath = `/uploads/brands/${filename}`;
        }

        // Create brand
        const newBrand = await prisma.brand.create({
            data: {
                brandName,
                logo: logoPath,
                description,
                website,
                contact,
                isActive,
                isFeature,
                tagline: formData.get('tagline') || "",
                color: formData.get('color') || "",
                categorieName: formData.get('categorieName') || "",
                notes: formData.get('notes') || ""
            }
        });

        return {
            success: true,
            message: "Brand created successfully",
            data: newBrand,
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

export async function updateBrand(req) {
    try {
        const formData = await req.formData();
        const brandId = formData.get("id");

        if (!brandId) {
            return {
                success: false,
                message: "Brand ID is required",
                status: 400,
            };
        }

        // Check if brand exists
        const existingBrand = await prisma.brand.findUnique({
            where: { id: brandId },
        });

        if (!existingBrand) {
            return {
                success: false,
                message: "Brand not found",
                status: 404,
            };
        }

        let logoPath = existingBrand.logo;

        // Handle logo upload if new file provided
        const logoFile = formData.get("logo");
        if (logoFile && logoFile.size > 0) {
            const uploadDir = join(process.cwd(), "public", "uploads", "brands");
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const extension = logoFile.name.split(".").pop();
            const brandName = formData.get("brandName") || existingBrand.brandName;
            const filename = `${brandName.replace(/\s+/g, "_")}_${timestamp}.${extension}`;
            const newFilePath = join(uploadDir, filename);

            const bytes = await logoFile.arrayBuffer();
            await writeFile(newFilePath, Buffer.from(bytes));

            // Remove old logo
            if (existingBrand.logo) {
                try {
                    const oldFilePath = join(process.cwd(), "public", existingBrand.logo);
                    if (existsSync(oldFilePath)) {
                        await unlink(oldFilePath);
                    }
                } catch (e) {
                    console.warn(`Failed to delete old logo: ${e.message}`);
                }
            }

            logoPath = `/uploads/brands/${filename}`;
        }

        // Build updateData dynamically (only include fields present in formData)
        const updateData = { updatedAt: new Date() };

        const fields = [
            "brandName",
            "description",
            "website",
            "contact",
            "tagline",
            "color",
            "notes",
            "categorieName"
        ];

        fields.forEach((field) => {
            const value = formData.get(field);
            if (value !== null && value !== undefined && value !== "") {
                updateData[field] = value;
            }
        });

        // Booleans (explicit handling)
        if (formData.has("isActive")) {
            updateData.isActive = formData.get("isActive") === "true";
        }
        if (formData.has("isFeature")) {
            updateData.isFeature = formData.get("isFeature") === "true";
        }

        // Logo (if new file was uploaded)
        if (logoPath !== existingBrand.logo) {
            updateData.logo = logoPath;
        }

        // Update in DB
        const updatedBrand = await prisma.brand.update({
            where: { id: brandId },
            data: updateData,
        });

        return {
            success: true,
            message: "Brand updated successfully",
            brand: updatedBrand,
            status: 200,
        };
    } catch (error) {
        console.error("Error updating brand:", error);
        return {
            success: false,
            message: "Failed to update brand",
            status: 500,
        };
    }
}


export async function deleteBrand(req) {
    try {

        // Extract brand ID from form data
        const { searchParams } = new URL(req.url);
        const brandId = searchParams.get("id");
        if (!brandId) {
            return {
                success: false,
                message: "Brand ID is required",
                status: 400
            };
        }

        // Check if brand exists
        const existingBrand = await prisma.brand.findUnique({
            where: { id: brandId }
        });

        if (!existingBrand) {
            return {
                success: false,
                message: "Brand not found",
                status: 404
            };
        }

        // Use transaction to ensure all deletions succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Delete related records first (if not handled by cascade)
            await tx.settlements.deleteMany({
                where: { brandId }
            });

            await tx.order.deleteMany({
                where: { brandId }
            });

            await tx.vouchers.deleteMany({
                where: { brandId }
            });

            await tx.brandBanking.deleteMany({
                where: { brandId }
            });

            await tx.brandTerms.deleteMany({
                where: { brandId }
            });

            await tx.brandContacts.deleteMany({
                where: { brandId }
            });

            // Delete the main brand record last
            const deletedBrand = await tx.brand.delete({
                where: { id: brandId }
            });

            return deletedBrand;
        });

        return {
            success: true,
            message: "Brand deleted successfully",
            data: result,
            status: 200
        };

    } catch (error) {
        console.error("Error deleting brand:", error);
        return {
            success: false,
            message: "Internal server error",
            status: 500
        };
    }
}