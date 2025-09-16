"use server";

import prisma from '../db'
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { unlink } from 'fs/promises';

export async function addBrand(formData) {
    try {
        // Get form fields directly from FormData
        const brandName = formData.get('brandName');
        const logoFile = formData.get('logo');
        const description = formData.get('description') || "";
        const website = formData.get('website') || "";
        const contact = formData.get('contact') || "";
        const tagline = formData.get('tagline') || "";
        const color = formData.get('color') || "";
        const categorieName = formData.get('categorieName') || "";
        const notes = formData.get('notes') || "";
        const isActive = formData.get('isActive') === 'true' || formData.get('isActive') === 'on';
        const isFeature = formData.get('isFeature') === 'true' || formData.get('isFeature') === 'on';

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
            try {
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
            } catch (fileError) {
                console.error('File upload error:', fileError);
                return {
                    success: false,
                    message: "Failed to upload logo",
                    status: 500
                };
            }
        }

        // Create brand
        const newBrand = await prisma.brand.create({
            data: {
                brandName,
                logo: logoPath,
                description,
                website,
                contact,
                tagline,
                color,
                categorieName,
                notes,
                isActive,
                isFeature
            }
        });

        return {
            success: true,
            message: "Brand created successfully",
            data: newBrand,
            status: 201
        };

    } catch (error) {
        console.error('Error creating brand:', error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return {
                success: false,
                message: "Brand name already exists",
                status: 400
            };
        }

        return {
            success: false,
            message: "Internal server error",
            error: error.message,
            status: 500
        };
    }
}

export async function updateBrand(formData) {
    try {
        // Get the brand ID
        const id = formData.get('id');
        
        if (!id) {
            return {
                success: false,
                message: "Brand ID is required",
                status: 400
            };
        }

        // Get form fields
        const brandName = formData.get('brandName');
        const logoFile = formData.get('logo');
        const description = formData.get('description') || "";
        const website = formData.get('website') || "";
        const contact = formData.get('contact') || "";
        const tagline = formData.get('tagline') || "";
        const color = formData.get('color') || "";
        const categorieName = formData.get('categorieName') || "";
        const notes = formData.get('notes') || "";
        const isActive = formData.get('isActive') === 'true';
        const isFeature = formData.get('isFeature') === 'true';

        // Get existing brand to check for logo updates
        const existingBrand = await prisma.brand.findUnique({
            where: { id }
        });

        if (!existingBrand) {
            return {
                success: false,
                message: "Brand not found",
                status: 404
            };
        }

        let logoPath = existingBrand.logo;

        // Handle logo upload if new file provided
        if (logoFile && logoFile.size > 0) {
            try {
                // Create upload directory
                const uploadDir = join(process.cwd(), 'public', 'uploads', 'brands');
                await mkdir(uploadDir, { recursive: true });

                // Delete old logo if it exists
                if (existingBrand.logo) {
                    const oldLogoPath = join(process.cwd(), 'public', existingBrand.logo);
                    try {
                        await unlink(oldLogoPath);
                    } catch (error) {
                        // Ignore error if file doesn't exist
                        console.log('Could not delete old logo:', error.message);
                    }
                }

                // Generate new filename
                const timestamp = Date.now();
                const extension = logoFile.name.split('.').pop();
                const filename = `${brandName?.toLowerCase().replace(/\s+/g, '_') || 'brand'}_${timestamp}.${extension}`;

                // Save new file
                const filePath = join(uploadDir, filename);
                const bytes = await logoFile.arrayBuffer();
                await writeFile(filePath, Buffer.from(bytes));

                logoPath = `/uploads/brands/${filename}`;
            } catch (fileError) {
                console.error('File upload error:', fileError);
                return {
                    success: false,
                    message: "Failed to upload logo",
                    status: 500
                };
            }
        }

        // Prepare update data
        const updateData = {
            description,
            website,
            contact,
            tagline,
            color,
            categorieName,
            notes,
            isActive,
            isFeature,
            logo: logoPath,
        };

        // Only update brandName if provided (since it's unique)
        if (brandName && brandName !== existingBrand.brandName) {
            updateData.brandName = brandName;
        }

        // Update brand
        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: updateData
        });

        return {
            success: true,
            message: "Brand updated successfully",
            data: updatedBrand,
            status: 200
        };

    } catch (error) {
        console.error('Error updating brand:', error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return {
                success: false,
                message: "Brand name already exists",
                status: 400
            };
        }

        if (error.code === 'P2025') {
            return {
                success: false,
                message: "Brand not found",
                status: 404
            };
        }

        return {
            success: false,
            message: "Internal server error",
            error: error.message,
            status: 500
        };
    }
}

export async function deleteBrand(brandId) {
    try {
        if (!brandId) {
            return {
                success: false,
                message: "Brand ID is required",
                status: 400
            };
        }

        // Get the brand first to check for logo
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

        // Delete the brand from database
        await prisma.brand.delete({
            where: { id: brandId }
        });

        // Delete logo file if it exists
        if (existingBrand.logo) {
            const logoPath = join(process.cwd(), 'public', existingBrand.logo);
            try {
                await unlink(logoPath);
            } catch (error) {
                // Ignore error if file doesn't exist
                console.log('Could not delete logo file:', error.message);
            }
        }


        return {
            success: true,
            message: "Brand deleted successfully",
            status: 200
        };

    } catch (error) {
        console.error('Error deleting brand:', error);
        
        if (error.code === 'P2025') {
            return {
                success: false,
                message: "Brand not found",
                status: 404
            };
        }

        return {
            success: false,
            message: "Internal server error",
            error: error.message,
            status: 500
        };
    }
}

export async function getBrands(params = {}) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            isActive = null,
            isFeature = null,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = params;

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause for filtering
        const whereClause = {};

        // Search functionality
        if (search) {
            whereClause.OR = [
                {
                    brandName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    tagline: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    categorieName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Category filter
        if (category && category !== 'All Brands') {
            whereClause.categorieName = category;
        }

        // Active status filter
        if (isActive !== null) {
            whereClause.isActive = isActive === 'true';
        }

        // Featured status filter
        if (isFeature !== null) {
            whereClause.isFeature = isFeature === 'true';
        }

        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        // Execute query with pagination
        const [brands, totalCount] = await Promise.all([
            prisma.brand.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    _count: {
                        select: {
                            order: true,
                            vouchers: true
                        }
                    }
                }
            }),
            prisma.brand.count({
                where: whereClause
            })
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Get overall statistics
        const stats = await prisma.brand.aggregate({
            _count: {
                id: true
            },
            where: {
                isActive: true
            }
        });

        const featuredCount = await prisma.brand.count({
            where: {
                isFeature: true
            }
        });

        const totalBrands = await prisma.brand.count();

        return {
            success: true,
            data: brands,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage,
                hasPrevPage,
                startIndex: skip + 1,
                endIndex: Math.min(skip + limitNum, totalCount)
            },
            statistics: {
                total: totalBrands,
                active: stats._count.id,
                featured: featuredCount,
                activeRate: totalBrands > 0 ? Math.round((stats._count.id / totalBrands) * 100) : 0
            },
            filters: {
                search,
                category,
                isActive,
                isFeature,
                sortBy,
                sortOrder
            }
        };

    } catch (error) {
        console.error('Error fetching brands:', error);
        return {
            success: false,
            message: 'Failed to fetch brands',
            error: error.message,
            status: 500
        };
    }
}

export async function searchBrands(searchTerm, options = {}) {
    try {
        const {
            limit = 5,
            includeInactive = false
        } = options;

        const whereClause = {
            OR: [
                {
                    brandName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    tagline: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ]
        };

        if (!includeInactive) {
            whereClause.isActive = true;
        }

        const brands = await prisma.brand.findMany({
            where: whereClause,
            take: limit,
            orderBy: {
                brandName: 'asc'
            },
            select: {
                id: true,
                brandName: true,
                tagline: true,
                logo: true,
                color: true,
                categorieName: true,
                isActive: true,
                isFeature: true
            }
        });

        return {
            success: true,
            data: brands,
            count: brands.length
        };

    } catch (error) {
        console.error('Error searching brands:', error);
        return {
            success: false,
            message: 'Failed to search brands',
            error: error.message
        };
    }
}

export async function getBrandsByCategory(category, options = {}) {
    try {
        const {
            limit = 10,
            page = 1,
            includeInactive = false
        } = options;

        const skip = (page - 1) * limit;
        
        const whereClause = {
            categorieName: category
        };

        if (!includeInactive) {
            whereClause.isActive = true;
        }

        const [brands, totalCount] = await Promise.all([
            prisma.brand.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    brandName: 'asc'
                }
            }),
            prisma.brand.count({
                where: whereClause
            })
        ]);

        return {
            success: true,
            data: brands,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        };

    } catch (error) {
        console.error('Error fetching brands by category:', error);
        return {
            success: false,
            message: 'Failed to fetch brands by category',
            error: error.message
        };
    }
}

export async function getFeaturedBrands(limit = 6) {
    try {
        const brands = await prisma.brand.findMany({
            where: {
                isFeature: true,
                isActive: true
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: brands,
            count: brands.length
        };

    } catch (error) {
        console.error('Error fetching featured brands:', error);
        return {
            success: false,
            message: 'Failed to fetch featured brands',
            error: error.message
        };
    }
}

export async function getBrandStats() {
    try {
        const [totalBrands, activeBrands, featuredBrands, categoryStats] = await Promise.all([
            prisma.brand.count(),
            prisma.brand.count({ where: { isActive: true } }),
            prisma.brand.count({ where: { isFeature: true } }),
            prisma.brand.groupBy({
                by: ['categorieName'],
                _count: {
                    categorieName: true
                },
                where: {
                    categorieName: {
                        not: null
                    }
                }
            })
        ]);

        return {
            success: true,
            data: {
                total: totalBrands,
                active: activeBrands,
                featured: featuredBrands,
                inactive: totalBrands - activeBrands,
                activeRate: totalBrands > 0 ? Math.round((activeBrands / totalBrands) * 100) : 0,
                featuredRate: totalBrands > 0 ? Math.round((featuredBrands / totalBrands) * 100) : 0,
                categoryDistribution: categoryStats.map(stat => ({
                    category: stat.categorieName,
                    count: stat._count.categorieName,
                    percentage: totalBrands > 0 ? Math.round((stat._count.categorieName / totalBrands) * 100) : 0
                }))
            }
        };

    } catch (error) {
        console.error('Error fetching brand stats:', error);
        return {
            success: false,
            message: 'Failed to fetch brand statistics',
            error: error.message
        };
    }
}