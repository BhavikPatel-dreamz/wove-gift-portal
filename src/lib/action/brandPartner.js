"use server";

import prisma from "../db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { unlink } from "fs/promises";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SALT_ROUNDS = 12;
const TRANSACTION_TIMEOUT = 10000; // 10 seconds

// Hash sensitive data with caching to avoid rehashing
const hashCache = new Map();
async function hashSensitiveData(data) {
  if (!data) return null;
  
  if (hashCache.has(data)) {
    return hashCache.get(data);
  }
  
  const hashed = await bcrypt.hash(data, SALT_ROUNDS);
  hashCache.set(data, hashed);
  return hashed;
}

// Updated Schemas
const ContactSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().min(1, "Phone is required"),
  notes: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
});

const IntegrationSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  platform: z.string(),
  storeUrl: z.string().url("Invalid store URL").optional().nullable(),
  storeName: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiSecret: z.string().optional().nullable(),
  accessToken: z.string().optional().nullable(),
  consumerKey: z.string().optional().nullable(),
  consumerSecret: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const BrandPartnerSchema = z.object({
  // Core Brand Info
  brandName: z.string().min(1, "Brand name is required"),
  slug: z.string().optional(), // Auto-generated from brandName
  description: z.string().min(1, "Description is required"),
  website: z.string().url("Invalid website URL"),
  contact: z.string().optional(),
  tagline: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  categoryName: z.string().min(1, "Category is required"),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(false),
  isFeature: z.boolean().default(false),

  // Brand Terms
  settlementTrigger: z.enum(["onRedemption", "onPurchase"]).default("onRedemption"),
  commissionType: z.enum(["Fixed", "Percentage"]).default("Percentage"),
  commissionValue: z.number().min(0, "Commission value must be positive"),
  maxDiscount: z.number().min(0).optional().nullable(),
  minOrderValue: z.number().min(0).optional().nullable(),
  currency: z.string().default("USD"),
  breakagePolicy:z.string().optional(),
  breakageShare: z.number().min(0).max(100).optional().nullable(),
  contractStart: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid contract start date",
    }).optional()
  ),
  contractEnd: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid contract end date",
    }).optional()
  ),
  goLiveDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid go live date",
    }).optional()
  ),
  renewContract: z.boolean().default(false),
  vatRate: z.number().min(0).max(100).optional().nullable(),
  internalNotes: z.string().optional().nullable(),

  // Voucher Configuration
  denominationType: z.enum(["fixed", "amount"]).default("fixed"),
  denominations: z.any().optional().nullable(),
  denominationValue: z.any().optional().nullable(),
  denominationCurrency: z.string().default("USD"),
  maxAmount: z.number().min(0).optional().nullable(),
  minAmount: z.number().min(0).optional().nullable(),
  expiryPolicy: z.string().default("fixedDate"),
  expiryValue: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  graceDays: z.number().min(0).optional().nullable(),
  redemptionChannels: z.any().optional().nullable(),
  partialRedemption: z.boolean().default(false),
  stackable: z.boolean().default(false),
  maxUserPerDay: z.number().min(1).optional().nullable(),
  termsConditionsURL: z.string().optional().nullable(),
  productSku: z.string().optional().nullable(),

  // Banking Details
  settlementFrequency: z.enum(["daily", "weekly", "monthly", "quarterly"]).default("monthly"),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  payoutMethod: z.enum(["EFT", "wire_transfer", "paypal", "stripe", "manual"]).default("EFT"),
  invoiceRequired: z.boolean().default(false),
  remittanceEmail: z.string().email("Invalid email format").optional().nullable(),
  accountHolder: z.string().min(1, "Account holder is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  bankName: z.string().min(1, "Bank name is required"),
  swiftCode: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"),
  accountVerification: z.boolean().default(false),

  // Relations
  contacts: z.array(ContactSchema).min(1, "At least one contact is required"),
  integrations: z.array(IntegrationSchema).optional().default([]),
}).refine(
  (data) => {
    if (data?.settlementTrigger === "onPurchase") return true;
    if (!data.contractStart || !data.contractEnd) return true;
    const startDate = new Date(data.contractStart);
    const endDate = new Date(data.contractEnd);
    return startDate < endDate;
  },
  {
    message: "Contract end date must be after start date",
    path: ["contractEnd"],
  }
);

// Helper to generate slug from brand name
function generateSlug(brandName) {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to prepare integration data with hashing
async function prepareIntegrationData(integration, brandId) {
  return {
    brandId,
    platform: integration.platform,
    storeUrl: integration.storeUrl || null,
    storeName: integration.storeName || null,
    apiKey: integration.apiKey ? await hashSensitiveData(integration.apiKey) : null,
    apiSecret: integration.apiSecret ? await hashSensitiveData(integration.apiSecret) : null,
    accessToken: integration.accessToken ? await hashSensitiveData(integration.accessToken) : null,
    consumerKey: integration.consumerKey ? await hashSensitiveData(integration.consumerKey) : null,
    consumerSecret: integration.consumerSecret ? await hashSensitiveData(integration.consumerSecret) : null,
    isActive: integration.isActive ?? true,
  };
}

export async function createBrandPartner(formData) {
  try {
    // Parse form data
    let parsedData;
    if (formData instanceof FormData) {
      const dataString = formData.get("data");
      const logoFile = formData.get("logo");

      if (dataString) {
        parsedData = JSON.parse(dataString);
        parsedData.logoFile = logoFile;
      } else {
        return {
          success: false,
          message: "No data provided",
          status: 400,
        };
      }
    } else {
      parsedData = typeof formData === "string" ? JSON.parse(formData) : formData;
    }

    // Validate data with Zod
    const validationResult = BrandPartnerSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );

      return {
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        status: 400,
      };
    }

    const validatedData = validationResult.data;
    let logoPath = "";

    // Handle logo upload BEFORE transaction
    if (parsedData.logoFile && parsedData.logoFile.size > 0) {
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "brands");
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const extension = parsedData.logoFile.name.split(".").pop();
        const filename = `${generateSlug(validatedData.brandName)}_${timestamp}.${extension}`;

        const filePath = join(uploadDir, filename);
        const bytes = await parsedData.logoFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        logoPath = `/uploads/brands/${filename}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return {
          success: false,
          message: "Failed to upload logo",
          status: 500,
        };
      }
    }

    // Pre-hash sensitive data for integrations
    const integrationDataPromises = (validatedData.integrations || []).map(integration => 
      prepareIntegrationData(integration, null)
    );
    const integrationsData = await Promise.all(integrationDataPromises);

    // Prepare denomination value
    const denominationValue = validatedData.denominationValue != null && 
      validatedData.denominationValue !== "" 
      ? parseInt(validatedData.denominationValue, 10) 
      : null;

    const currentDate = new Date();
    const slug = generateSlug(validatedData.brandName);

    // Use transaction with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      // Create brand with all nested relations
      const brand = await tx.brand.create({
        data: {
          brandName: validatedData.brandName,
          slug,
          logo: logoPath,
          description: validatedData.description,
          website: validatedData.website,
          contact: validatedData.contact || "",
          tagline: validatedData.tagline,
          color: validatedData.color,
          categoryName: validatedData.categoryName,
          notes: validatedData.notes,
          isActive: validatedData.isActive,
          isFeature: validatedData.isFeature,

          // Nested create for BrandTerms (one-to-one)
          brandTerms: {
            create: {
              settlementTrigger: validatedData.settlementTrigger,
              commissionType: validatedData.commissionType,
              commissionValue: validatedData.commissionValue,
              maxDiscount: validatedData.maxDiscount,
              minOrderValue: validatedData.minOrderValue,
              currency: validatedData.currency,
              breakagePolicy: validatedData.breakagePolicy,
              breakageShare: validatedData.breakageShare,
              contractStart: validatedData.contractStart ? new Date(validatedData.contractStart) : null,
              contractEnd: validatedData.contractEnd ? new Date(validatedData.contractEnd) : null,
              goLiveDate: validatedData.goLiveDate ? new Date(validatedData.goLiveDate) : null,
              renewContract: validatedData.renewContract,
              vatRate: validatedData.vatRate,
              internalNotes: validatedData.internalNotes || "",
            }
          },

          // Nested create for Vouchers
          vouchers: {
            create: {
              denominationType: validatedData.denominationType,
              denominations: validatedData.denominations,
              denominationCurrency: validatedData.denominationCurrency,
              denominationValue: denominationValue,
              maxAmount: validatedData.maxAmount,
              minAmount: validatedData.minAmount,
              expiryPolicy: validatedData.expiryPolicy,
              expiryValue: validatedData.expiryPolicy === "noExpiry" ? null : validatedData.expiryValue,
              expiresAt: validatedData.expiresAt || null,
              graceDays: validatedData.graceDays,
              redemptionChannels: validatedData.redemptionChannels,
              partialRedemption: validatedData.partialRedemption,
              stackable: validatedData.stackable,
              maxUserPerDay: validatedData.maxUserPerDay,
              termsConditionsURL: validatedData.termsConditionsURL,
              productSku: validatedData.productSku,
              isActive: true,
            }
          },

          // Nested create for BrandBanking (one-to-one)
          brandBankings: {
            create: {
              settlementFrequency: validatedData.settlementFrequency,
              dayOfMonth: validatedData.dayOfMonth,
              payoutMethod: validatedData.payoutMethod,
              invoiceRequired: validatedData.invoiceRequired,
              remittanceEmail: validatedData.remittanceEmail,
              accountHolder: validatedData.accountHolder,
              accountNumber: await hashSensitiveData(validatedData.accountNumber), // Hash account number
              branchCode: validatedData.branchCode,
              bankName: validatedData.bankName,
              swiftCode: validatedData.swiftCode,
              country: validatedData.country,
              accountVerification: validatedData.accountVerification,
            }
          },

          // Nested create for BrandContacts
          brandContacts: {
            create: validatedData.contacts.map(contact => ({
              name: contact.name,
              role: contact.role,
              email: contact.email,
              phone: contact.phone,
              notes: contact.notes,
              isPrimary: contact.isPrimary,
            }))
          }
        }
      });

      // Create integrations separately if any
      if (integrationsData.length > 0) {
        await tx.integration.createMany({
          data: integrationsData.map(integration => ({
            ...integration,
            brandId: brand.id
          }))
        });
      }

      return brand;
    }, {
      timeout: TRANSACTION_TIMEOUT
    });

    return {
      success: true,
      message: "Brand partner created successfully",
      data: result,
      status: 201,
    };
  } catch (error) {
    console.error("Error creating brand partner:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        message: "Brand name or slug already exists",
        status: 400,
      };
    }

    return {
      success: false,
      message: "Internal server error",
      error: error.message,
      status: 500,
    };
  }
}

export async function updateBrandPartner(brandId, formData) {
  try {
    if (!brandId) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    // Parse form data
    let parsedData;
    if (formData instanceof FormData) {
      const dataString = formData.get("data");
      const logoFile = formData.get("logo");

      if (dataString) {
        parsedData = JSON.parse(dataString);
        parsedData.logoFile = logoFile;
      }
    } else {
      parsedData = typeof formData === "string" ? JSON.parse(formData) : formData;
    }

    // Validate data with Zod
    const validationResult = BrandPartnerSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );

      return {
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        status: 400,
      };
    }

    const validatedData = validationResult.data;

    // Get existing brand data
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        brandTerms: true,
        brandBankings: true,
        vouchers: { take: 1 },
      },
    });

    if (!existingBrand) {
      return {
        success: false,
        message: "Brand partner not found",
        status: 404,
      };
    }

    let logoPath = existingBrand.logo;

    // Handle logo upload BEFORE transaction
    if (parsedData.logoFile && parsedData.logoFile.size > 0) {
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "brands");
        await mkdir(uploadDir, { recursive: true });

        // Delete old logo
        if (existingBrand.logo) {
          const oldLogoPath = join(process.cwd(), "public", existingBrand.logo);
          try {
            await unlink(oldLogoPath);
          } catch (error) {
            console.log("Could not delete old logo:", error.message);
          }
        }

        const timestamp = Date.now();
        const extension = parsedData.logoFile.name.split(".").pop();
        const filename = `${generateSlug(validatedData.brandName)}_${timestamp}.${extension}`;

        const filePath = join(uploadDir, filename);
        const bytes = await parsedData.logoFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        logoPath = `/uploads/brands/${filename}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return {
          success: false,
          message: "Failed to upload logo",
          status: 500,
        };
      }
    }

    // Pre-hash integration data
    const integrationDataPromises = (validatedData.integrations || []).map(integration => 
      prepareIntegrationData(integration, brandId)
    );
    const integrationsData = await Promise.all(integrationDataPromises);

    const denominationValue = validatedData.denominationValue != null && 
      validatedData.denominationValue !== "" 
      ? parseInt(validatedData.denominationValue, 10) 
      : null;

    const slug = generateSlug(validatedData.brandName);

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update brand
      const updatedBrand = await tx.brand.update({
        where: { id: brandId },
        data: {
          brandName: validatedData.brandName,
          slug,
          logo: logoPath,
          description: validatedData.description,
          website: validatedData.website,
          contact: validatedData.contact || "",
          tagline: validatedData.tagline,
          color: validatedData.color,
          categoryName: validatedData.categoryName,
          notes: validatedData.notes,
          isActive: validatedData.isActive,
          isFeature: validatedData.isFeature,
        },
      });

      // Batch update operations
      const operations = [];

      // Brand Terms (one-to-one)
      const brandTermsData = {
        settlementTrigger: validatedData.settlementTrigger,
        commissionType: validatedData.commissionType,
        commissionValue: validatedData.commissionValue,
        maxDiscount: validatedData.maxDiscount,
        minOrderValue: validatedData.minOrderValue,
        currency: validatedData.currency,
        breakagePolicy: validatedData.breakagePolicy,
        breakageShare: validatedData.breakageShare,
        contractStart: validatedData.contractStart ? new Date(validatedData.contractStart) : null,
        contractEnd: validatedData.contractEnd ? new Date(validatedData.contractEnd) : null,
        goLiveDate: validatedData.goLiveDate ? new Date(validatedData.goLiveDate) : null,
        renewContract: validatedData.renewContract,
        vatRate: validatedData.vatRate,
        internalNotes: validatedData.internalNotes || "",
      };

      if (existingBrand.brandTerms) {
        operations.push(
          tx.brandTerms.update({
            where: { brandId },
            data: brandTermsData,
          })
        );
      } else {
        operations.push(
          tx.brandTerms.create({
            data: { ...brandTermsData, brandId },
          })
        );
      }

      // Vouchers
      const voucherData = {
        denominationType: validatedData.denominationType,
        denominations: validatedData.denominations,
        denominationCurrency: validatedData.denominationCurrency,
        denominationValue: denominationValue,
        maxAmount: validatedData.maxAmount,
        minAmount: validatedData.minAmount,
        expiryPolicy: validatedData.expiryPolicy,
        expiryValue: validatedData.expiryPolicy === "noExpiry" ? null : validatedData.expiryValue,
        expiresAt: validatedData.expiresAt || null,
        graceDays: validatedData.graceDays,
        redemptionChannels: validatedData.redemptionChannels,
        partialRedemption: validatedData.partialRedemption,
        stackable: validatedData.stackable,
        maxUserPerDay: validatedData.maxUserPerDay,
        termsConditionsURL: validatedData.termsConditionsURL,
        productSku: validatedData.productSku,
      };

      if (existingBrand.vouchers[0]) {
        operations.push(
          tx.vouchers.update({
            where: { id: existingBrand.vouchers[0].id },
            data: voucherData,
          })
        );
      } else {
        operations.push(
          tx.vouchers.create({
            data: { ...voucherData, brandId },
          })
        );
      }

      // Banking (one-to-one)
      const bankingData = {
        settlementFrequency: validatedData.settlementFrequency,
        dayOfMonth: validatedData.dayOfMonth,
        payoutMethod: validatedData.payoutMethod,
        invoiceRequired: validatedData.invoiceRequired,
        remittanceEmail: validatedData.remittanceEmail,
        accountHolder: validatedData.accountHolder,
        accountNumber: await hashSensitiveData(validatedData.accountNumber),
        branchCode: validatedData.branchCode,
        bankName: validatedData.bankName,
        swiftCode: validatedData.swiftCode,
        country: validatedData.country,
        accountVerification: validatedData.accountVerification,
      };

      if (existingBrand.brandBankings) {
        operations.push(
          tx.brandBanking.update({
            where: { brandId },
            data: bankingData,
          })
        );
      } else {
        operations.push(
          tx.brandBanking.create({
            data: { ...bankingData, brandId },
          })
        );
      }

      // Execute all update operations
      await Promise.all(operations);

      // Handle contacts and integrations with delete + recreate
      await Promise.all([
        tx.brandContacts.deleteMany({ where: { brandId } }),
        tx.integration.deleteMany({ where: { brandId } }),
      ]);

      await Promise.all([
        tx.brandContacts.createMany({
          data: validatedData.contacts.map(contact => ({
            brandId,
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes,
            isPrimary: contact.isPrimary,
          }))
        }),
        integrationsData.length > 0 ? tx.integration.createMany({ data: integrationsData }) : Promise.resolve(),
      ]);

      return updatedBrand;
    }, {
      timeout: TRANSACTION_TIMEOUT
    });

    return {
      success: true,
      message: "Brand partner updated successfully",
      data: result,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating brand partner:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        message: "Brand name or slug already exists",
        status: 400,
      };
    }

    return {
      success: false,
      message: "Internal server error",
      error: error.message,
      status: 500,
    };
  }
}

export async function getBrandPartnerDetails(brandId) {
  try {
    if (!brandId) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    const brandPartner = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        brandContacts: {
          orderBy: { isPrimary: "desc" },
        },
        brandTerms: true,
        brandBankings: true,
        vouchers: true,
        integrations: {
          select: {
            id: true,
            platform: true,
            storeUrl: true,
            storeName: true,
            isActive: true,
            lastSyncAt: true,
            syncStatus: true,
            createdAt: true,
            updatedAt: true,
            // Exclude all sensitive fields
          },
        },
      },
    });

    if (!brandPartner) {
      return {
        success: false,
        message: "Brand partner not found",
        status: 404,
      };
    }

    return {
      success: true,
      data: brandPartner,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching brand partner:", error);
    return {
      success: false,
      message: "Failed to fetch brand partner",
      error: error.message,
      status: 500,
    };
  }
}

export async function getBrandPartner(params = {}) {
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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { brandName: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { categoryName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'All Brands') {
      whereClause.categoryName = category;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    if (isFeature !== null) {
      whereClause.isFeature = isFeature === 'true';
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Execute query
    const [brands, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              orders: true,
              vouchers: true
            }
          }
        }
      }),
      prisma.brand.count({ where: whereClause })
    ]);

    // Calculate statistics
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const stats = await prisma.brand.aggregate({
      _count: { id: true },
      where: { isActive: true }
    });

    const featuredCount = await prisma.brand.count({
      where: { isFeature: true }
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


export async function deleteBrandPartner(brandId) {
  try {
    if (!brandId) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return {
        success: false,
        message: "Brand partner not found",
        status: 404,
      };
    }

    // Delete brand (cascade will handle related records)
    await prisma.brand.delete({
      where: { id: brandId },
    });

    // Delete logo file if it exists
    if (existingBrand.logo) {
      const logoPath = join(process.cwd(), "public", existingBrand.logo);
      try {
        await unlink(logoPath);
      } catch (error) {
        console.log("Could not delete logo file:", error.message);
      }
    }

    return {
      success: true,
      message: "Brand partner deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting brand partner:", error);

    if (error.code === "P2025") {
      return {
        success: false,
        message: "Brand partner not found",
        status: 404,
      };
    }

    return {
      success: false,
      message: "Internal server error",
      error: error.message,
      status: 500,
    };
  }
}

export async function updateBrand(formData) {
  try {
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
    const categoryName = formData.get('categoryName') || "";
    const notes = formData.get('notes') || "";
    const isActive = formData.get('isActive') === 'true';
    const isFeature = formData.get('isFeature') === 'true';

    // Get existing brand
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

    // Handle logo upload
    if (logoFile && logoFile.size > 0) {
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'brands');
        await mkdir(uploadDir, { recursive: true });

        // Delete old logo
        if (existingBrand.logo) {
          const oldLogoPath = join(process.cwd(), 'public', existingBrand.logo);
          try {
            await unlink(oldLogoPath);
          } catch (error) {
            console.log('Could not delete old logo:', error.message);
          }
        }

        const timestamp = Date.now();
        const extension = logoFile.name.split('.').pop();
        const filename = `${generateSlug(brandName || 'brand')}_${timestamp}.${extension}`;

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
      categoryName,
      notes,
      isActive,
      isFeature,
      logo: logoPath,
    };

    // Update brandName and slug if provided
    if (brandName && brandName !== existingBrand.brandName) {
      updateData.brandName = brandName;
      updateData.slug = generateSlug(brandName);
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
    
    if (error.code === 'P2002') {
      return {
        success: false,
        message: "Brand name or slug already exists",
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

// New helper function for audit logging
export async function createAuditLog(userId, action, entity, entityId, changes = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes,
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break main operations
  }
}