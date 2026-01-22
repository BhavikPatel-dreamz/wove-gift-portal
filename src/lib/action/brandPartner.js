"use server";

import { prisma } from "../db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { unlink } from "fs/promises";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { uploadFile, deleteFile } from "../utils/cloudinary";

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

// New Denomination Schema
const DenominationSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  value: z.number().min(1, "Denomination value must be at least 1"),
  currency: z.string().default("USD"),
  displayName: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isExpiry: z.boolean().default(false),
  expiresAt: z.string().optional().nullable(),
});

const BrandPartnerSchema = z
  .object({
    // Core Brand Info
    brandName: z.string().min(1, "Brand name is required"),
    slug: z.string().optional(), // Auto-generated from brandName
    description: z.string().min(1, "Description is required"),
    website: z.string().optional(),
    contact: z.string().optional(),
    tagline: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    categoryName: z.string().min(1, "Category is required"),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().default(false),
    isFeature: z.boolean().default(false),

    // Brand Terms
    settlementTrigger: z
      .enum(["onRedemption", "onPurchase"])
      .default("onRedemption"),
    commissionType: z.enum(["Fixed", "Percentage"]).default("Percentage"),
    commissionValue: z.number().min(0, "Commission value must be positive"),
    maxDiscount: z.number().min(0).optional().nullable(),
    minOrderValue: z.number().min(0).optional().nullable(),
    currency: z.string().default("USD"),
    breakagePolicy: z.string().optional(),
    breakageShare: z.number().min(0).max(100).optional().nullable(),
    contractStart: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid contract start date",
        })
        .optional(),
    ),
    contractEnd: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid contract end date",
        })
        .optional(),
    ),
    goLiveDate: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid go live date",
        })
        .optional(),
    ),
    renewContract: z.boolean().default(false),
    vatRate: z.number().min(0).max(100).optional().nullable(),
    internalNotes: z.string().optional().nullable(),

    // Voucher Configuration
    denominationType: z.enum(["fixed", "amount", "both"]).default("both"),
    denominations: z.array(DenominationSchema).optional().default([]),
    denominationValue: z.any().optional().nullable(),
    denominationCurrency: z.string().default("ZAR"),
    maxAmount: z.number().min(0).optional().nullable(),
    minAmount: z.number().min(0).optional().nullable(),
    isExpiry: z.boolean().default(false),
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
    settlementFrequency: z
      .enum(["daily", "weekly", "monthly", "quarterly"])
      .default("monthly"),
    dayOfMonth: z.number().min(1).max(31).optional().nullable(),
    payoutMethod: z
      .enum(["EFT", "wire_transfer", "paypal", "stripe", "manual"])
      .default("EFT"),
    invoiceRequired: z.boolean().default(false),
    remittanceEmail: z
      .string()
      .optional()
      .nullable(),
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
  })
  .refine(
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
    },
  );

// Helper to generate slug from brand name
function generateSlug(brandName) {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to prepare integration data with hashing
async function prepareIntegrationData(integration, brandId) {
  return {
    brandId,
    platform: integration.platform,
    storeUrl: integration.storeUrl || null,
    storeName: integration.storeName || null,
    apiKey: integration.apiKey
      ? await hashSensitiveData(integration.apiKey)
      : null,
    apiSecret: integration.apiSecret
      ? await hashSensitiveData(integration.apiSecret)
      : null,
    accessToken: integration.accessToken
      ? await hashSensitiveData(integration.accessToken)
      : null,
    consumerKey: integration.consumerKey
      ? await hashSensitiveData(integration.consumerKey)
      : null,
    consumerSecret: integration.consumerSecret
      ? await hashSensitiveData(integration.consumerSecret)
      : null,
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
      parsedData =
        typeof formData === "string" ? JSON.parse(formData) : formData;
    }

    // Validate data with Zod
    const validationResult = BrandPartnerSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
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


    // In createBrandPartner function, replace the logo upload section with:
    if (parsedData?.logoFile && parsedData?.logoFile?.size > 0) {
      try {
        const result = await uploadFile(parsedData.logoFile, "brand-logos");
        logoPath = result.secure_url;
      } catch (fileError) {
        console.error("Cloudinary upload error:", fileError);
        return {
          success: false,
          message: "Failed to upload logo to Cloudinary",
          status: 500,
        };
      }
    }

    // Pre-hash sensitive data for integrations
    const integrationDataPromises = (validatedData.integrations || []).map(
      (integration) => prepareIntegrationData(integration, null),
    );
    const integrationsData = await Promise.all(integrationDataPromises);

    // Prepare denomination value
    const denominationValue =
      validatedData.denominationValue != null &&
      validatedData.denominationValue !== ""
        ? parseInt(validatedData.denominationValue, 10)
        : null;

    const slug = generateSlug(validatedData.brandName);

    // Use transaction with increased timeout
    const result = await prisma.$transaction(
      async (tx) => {
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
                contractStart: validatedData.contractStart
                  ? new Date(validatedData.contractStart)
                  : null,
                contractEnd: validatedData.contractEnd
                  ? new Date(validatedData.contractEnd)
                  : null,
                goLiveDate: validatedData.goLiveDate
                  ? new Date(validatedData.goLiveDate)
                  : null,
                renewContract: validatedData.renewContract,
                vatRate: validatedData.vatRate,
                internalNotes: validatedData.internalNotes || "",
              },
            },

            // Nested create for Vouchers with Denominations
            vouchers: {
              create: {
                denominationType: validatedData.denominationType,
                denominationCurrency: validatedData.denominationCurrency,
                denominationValue: denominationValue,
                maxAmount: validatedData.maxAmount,
                minAmount: validatedData.minAmount,
                isExpiry: validatedData.isExpiry,
                expiryValue: validatedData.expiryValue,
                expiresAt: validatedData.expiresAt
                  ? new Date(validatedData.expiresAt)
                  : null,
                graceDays: validatedData.graceDays,
                redemptionChannels: validatedData.redemptionChannels,
                partialRedemption: validatedData.partialRedemption,
                stackable: validatedData.stackable,
                maxUserPerDay: validatedData.maxUserPerDay,
                termsConditionsURL: validatedData.termsConditionsURL,
                productSku: validatedData.productSku,
                isActive: true,
                // Create denominations if provided
                denominations:
                  validatedData.denominations &&
                  validatedData.denominations.length > 0
                    ? {
                        create: validatedData.denominations.map((denom) => ({
                          value: denom.value,
                          currency:
                            denom.currency ||
                            validatedData.denominationCurrency,
                          displayName: denom.displayName,
                          isExpiry: denom.isExpiry,
                          isActive: denom.isActive ?? true,
                          expiresAt: denom.expiresAt || 0,
                        })),
                      }
                    : undefined,
              },
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
                accountNumber: validatedData.accountNumber, // Hash account number
                branchCode: validatedData.branchCode,
                bankName: validatedData.bankName,
                swiftCode: validatedData.swiftCode,
                country: validatedData.country,
                accountVerification: validatedData.accountVerification,
              },
            },

            // Nested create for BrandContacts
            brandContacts: {
              create: validatedData.contacts.map((contact) => ({
                name: contact.name,
                role: contact.role,
                email: contact.email,
                phone: contact.phone,
                notes: contact.notes,
                isPrimary: contact.isPrimary,
              })),
            },
          },
        });

        // Create integrations separately if any
        if (integrationsData.length > 0) {
          await tx.integration.createMany({
            data: integrationsData.map((integration) => ({
              ...integration,
              brandId: brand.id,
            })),
          });
        }

        return brand;
      },
      {
        timeout: TRANSACTION_TIMEOUT,
      },
    );

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
      parsedData =
        typeof formData === "string" ? JSON.parse(formData) : formData;
    }

    // Validate data with Zod
    const validationResult = BrandPartnerSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
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
        vouchers: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
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

    // In createBrandPartner function, replace the logo upload section with:
    if (parsedData?.logoFile && parsedData?.logoFile?.size > 0) {
      try {
        const result = await uploadFile(parsedData.logoFile, "brand-logos");
        logoPath = result.secure_url;
      } catch (fileError) {
        console.error("Cloudinary upload error:", fileError);
        return {
          success: false,
          message: "Failed to upload logo to Cloudinary",
          status: 500,
        };
      }
    }

    // Pre-hash integration data
    const integrationDataPromises = (validatedData.integrations || []).map(
      (integration) => prepareIntegrationData(integration, brandId),
    );
    const integrationsData = await Promise.all(integrationDataPromises);

    const denominationValue =
      validatedData.denominationValue != null &&
      validatedData.denominationValue !== ""
        ? parseInt(validatedData.denominationValue, 10)
        : null;

    const slug = generateSlug(validatedData.brandName);

    // Use transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Update brand
        const updatedBrand = await tx.brand.update({
          where: { id: brandId },
          data: {
            brandName: validatedData.brandName,
            slug,
            logo: logoPath,
            description: validatedData.description,
            currency: validatedData.currency,
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
          contractStart: validatedData.contractStart
            ? new Date(validatedData.contractStart)
            : null,
          contractEnd: validatedData.contractEnd
            ? new Date(validatedData.contractEnd)
            : null,
          goLiveDate: validatedData.goLiveDate
            ? new Date(validatedData.goLiveDate)
            : null,
          renewContract: validatedData.renewContract,
          vatRate: validatedData.vatRate,
          internalNotes: validatedData.internalNotes || "",
        };

        operations.push(
          tx.brandTerms.upsert({
            where: { brandId },
            update: brandTermsData,
            create: { ...brandTermsData, brandId },
          }),
        );

        // Vouchers
        const voucherData = {
          denominationType: validatedData.denominationType,
          denominationCurrency: validatedData.denominationCurrency,
          denominationValue: denominationValue,
          maxAmount: validatedData.maxAmount,
          minAmount: validatedData.minAmount,
          isExpiry: validatedData.isExpiry,
          expiryValue: validatedData.expiryValue,
          expiresAt: validatedData.expiresAt
            ? new Date(validatedData.expiresAt)
            : null,
          graceDays: validatedData.graceDays,
          redemptionChannels: validatedData.redemptionChannels,
          partialRedemption: validatedData.partialRedemption,
          stackable: validatedData.stackable,
          maxUserPerDay: validatedData.maxUserPerDay,
          termsConditionsURL: validatedData.termsConditionsURL,
          productSku: validatedData.productSku,
        };
        console.log("voucherData", voucherData);

        if (existingBrand.vouchers[0]) {
          const voucherId = existingBrand.vouchers[0].id;

          operations.push(
            tx.vouchers.update({
              where: { id: voucherId },
              data: voucherData,
            }),
          );

          // Handle denominations - delete existing and create new ones
          operations.push(
            tx.denomination.deleteMany({
              where: { voucherId },
            }),
          );

          if (
            validatedData.denominations &&
            validatedData.denominations.length > 0
          ) {
            operations.push(
              tx.denomination.createMany({
                data: validatedData.denominations.map((denom) => ({
                  voucherId,
                  value: denom.value,
                  currency:
                    denom.currency || validatedData.denominationCurrency,
                  displayName: denom.displayName,
                  isExpiry: denom.isExpiry,
                  isActive: denom.isActive ?? true,
                  expiresAt: denom.expiresAt
                    ? new Date(denom.expiresAt)
                    : new Date(),
                })),
              }),
            );
          }
        } else {
          // Create new voucher with denominations
          const createVoucherPromise = tx.vouchers.create({
            data: {
              ...voucherData,
              brand: {
                connect: { id: brandId },
              },
              denominations:
                validatedData.denominations &&
                validatedData.denominations.length > 0
                  ? {
                      create: validatedData.denominations.map((denom) => ({
                        value: denom.value,
                        currency:
                          denom.currency || validatedData.denominationCurrency,
                        displayName: denom.displayName,
                        isExpiry: denom.isExpiry,
                        isActive: denom.isActive ?? true,
                        expiresAt: denom.expiresAt
                          ? new Date(denom.expiresAt)
                          : new Date(),
                      })),
                    }
                  : undefined,
            },
          });
          operations.push(createVoucherPromise);
        }

        // Banking (one-to-one)
        const bankingData = {
          settlementFrequency: validatedData.settlementFrequency,
          dayOfMonth: validatedData.dayOfMonth,
          payoutMethod: validatedData.payoutMethod,
          invoiceRequired: validatedData.invoiceRequired,
          remittanceEmail: validatedData.remittanceEmail,
          accountHolder: validatedData.accountHolder,
          accountNumber: validatedData.accountNumber,
          branchCode: validatedData.branchCode,
          bankName: validatedData.bankName,
          swiftCode: validatedData.swiftCode,
          country: validatedData.country,
          accountVerification: validatedData.accountVerification,
        };

        operations.push(
          tx.brandBanking.upsert({
            where: { brandId },
            update: bankingData,
            create: { ...bankingData, brandId },
          }),
        );

        // Execute all update operations
        await Promise.all(operations);

        // Handle contacts and integrations with delete + recreate
        await Promise.all([
          tx.brandContacts.deleteMany({ where: { brandId } }),
          tx.integration.deleteMany({ where: { brandId } }),
        ]);

        await Promise.all([
          tx.brandContacts.createMany({
            data: validatedData.contacts.map((contact) => ({
              brandId,
              name: contact.name,
              role: contact.role,
              email: contact.email,
              phone: contact.phone,
              notes: contact.notes,
              isPrimary: contact.isPrimary,
            })),
          }),
          integrationsData.length > 0
            ? tx.integration.createMany({ data: integrationsData })
            : Promise.resolve(),
        ]);

        return updatedBrand;
      },
      {
        timeout: TRANSACTION_TIMEOUT,
      },
    );

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
        vouchers: {
          include: {
            denominations: {
              where: { isActive: true },
            },
          },
        },
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
      search = "",
      category = "",
      isActive = null,
      isFeature = null,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { brandName: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { categoryName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All Brands") {
      whereClause.categoryName = category;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    if (isFeature !== null) {
      whereClause.isFeature = isFeature === "true";
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
              vouchers: true,
            },
          },
        },
      }),
      prisma.brand.count({ where: whereClause }),
    ]);

    // Calculate statistics
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
const stats = await prisma.brand.aggregate({
      _count: { id: true },
      where: { isActive: true },
    });

    const featuredCount = await prisma.brand.count({
      where: { isFeature: true },
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
        endIndex: Math.min(skip + limitNum, totalCount),
      },
      statistics: {
        total: totalBrands,
        active: stats._count.id,
        featured: featuredCount,
        activeRate:
          totalBrands > 0
            ? Math.round((stats._count.id / totalBrands) * 100)
            : 0,
      },
      filters: {
        search,
        category,
        isActive,
        isFeature,
        sortBy,
        sortOrder,
      },
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return {
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
      status: 500,
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

    // Retrieve brand details including logo
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        logo: true,
      },
    });

    if (!existingBrand) {
      return {
        success: false,
        message: "Brand partner not found",
        status: 404,
      };
    }

    // Use a transaction with increased timeout
    await prisma.$transaction(
      async (tx) => {
        // Step 1: Get all related IDs in parallel
        const [vouchers, orders, integrations] = await Promise.all([
          tx.vouchers.findMany({
            where: { brandId },
            select: { id: true },
          }),
          tx.order.findMany({
            where: { brandId },
            select: { id: true },
          }),
          tx.integration.findMany({
            where: { brandId },
            select: { id: true },
          }),
        ]);

        const voucherIds = vouchers.map((v) => v.id);
        const orderIds = orders.map((o) => o.id);
        const integrationIds = integrations.map((i) => i.id);

        // Step 2: Get voucher code IDs if there are vouchers
        let voucherCodeIds = [];
        if (voucherIds.length > 0) {
          const voucherCodes = await tx.voucherCode.findMany({
            where: { voucherId: { in: voucherIds } },
            select: { id: true },
          });
          voucherCodeIds = voucherCodes.map((vc) => vc.id);
        }

        // Step 3: Delete in correct order (deepest children first)
        const deletePromises = [];

        // Delete voucher redemptions
        if (voucherCodeIds.length > 0) {
          deletePromises.push(
            tx.voucherRedemption.deleteMany({
              where: { voucherCodeId: { in: voucherCodeIds } },
            }),
          );
        }

        // Delete delivery logs
        if (orderIds.length > 0 || voucherCodeIds.length > 0) {
          const deliveryLogWhere = {
            OR: [],
          };
          if (orderIds.length > 0) {
            deliveryLogWhere.OR.push({ orderId: { in: orderIds } });
          }
          if (voucherCodeIds.length > 0) {
            deliveryLogWhere.OR.push({ voucherCodeId: { in: voucherCodeIds } });
          }

          deletePromises.push(
            tx.deliveryLog.deleteMany({ where: deliveryLogWhere }),
          );
        }

        // Delete integration sync logs
        if (integrationIds.length > 0) {
          deletePromises.push(
            tx.integrationSyncLog.deleteMany({
              where: { integrationId: { in: integrationIds } },
            }),
          );
        }

        // Execute all parallel deletions
        await Promise.all(deletePromises);

        // Step 4: Delete voucher codes
        if (voucherCodeIds.length > 0) {
          await tx.voucherCode.deleteMany({
            where: { id: { in: voucherCodeIds } },
          });
        }

        // Step 5: Delete orders (must be before brand deletion)
        if (orderIds.length > 0) {
          await tx.order.deleteMany({
            where: { id: { in: orderIds } },
          });
        }

        // Step 6: Delete denominations and vouchers
        if (voucherIds.length > 0) {
          await Promise.all([
            tx.denomination.deleteMany({
              where: { voucherId: { in: voucherIds } },
            }),
            tx.vouchers.deleteMany({
              where: { id: { in: voucherIds } },
            }),
          ]);
        }

        // Step 7: Delete integrations
        if (integrationIds.length > 0) {
          await tx.integration.deleteMany({
            where: { id: { in: integrationIds } },
          });
        }

        // Step 8: Delete all other brand-related data in parallel
        await Promise.all([
          tx.settlements.deleteMany({ where: { brandId } }),
          tx.brandContacts.deleteMany({ where: { brandId } }),
          tx.brandTerms.deleteMany({ where: { brandId } }),
          tx.brandBanking.deleteMany({ where: { brandId } }),
        ]);

        // Step 9: Finally delete the brand
        await tx.brand.delete({
          where: { id: brandId },
        });
      },
      {
        maxWait: 15000, // 15 seconds max wait to connect
        timeout: 30000, // 30 seconds timeout for the transaction
      },
    );

    // In deleteBrandPartner function, add this before deleting the brand:
    if (existingBrand.logo) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = existingBrand.logo.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];
        const fullPublicId = `brand-logos/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
      } catch (error) {
        console.error("Failed to delete Cloudinary image:", error);
      }
    }

    return {
      success: true,
      message: "Brand partner and all related data deleted successfully.",
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting brand partner:", error);

    if (error.code === "P2025") {
      return {
        success: false,
        message: "Brand partner not found.",
        status: 404,
      };
    }

    if (error.code === "P2003") {
      return {
        success: false,
        message:
          "Cannot delete brand due to foreign key constraints. Some related data may still exist.",
        status: 400,
      };
    }

    return {
      success: false,
      message:
        "An internal server error occurred while deleting the brand partner.",
      error: error.message,
      status: 500,
    };
  }
}

export async function updateBrand(formData) {
  try {
    const id = formData.get("id");

    if (!id) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    // Get form fields
    const brandName = formData.get("brandName");
    const logoFile = formData.get("logo");
    const description = formData.get("description") || "";
    const website = formData.get("website") || "";
    const contact = formData.get("contact") || "";
    const tagline = formData.get("tagline") || "";
    const color = formData.get("color") || "";
    const categoryName = formData.get("categoryName") || "";
    const notes = formData.get("notes") || "";
    const isActive = formData.get("isActive") === "true";
    const isFeature = formData.get("isFeature") === "true";
    let parsedData;

    // Get existing brand
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    }

    let logoPath = existingBrand.logo;

    // In createBrandPartner function, replace the logo upload section with:
    if (parsedData?.logoFile && parsedData?.logoFile?.size > 0) {
      try {
        const result = await uploadFile(parsedData.logoFile, 'brand-logos');
        logoPath = result.secure_url;
      } catch (fileError) {
        console.error('Cloudinary upload error:', fileError);
        return {
          success: false,
          message: 'Failed to upload logo to Cloudinary',
          status: 500
        };
      }
    }

    // Also update the updateBrandPartner function similarly for logo updates
    // Don't forget to delete the old Cloudinary image when updating

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
      data: updateData,
    });

    return {
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        message: "Brand name or slug already exists",
        status: 400,
      };
    }

    if (error.code === "P2025") {
      return {
        success: false,
        message: "Brand not found",
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

// New helper function for audit logging
export async function createAuditLog(
  userId,
  action,
  entity,
  entityId,
  changes = null,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes,
      },
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error - audit logging should not break main operations
  }
}

function calculateSettlementStatus(netPayable, totalPaid, remainingAmount) {
  // If nothing to pay or negative net payable
  if (netPayable <= 0) {
    return "Pending";
  }

  // If fully paid (remaining is 0 or negative due to overpayment)
  if (remainingAmount <= 0 && totalPaid >= netPayable) {
    return "Paid";
  }

  // If partially paid (some payment made but not complete)
  if (totalPaid > 0 && remainingAmount > 0) {
    return "Partial";
  }

  // If no payment made yet
  return "Pending";
}

// ==================== OPTIMIZED SETTLEMENT SERVICE ====================
export async function getSettlements(params = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      brandId = null,
      sortBy = "createdAt",
      sortOrder = "desc",
      groupByBrand = false,
      frequency = "",
      shopId = null,
      groupByFrequency = false,
      filterMonth = null,
      filterYear = null,
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};
    const brandWhereClause = {};

    // ==================== OPTIMIZE: Cache brand lookup ====================
    if (shopId) {
      const brand = await prisma.brand.findUnique({
        where: { domain: shopId },
        select: { id: true },
      });

      if (brand) {
        whereClause.brandId = brand.id;
      } else {
        return createEmptyResponse(pageNum, limitNum);
      }
    }

    if (search) {
      whereClause.OR = [
        { brand: { brandName: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brandId) {
      whereClause.brandId = brandId;
    }

    if (frequency) {
      brandWhereClause.brandBankings = {
        settlementFrequency: frequency,
      };
    }

    // ==================== DATE RANGE FILTER ====================
    let startDate, endDate;

    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (filterYear) {
      const year = parseInt(filterYear, 10);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    whereClause.periodStart = {
      gte: startDate,
      lte: endDate,
    };

    if (Object.keys(brandWhereClause).length > 0) {
      whereClause.brand = brandWhereClause;
    }

    const orderBy = { [sortBy]: sortOrder };

    // ==================== OPTIMIZE: Apply pagination at DB level ====================
    // Only fetch what we need instead of all settlements
    const shouldPaginateAtDB = !groupByBrand && !groupByFrequency && !status;

    const queryOptions = {
      where: whereClause,
      orderBy,
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
            currency: true,
            domain: true,
            website: true,
            contact: true,
            isActive: true,
            brandTerms: {
              select: {
                id: true,
                settlementTrigger: true,
                commissionType: true,
                commissionValue: true,
                maxDiscount: true,
                minOrderValue: true,
                currency: true,
                breakagePolicy: true,
                breakageShare: true,
                contractStart: true,
                contractEnd: true,
                goLiveDate: true,
                renewContract: true,
                vatRate: true,
                internalNotes: true,
              },
            },
            brandBankings: {
              select: {
                id: true,
                settlementFrequency: true,
                dayOfMonth: true,
                payoutMethod: true,
                invoiceRequired: true,
                remittanceEmail: true,
                accountHolder: true,
                bankName: true,
                country: true,
              },
            },
          },
        },
      },
    };

    // Add pagination to query if we can
    if (shouldPaginateAtDB) {
      queryOptions.skip = skip;
      queryOptions.take = limitNum;
    }

    // ==================== OPTIMIZE: Parallel queries ====================
    const [allSettlements, totalCount] = await Promise.all([
      prisma.settlements.findMany(queryOptions),
      prisma.settlements.count({ where: whereClause }),
    ]);

    // ==================== OPTIMIZE: Extract calculation logic ====================
    const processSettlement = (settlement) => {
      const brandTerms = settlement.brand?.brandTerms;
      const brandBankings = settlement.brand?.brandBankings;
      const currency = settlement.brand?.currency || "USD";

      const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";
      const baseAmount =
        settlementTrigger === "onRedemption"
          ? settlement.redeemedAmount
          : settlement.totalSoldAmount;

      // Commission calculation
      let calculatedCommission = 0;
      if (brandTerms && baseAmount > 0) {
        if (brandTerms.commissionType === "Percentage") {
          calculatedCommission = Math.round(
            (baseAmount * brandTerms.commissionValue) / 100
          );
        } else if (brandTerms.commissionType === "Fixed") {
          const itemCount =
            settlementTrigger === "onRedemption"
              ? settlement.totalRedeemed
              : settlement.totalSold;
          calculatedCommission = Math.round(
            brandTerms.commissionValue * itemCount
          );
        }
      }

      const commissionAmount =
        settlement.commissionAmount === 0 && baseAmount > 0
          ? calculatedCommission
          : (settlement.commissionAmount ?? calculatedCommission);

      // VAT calculation
      const vatRate = brandTerms?.vatRate || 0;
      const calculatedVatAmount = Math.round(
        (commissionAmount * vatRate) / 100
      );

      const vatAmount =
        settlement.vatAmount === 0 && commissionAmount > 0
          ? calculatedVatAmount
          : (settlement.vatAmount ?? calculatedVatAmount);

      // Breakage calculation
      let calculatedBreakageAmount = 0;
      if (brandTerms?.breakageShare && settlement.outstandingAmount > 0) {
        calculatedBreakageAmount = Math.round(
          (settlement.outstandingAmount * brandTerms.breakageShare) / 100
        );
      }

      const breakageAmount =
        settlement.breakageAmount === 0 && settlement.outstandingAmount > 0 && brandTerms?.breakageShare
          ? calculatedBreakageAmount
          : (settlement.breakageAmount ?? calculatedBreakageAmount);

      // Net payable calculation
      let calculatedNetPayable = 0;
      if (baseAmount > 0) {
        calculatedNetPayable =
          baseAmount - commissionAmount + vatAmount - breakageAmount;
      }

      const netPayable =
        settlement.netPayable === 0 && baseAmount > 0
          ? calculatedNetPayable
          : (settlement.netPayable ?? calculatedNetPayable);

      // Remaining amount calculation
      const totalPaid = settlement.totalPaid || 0;
      let calculatedRemainingAmount = netPayable - totalPaid;

      if (calculatedRemainingAmount <= 0 && totalPaid >= netPayable) {
        calculatedRemainingAmount = 0;
      }

      const remainingAmount = calculatedRemainingAmount;

      // Dynamic status calculation
      const dynamicStatus = calculateSettlementStatus(
        netPayable,
        totalPaid,
        remainingAmount
      );

      return {
        id: settlement.id,
        settlementPeriod: settlement.settlementPeriod,
        periodStart: settlement.periodStart,
        periodEnd: settlement.periodEnd,
        settlementTrigger,
        baseAmount,
        totalSold: settlement.totalSold,
        totalSoldAmount: settlement.totalSoldAmount,
        totalRedeemed: settlement.totalRedeemed,
        redeemedAmount: settlement.redeemedAmount,
        outstanding: settlement.outstanding,
        outstandingAmount: settlement.outstandingAmount,
        commissionAmount,
        commissionPercentage:
          brandTerms?.commissionType === "Percentage"
            ? brandTerms.commissionValue
            : null,
        commissionFixed:
          brandTerms?.commissionType === "Fixed"
            ? brandTerms.commissionValue
            : null,
        breakageAmount,
        vatAmount,
        vatRate,
        netPayable,
        totalPaid,
        remainingAmount,
        status: dynamicStatus,
        dbStatus: settlement.status,
        paidAt: settlement.paidAt,
        lastPaymentDate: settlement.lastPaymentDate,
        paymentCount: settlement.paymentCount || 0,
        paymentHistory: settlement.paymentHistory,
        paymentReference: settlement.paymentReference,
        brand: {
          id: settlement.brand.id,
          brandName: settlement.brand.brandName,
          logo: settlement.brand.logo,
          currency: settlement.brand.currency,
          domain: settlement.brand.domain,
          website: settlement.brand.website,
          contact: settlement.brand.contact,
          isActive: settlement.brand.isActive,
        },
        brandTerms: brandTerms
          ? {
              id: brandTerms.id,
              settlementTrigger: brandTerms.settlementTrigger,
              commissionType: brandTerms.commissionType,
              commissionValue: brandTerms.commissionValue,
              maxDiscount: brandTerms.maxDiscount,
              minOrderValue: brandTerms.minOrderValue,
              currency: brandTerms.currency,
              breakagePolicy: brandTerms.breakagePolicy,
              breakageShare: brandTerms.breakageShare,
              contractStart: brandTerms.contractStart,
              contractEnd: brandTerms.contractEnd,
              goLiveDate: brandTerms.goLiveDate,
              renewContract: brandTerms.renewContract,
              vatRate: brandTerms.vatRate,
              internalNotes: brandTerms.internalNotes,
            }
          : null,
        brandBankings: brandBankings
          ? {
              id: brandBankings.id,
              settlementFrequency: brandBankings.settlementFrequency,
              dayOfMonth: brandBankings.dayOfMonth,
              payoutMethod: brandBankings.payoutMethod,
              invoiceRequired: brandBankings.invoiceRequired,
              remittanceEmail: brandBankings.remittanceEmail,
              accountHolder: brandBankings.accountHolder,
              bankName: brandBankings.bankName,
              country: brandBankings.country,
            }
          : null,
        currency,
        notes: settlement.notes,
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt,
      };
    };

    // Process settlements
    let processedSettlements;

    if (groupByFrequency && groupByBrand) {
      processedSettlements = await groupSettlementsByBrandAndFrequency(allSettlements);
    } else if (groupByBrand) {
      processedSettlements = await groupSettlementsByBrand(allSettlements);
    } else {
      processedSettlements = allSettlements.map(processSettlement);
    }

    // Apply status filter after processing (only if needed)
    if (status) {
      processedSettlements = processedSettlements.filter(
        (settlement) => settlement.status === status
      );
    }

    // ==================== OPTIMIZE: Skip pagination if already done at DB ====================
    let paginatedSettlements;
    let totalPages;
    let finalTotalCount;

    if (shouldPaginateAtDB) {
      // Already paginated at DB level
      paginatedSettlements = processedSettlements;
      totalPages = Math.ceil(totalCount / limitNum);
      finalTotalCount = totalCount;
    } else {
      // Need to paginate in memory
      paginatedSettlements = processedSettlements.slice(skip, skip + limitNum);
      totalPages = Math.ceil(processedSettlements.length / limitNum);
      finalTotalCount = processedSettlements.length;
    }

    // ==================== OPTIMIZE: Calculate summary only on paginated data ====================
    // For large datasets, calculate summary only on current page or use aggregation
    const summaryData = shouldPaginateAtDB ? paginatedSettlements : processedSettlements;

    const summary = {
      totalSettlements: finalTotalCount,
      totalSoldAmount: summaryData.reduce((sum, s) => sum + s.totalSoldAmount, 0),
      totalRedeemedAmount: summaryData.reduce((sum, s) => sum + s.redeemedAmount, 0),
      totalOutstandingAmount: summaryData.reduce((sum, s) => sum + s.outstandingAmount, 0),
      totalCommissionAmount: summaryData.reduce((sum, s) => sum + (s.commissionAmount || 0), 0),
      totalVatAmount: summaryData.reduce((sum, s) => sum + (s.vatAmount || 0), 0),
      totalBreakageAmount: summaryData.reduce((sum, s) => sum + (s.breakageAmount || 0), 0),
      totalNetPayable: summaryData.reduce((sum, s) => sum + (s.netPayable || 0), 0),
      totalPaid: summaryData.reduce((sum, s) => sum + (s.totalPaid || 0), 0),
      totalRemainingAmount: summaryData.reduce((sum, s) => sum + (s.remainingAmount || 0), 0),
      statusBreakdown: {
        pending: summaryData.filter((s) => s.status === "Pending").length,
        paid: summaryData.filter((s) => s.status === "Paid").length,
        partial: summaryData.filter((s) => s.status === "Partial").length,
        inReview: summaryData.filter((s) => s.status === "InReview").length,
        disputed: summaryData.filter((s) => s.status === "Disputed").length,
      },
    };

    // Determine filter label
    let filterLabel;
    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      filterLabel = new Date(year, month - 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (filterYear) {
      filterLabel = filterYear;
    } else {
      filterLabel = startDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return {
      success: true,
      data: paginatedSettlements,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: finalTotalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      summary,
      filters: {
        appliedMonth: filterMonth,
        appliedYear: filterYear,
        appliedStatus: status,
        appliedFrequency: frequency,
        period: filterLabel,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return {
      success: false,
      message: "Failed to fetch settlements",
      error: error.message,
      status: 500,
    };
  }
}

export async function getSettlementTabData(brandId, tab) {
  try {
    const res = await getSettlements(brandId, tab);
    if (res.success) {
      return {
        success: true,
        data: res.data,
      };
    } else {
      return {
        success: false,
        message: res.message,
        error: res.error,
        status: res.status,
      };
    }
  } catch (error) {
    console.error("Error fetching settlement details:", error);
    return {
      success: false,
      message: "Failed to fetch settlement details",
      error: error.message,
      status: 500,
    };
  }
}

// ==================== EMPTY RESPONSE ====================
function createEmptyResponse(pageNum, limitNum) {
  return {
    success: true,
    data: [],
    pagination: {
      currentPage: pageNum,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: limitNum,
      hasNextPage: false,
      hasPrevPage: false,
    },
    summary: {
      totalSettlements: 0,
      totalPayable: 0,
      totalPaid: 0,
      totalRemaining: 0,
      pendingCount: 0,
      paidCount: 0,
      inReviewCount: 0,
      disputedCount: 0,
      partiallyPaidCount: 0,
    },
    filters: {
      appliedMonth: null,
      appliedYear: null,
      appliedStatus: null,
      appliedFrequency: null,
      period: null,
      dateRange: null,
    },
  };
}

// ==================== CALCULATE SETTLEMENT METRICS (FIXED) ====================
function calculateSettlementMetrics(
  orders,
  settlements,
  expiredByOrder,
  brandTerms,
) {
  const totalSoldAmount = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );
  const totalSold = orders.length;

  let totalRedeemed = 0;
  let redeemedAmount = 0;
  const uniqueRedeemedVouchers = new Set();
  let lastRedemptionDate = null;

  orders.forEach((order) => {
    order.voucherCodes?.forEach((voucherCode) => {
      if (voucherCode.redemptions?.length > 0) {
        uniqueRedeemedVouchers.add(voucherCode.id);
        voucherCode.redemptions.forEach((redemption) => {
          redeemedAmount += redemption.amountRedeemed || 0;
          const redemptionDate = new Date(redemption.redeemedAt);
          if (!lastRedemptionDate || redemptionDate > lastRedemptionDate) {
            lastRedemptionDate = redemptionDate;
          }
        });
      }
    });
  });

  totalRedeemed = uniqueRedeemedVouchers.size;
  const outstanding = totalSold - totalRedeemed;
  const outstandingAmount = totalSoldAmount - redeemedAmount;

  // ==================== FIXED COMMISSION & VAT CALCULATION ====================
  // Determine base amount based on settlement trigger
  const baseAmount =
    brandTerms?.settlementTrigger === "onRedemption"
      ? redeemedAmount
      : totalSoldAmount;

  // Calculate commission
  let commissionAmount = 0;
  if (brandTerms) {
    if (brandTerms.commissionType === "Percentage") {
      // Commission = Base Amount × (Commission % / 100)
      commissionAmount = Math.round(
        (baseAmount * (brandTerms.commissionValue || 0)) / 100,
      );
    } else if (brandTerms.commissionType === "Fixed") {
      // For fixed commission, multiply by number of transactions
      const transactionCount =
        brandTerms.settlementTrigger === "onRedemption"
          ? totalRedeemed
          : totalSold;
      commissionAmount = Math.round(
        (brandTerms.commissionValue || 0) * transactionCount,
      );
    }
  }

  // Calculate breakage
  const breakageAmount = orders.reduce((sum, order) => {
    return sum + (expiredByOrder[order.id] || 0);
  }, 0);

  const adjustedBreakage = brandTerms?.breakageShare
    ? Math.round((breakageAmount * (brandTerms.breakageShare || 0)) / 100)
    : 0;

  // Calculate VAT on commission (NOT on base amount)
  // VAT Amount = Commission × (VAT % / 100)
  const vatAmount = brandTerms?.vatRate
    ? Math.round((commissionAmount * (brandTerms.vatRate || 0)) / 100)
    : 0;

  // Net payable calculation
  // Net Payable = Base Amount - Commission - Breakage + VAT
  // (VAT is added because it's charged on top of the commission)
  const netPayable = Math.round(
    baseAmount - commissionAmount - adjustedBreakage + vatAmount,
  );

  // Payment details
  const payments = settlements
    .filter((s) => s.paidAt)
    .map((s) => ({
      id: s.id,
      amount: s.netPayable || 0,
      paidAt: s.paidAt,
      reference: s.paymentReference,
      notes: s.notes,
    }))
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  const totalPaid = Math.round(
    payments.reduce((sum, p) => sum + (p.amount || 0), 0),
  );

  // Status determination
  let status;
  const remainingAmount = Math.max(0, netPayable - totalPaid);

  if (remainingAmount === 0 && totalPaid > 0) {
    status = "Paid";
  } else if (totalPaid > 0 && remainingAmount > 0) {
    status = "PartiallyPaid";
  } else {
    const hasDisputed = settlements.some((s) => s.status === "Disputed");
    const hasInReview = settlements.some((s) => s.status === "InReview");

    if (hasDisputed) {
      status = "Disputed";
    } else if (hasInReview) {
      status = "InReview";
    } else {
      status = "Pending";
    }
  }

  const lastPaymentDate = payments.length > 0 ? payments[0].paidAt : null;

  return {
    totalSold,
    totalSoldAmount,
    totalRedeemed,
    redeemedAmount,
    outstanding,
    outstandingAmount,
    redemptionRate:
      totalSold > 0 ? ((totalRedeemed / totalSold) * 100).toFixed(2) : "0.00",
    lastRedemptionDate,
    baseAmount, // Add this for clarity
    commissionAmount,
    breakageAmount: adjustedBreakage,
    vatAmount,
    netPayable,
    totalPaid,
    remainingAmount,
    status,
    lastPaymentDate,
    paymentHistory: payments,
    paymentCount: payments.length,
    settlementTrigger: brandTerms?.settlementTrigger,
    commissionType: brandTerms?.commissionType,
    commissionValue: brandTerms?.commissionValue,
    vatRate: brandTerms?.vatRate,
  };
}

// ==================== HELPER FUNCTIONS ====================
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getPeriodLabel(periodStart, periodEnd, frequency) {
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  switch (frequency) {
    case "daily":
      return startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "weekly":
      const weekNumber = getWeekNumber(startDate);
      return `Week ${weekNumber}, ${startDate.getFullYear()}`;

    case "monthly":
      return startDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

    case "quarterly":
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      return `Q${quarter} ${startDate.getFullYear()}`;

    default:
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

function getFrequencyPeriodKey(periodStart, frequency) {
  const date = new Date(periodStart);

  switch (frequency) {
    case "daily":
      return date.toISOString().split("T")[0];

    case "weekly":
      const weekNumber = getWeekNumber(date);
      return `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;

    case "monthly":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

    case "quarterly":
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${date.getFullYear()}-Q${quarter}`;

    default:
      return date.toISOString().split("T")[0];
  }
}

// ==================== GROUPED FUNCTIONS (For when grouping is enabled) ====================
async function groupSettlementsByBrandAndFrequency(allSettlements) {
  if (!allSettlements.length) return [];

  const brandFrequencyGroups = {};
  const brandIds = new Set();

  // Single pass to group settlements and collect brand IDs
  allSettlements.forEach((settlement) => {
    brandIds.add(settlement.brandId);
    
    const frequency = settlement.brand.brandBankings?.settlementFrequency || "monthly";
    const periodKey = getFrequencyPeriodKey(settlement.periodStart, frequency);
    const groupKey = `${settlement.brandId}_${frequency}_${periodKey}`;

    if (!brandFrequencyGroups[groupKey]) {
      brandFrequencyGroups[groupKey] = {
        brandId: settlement.brandId,
        frequency,
        periodKey,
        settlements: [],
        periodStart: settlement.periodStart,
        periodEnd: settlement.periodEnd,
      };
    } else {
      // Track min/max dates during grouping
      if (settlement.periodStart < brandFrequencyGroups[groupKey].periodStart) {
        brandFrequencyGroups[groupKey].periodStart = settlement.periodStart;
      }
      if (settlement.periodEnd > brandFrequencyGroups[groupKey].periodEnd) {
        brandFrequencyGroups[groupKey].periodEnd = settlement.periodEnd;
      }
    }
    
    brandFrequencyGroups[groupKey].settlements.push(settlement);
  });

  // ==================== OPTIMIZE: Single combined query for orders ====================
  // Fetch orders with all related data in one query
  const allOrders = await prisma.order.findMany({
    where: { 
      brandId: { in: Array.from(brandIds) }
    },
    select: {
      id: true,
      brandId: true,
      createdAt: true,
      totalAmount: true,
      voucherCodes: {
        select: {
          id: true,
          isRedeemed: true,
          expiresAt: true,
          originalValue: true,
          redemptions: {
            select: {
              amountRedeemed: true,
              redeemedAt: true,
            },
          },
        },
      },
    },
  });

  // ==================== OPTIMIZE: Build lookup maps in single pass ====================
  const ordersByBrand = {};
  const expiredByOrder = {};
  const now = new Date();

  allOrders.forEach((order) => {
    // Group by brand
    if (!ordersByBrand[order.brandId]) {
      ordersByBrand[order.brandId] = [];
    }
    ordersByBrand[order.brandId].push(order);

    // Calculate expired vouchers inline
    let expiredSum = 0;
    order.voucherCodes?.forEach((voucher) => {
      if (!voucher.isRedeemed && voucher.expiresAt && voucher.expiresAt <= now) {
        expiredSum += voucher.originalValue || 0;
      }
    });
    
    if (expiredSum > 0) {
      expiredByOrder[order.id] = expiredSum;
    }
  });

  // ==================== OPTIMIZE: Process groups with pre-calculated dates ====================
  const processedSettlements = Object.values(brandFrequencyGroups).map((group) => {
    const { brandId, frequency, periodKey, settlements: groupSettlements, periodStart, periodEnd } = group;
    const firstSettlement = groupSettlements[0];
    const allIds = groupSettlements.map((s) => s.id);

    // Filter orders for this period (already grouped by brand)
    const brandOrders = (ordersByBrand[brandId] || []).filter((order) => {
      const orderDate = order.createdAt;
      return orderDate >= periodStart && orderDate <= periodEnd;
    });

    const metrics = calculateSettlementMetrics(
      brandOrders,
      groupSettlements,
      expiredByOrder,
      firstSettlement.brand.brandTerms,
    );

    return {
      id: allIds.join(","),
      settlementIds: allIds,
      brandId,
      brandName: firstSettlement.brand.brandName,
      brandLogo: firstSettlement.brand.logo,
      frequency,
      frequencyPeriodKey: periodKey,
      frequencyPeriodLabel: getPeriodLabel(periodStart, periodEnd, frequency),
      settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      periodStart,
      periodEnd,
      recordCount: groupSettlements.length,
      ...metrics,
      settlementFrequency: firstSettlement.brand.brandBankings?.settlementFrequency,
      bankingInfo: firstSettlement.brand.brandBankings
        ? {
            accountHolder: firstSettlement.brand.brandBankings.accountHolder,
            accountNumber: firstSettlement.brand.brandBankings.accountNumber,
            bankName: firstSettlement.brand.brandBankings.bankName,
            branchCode: firstSettlement.brand.brandBankings.branchCode,
            payoutMethod: firstSettlement.brand.brandBankings.payoutMethod,
          }
        : null,
      currency: firstSettlement.brand.currency || null,
      createdAt: firstSettlement.createdAt,
      updatedAt: groupSettlements.reduce((latest, s) => 
        s.updatedAt > latest ? s.updatedAt : latest, 
        groupSettlements[0].updatedAt
      ),
    };
  });

  return processedSettlements.sort((a, b) => b.periodStart - a.periodStart);
}

async function groupSettlementsByBrand(allSettlements) {
  if (!allSettlements.length) return [];

  // ==================== OPTIMIZE: Single pass grouping with date tracking ====================
  const brandGroups = {};
  const brandIds = new Set();

  allSettlements.forEach((settlement) => {
    brandIds.add(settlement.brandId);
    
    if (!brandGroups[settlement.brandId]) {
      brandGroups[settlement.brandId] = {
        settlements: [],
        periodStart: settlement.periodStart,
        periodEnd: settlement.periodEnd,
      };
    } else {
      // Track min/max dates during grouping
      if (settlement.periodStart < brandGroups[settlement.brandId].periodStart) {
        brandGroups[settlement.brandId].periodStart = settlement.periodStart;
      }
      if (settlement.periodEnd > brandGroups[settlement.brandId].periodEnd) {
        brandGroups[settlement.brandId].periodEnd = settlement.periodEnd;
      }
    }
    
    brandGroups[settlement.brandId].settlements.push(settlement);
  });

  // ==================== OPTIMIZE: Single combined query for orders ====================
  const allOrders = await prisma.order.findMany({
    where: { 
      brandId: { in: Array.from(brandIds) }
    },
    select: {
      id: true,
      brandId: true,
      createdAt: true,
      totalAmount: true,
      voucherCodes: {
        select: {
          id: true,
          isRedeemed: true,
          expiresAt: true,
          originalValue: true,
          redemptions: {
            select: {
              amountRedeemed: true,
              redeemedAt: true,
            },
          },
        },
      },
    },
  });

  // ==================== OPTIMIZE: Build lookup maps in single pass ====================
  const ordersByBrand = {};
  const expiredByOrder = {};
  const now = new Date();

  allOrders.forEach((order) => {
    // Group by brand
    if (!ordersByBrand[order.brandId]) {
      ordersByBrand[order.brandId] = [];
    }
    ordersByBrand[order.brandId].push(order);

    // Calculate expired vouchers inline
    let expiredSum = 0;
    order.voucherCodes?.forEach((voucher) => {
      if (!voucher.isRedeemed && voucher.expiresAt && voucher.expiresAt <= now) {
        expiredSum += voucher.originalValue || 0;
      }
    });
    
    if (expiredSum > 0) {
      expiredByOrder[order.id] = expiredSum;
    }
  });

  // ==================== OPTIMIZE: Process with pre-calculated dates ====================
  return Object.entries(brandGroups).map(([brandId, group]) => {
    const { settlements: brandSettlements, periodStart, periodEnd } = group;
    const firstSettlement = brandSettlements[0];
    const allIds = brandSettlements.map((s) => s.id);

    // Filter orders for this period (already grouped by brand)
    const brandOrders = (ordersByBrand[brandId] || []).filter((order) => {
      const orderDate = order.createdAt;
      return orderDate >= periodStart && orderDate <= periodEnd;
    });

    const metrics = calculateSettlementMetrics(
      brandOrders,
      brandSettlements,
      expiredByOrder,
      firstSettlement.brand.brandTerms,
    );

    return {
      id: allIds.join(","),
      settlementIds: allIds,
      brandId: firstSettlement.brandId,
      brandName: firstSettlement.brand.brandName,
      brandLogo: firstSettlement.brand.logo,
      settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      periodStart,
      periodEnd,
      recordCount: brandSettlements.length,
      ...metrics,
      settlementFrequency: firstSettlement.brand.brandBankings?.settlementFrequency,
      bankingInfo: firstSettlement.brand.brandBankings
        ? {
            accountHolder: firstSettlement.brand.brandBankings.accountHolder,
            accountNumber: firstSettlement.brand.brandBankings.accountNumber,
            bankName: firstSettlement.brand.brandBankings.bankName,
            branchCode: firstSettlement.brand.brandBankings.branchCode,
            payoutMethod: firstSettlement.brand.brandBankings.payoutMethod,
          }
        : null,
      currency: firstSettlement.brand.currency || null,
      createdAt: firstSettlement.createdAt,
      updatedAt: brandSettlements.reduce((latest, s) => 
        s.updatedAt > latest ? s.updatedAt : latest, 
        brandSettlements[0].updatedAt
      ),
    };
  });
}


export async function getSettlementOverview(brandId) {
  try {
    // ==================== OPTIMIZE: Single query to get settlement with period ====================
    const settlementData = await prisma.settlements.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        settlementPeriod: true,
        periodStart: true,
        periodEnd: true,
        totalSold: true,
        totalSoldAmount: true,
        totalRedeemed: true,
        redeemedAmount: true,
        outstanding: true,
        outstandingAmount: true,
        commissionAmount: true,
        breakageAmount: true,
        vatAmount: true,
        netPayable: true,
        totalPaid: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
            currency: true,
            domain: true,
            website: true,
            contact: true,
            isActive: true,
          },
        },
      },
    });

    if (!settlementData) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    // ==================== OPTIMIZE: Parallel queries for all data ====================
    const [orders, deliveryGroups, voucherStats] = await Promise.all([
      // Query 1: Orders with voucher codes and redemptions
      prisma.order.findMany({
        where: {
          brandId,
          createdAt: {
            gte: settlementData.periodStart,
            lte: settlementData.periodEnd,
          },
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          voucherCodes: {
            select: {
              id: true,
              isRedeemed: true,
              redemptions: {
                select: {
                  amountRedeemed: true,
                  redeemedAt: true,
                },
              },
            },
          },
        },
      }),

      // Query 2: Delivery summary
      prisma.deliveryLog.groupBy({
        by: ["status"],
        where: { 
          order: { 
            brandId,
            createdAt: {
              gte: settlementData.periodStart,
              lte: settlementData.periodEnd,
            },
          } 
        },
        _count: true,
      }),

      // Query 3: Voucher statistics using aggregation
      prisma.voucherCode.groupBy({
        by: ["isRedeemed"],
        where: {
          order: {
            brandId,
            createdAt: {
              gte: settlementData.periodStart,
              lte: settlementData.periodEnd,
            },
          },
        },
        _count: true,
      }),
    ]);

    // ==================== OPTIMIZE: Single-pass calculation of all metrics ====================
    const metrics = orders.reduce(
      (acc, order) => {
        acc.totalSoldAmount += order.totalAmount;
        acc.totalSold++;

        order.voucherCodes.forEach((voucherCode) => {
          if (voucherCode.redemptions?.length > 0) {
            // Track unique redeemed vouchers
            acc.uniqueRedeemedVouchers.add(voucherCode.id);

            voucherCode.redemptions.forEach((redemption) => {
              acc.redeemedAmount += redemption.amountRedeemed;
              
              const redemptionDate = redemption.redeemedAt;
              if (!acc.lastRedemptionDate || redemptionDate > acc.lastRedemptionDate) {
                acc.lastRedemptionDate = redemptionDate;
              }
            });
          }
        });

        return acc;
      },
      {
        totalSoldAmount: 0,
        totalSold: 0,
        redeemedAmount: 0,
        lastRedemptionDate: null,
        uniqueRedeemedVouchers: new Set(),
      }
    );

    const totalRedeemed = metrics.uniqueRedeemedVouchers.size;
    const outstanding = metrics.totalSold - totalRedeemed;
    const outstandingAmount = metrics.totalSoldAmount - metrics.redeemedAmount;

    // ==================== OPTIMIZE: Build delivery summary in single pass ====================
    const deliverySummary = deliveryGroups.reduce(
      (acc, group) => {
        const count = group._count;
        acc.total += count;
        
        const statusKey = group.status?.toLowerCase();
        if (statusKey && statusKey in acc) {
          acc[statusKey] = count;
        }
        
        return acc;
      },
      {
        total: 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
      }
    );

    // ==================== OPTIMIZE: Use aggregated voucher stats ====================
    const summaryTotalIssued = voucherStats.reduce((sum, stat) => sum + stat._count, 0);
    const summaryTotalRedeemed = voucherStats.find(stat => stat.isRedeemed)?._count || 0;

    // ==================== OPTIMIZE: Calculate rates once ====================
    const redemptionRate = metrics.totalSold > 0
      ? ((totalRedeemed / metrics.totalSold) * 100).toFixed(2)
      : "0.00";

    const voucherRedemptionRate = metrics.totalSoldAmount > 0
      ? ((metrics.redeemedAmount / metrics.totalSoldAmount) * 100).toFixed(2)
      : "0.00";

    const settlementPeriod = `${settlementData.periodStart.toLocaleDateString()} - ${settlementData.periodEnd.toLocaleDateString()}`;

    return {
      success: true,
      data: {
        settlement: {
          id: settlementData.id,
          settlementPeriod: settlementData.settlementPeriod || settlementPeriod,
          periodStart: settlementData.periodStart,
          periodEnd: settlementData.periodEnd,
          totalSold: metrics.totalSold,
          totalSoldAmount: metrics.totalSoldAmount,
          totalRedeemed,
          redeemedAmount: metrics.redeemedAmount,
          outstanding,
          outstandingAmount,
          redemptionRate,
          lastRedemptionDate: metrics.lastRedemptionDate,
          commissionAmount: settlementData.commissionAmount,
          breakageAmount: settlementData.breakageAmount,
          vatAmount: settlementData.vatAmount,
          netPayable: settlementData.netPayable,
          totalPaid: settlementData.totalPaid,
          status: settlementData.status,
          createdAt: settlementData.createdAt,
          updatedAt: settlementData.updatedAt,
        },
        brand: settlementData.brand,
        summary: {
          totalVouchersIssued: summaryTotalIssued,
          totalVouchersRedeemed: summaryTotalRedeemed,
          totalVouchersUnredeemed: summaryTotalIssued - summaryTotalRedeemed,
          totalSoldAmount: metrics.totalSoldAmount,
          totalRedeemedAmount: metrics.redeemedAmount,
          voucherRedemptionRate,
          deliverySummary,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching overview:", error);
    return { success: false, message: "Failed to fetch overview", status: 500 };
  }
}


export async function getSettlementCalculation(brandId) {
  try {
    const settlement = await prisma.settlements.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      include: {
        brand: { include: { brandTerms: true } },
      },
    });

    if (!settlement) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    const brandTerms = settlement.brand.brandTerms;

    // Get orders for the period
    const orders = await prisma.order.findMany({
      where: {
        brandId,
        createdAt: {
          gte: settlement.periodStart,
          lte: settlement.periodEnd,
        },
      },
      include: {
        voucherCodes: {
          include: { redemptions: true },
        },
      },
    });

    // Calculate amounts
    const totalSoldAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    let redeemedAmount = 0;
    let totalRedeemed = 0;

    const uniqueRedeemed = new Set();
    orders.forEach((order) => {
      order.voucherCodes.forEach((code) => {
        if (code.redemptions?.length > 0) {
          uniqueRedeemed.add(code.id);
          code.redemptions.forEach((r) => {
            redeemedAmount += r.amountRedeemed;
          });
        }
      });
    });
    totalRedeemed = uniqueRedeemed.size;

    // Calculate commission
    const baseAmount =
      brandTerms?.settlementTrigger === "onRedemption"
        ? redeemedAmount
        : totalSoldAmount;

    let commissionAmount = 0;
    if (brandTerms) {
      if (brandTerms.commissionType === "Percentage") {
        commissionAmount = Math.round(
          (baseAmount * brandTerms.commissionValue) / 100,
        );
      } else if (brandTerms.commissionType === "Fixed") {
        const transactionCount =
          brandTerms.settlementTrigger === "onRedemption"
            ? totalRedeemed
            : orders.length;
        commissionAmount = Math.round(
          brandTerms.commissionValue * transactionCount,
        );
      }
    }

    // Calculate breakage
    const expiredVouchers = await prisma.voucherCode.aggregate({
      where: {
        orderId: { in: orders.map((o) => o.id) },
        isRedeemed: false,
        expiresAt: { lte: new Date() },
      },
      _sum: { originalValue: true },
    });

    const breakageAmount = expiredVouchers._sum.originalValue || 0;
    const adjustedBreakage = brandTerms?.breakageShare
      ? Math.round((breakageAmount * brandTerms.breakageShare) / 100)
      : 0;

    // Calculate VAT
    const vatAmount = brandTerms?.vatRate
      ? Math.round((commissionAmount * brandTerms.vatRate) / 100)
      : 0;

    // Net payable
    const netPayable =
      baseAmount - commissionAmount - adjustedBreakage + vatAmount;

    return {
      success: true,
      data: {
        baseAmount,
        settlementTrigger: brandTerms?.settlementTrigger,
        commissionCalculation: {
          type: brandTerms?.commissionType,
          value: brandTerms?.commissionValue,
          baseAmount,
          transactionCount:
            brandTerms?.settlementTrigger === "onRedemption"
              ? totalRedeemed
              : orders.length,
          result: commissionAmount,
        },
        breakageCalculation: {
          totalExpired: breakageAmount,
          sharePercentage: brandTerms?.breakageShare || 0,
          result: adjustedBreakage,
        },
        vatCalculation: {
          rate: brandTerms?.vatRate || 0,
          baseAmount: commissionAmount,
          result: vatAmount,
        },
        netPayableFormula:
          brandTerms?.settlementTrigger === "onRedemption"
            ? `Redeemed (${redeemedAmount}) - Commission (${commissionAmount}) - Breakage (${adjustedBreakage}) + VAT (${vatAmount}) = ${netPayable}`
            : `Sold (${totalSoldAmount}) - Commission (${commissionAmount}) - Breakage (${adjustedBreakage}) + VAT (${vatAmount}) = ${netPayable}`,
      },
    };
  } catch (error) {
    console.error("Error fetching calculation:", error);
    return {
      success: false,
      message: "Failed to fetch calculation",
      status: 500,
    };
  }
}

export async function getSettlementVouchers(brandId) {
  try {
    // ==================== OPTIMIZE: Parallel queries ====================
    const [settlement, vouchers] = await Promise.all([
      prisma.settlements.findFirst({
        where: { brandId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
        },
      }),
      prisma.vouchers.findMany({
        where: { brandId },
        select: {
          id: true,
          denominationType: true,
          denominations: {
            select: {
              id: true,
              value: true,
              currency: true,
            },
          },
          voucherCodes: {
            select: {
              id: true,
              originalValue: true,
              isRedeemed: true,
              redemptions: {
                select: {
                  amountRedeemed: true,
                  redeemedAt: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!settlement) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    // ==================== OPTIMIZE: Process vouchers with optimized loops ====================
    const voucherBreakdown = vouchers.map((voucher) => {
      // ==================== OPTIMIZE: Pre-process voucher codes by denomination ====================
      // Group codes by denomination value in single pass
      const codesByDenomination = new Map();
      let voucherIssuedTotal = 0;
      let voucherRedeemedTotal = 0;
      let voucherRedeemedAmount = 0;
      let voucherSoldAmount = 0;

      voucher.voucherCodes.forEach((code) => {
        const value = Number(code.originalValue);
        voucherIssuedTotal++;
        voucherSoldAmount += value;

        // Group by denomination
        if (!codesByDenomination.has(value)) {
          codesByDenomination.set(value, {
            codes: [],
            issuedCount: 0,
            redeemedCount: 0,
            redeemedAmount: 0,
          });
        }

        const denomGroup = codesByDenomination.get(value);
        denomGroup.codes.push(code);
        denomGroup.issuedCount++;

        // Calculate redemption metrics inline
        if (code.redemptions?.length > 0) {
          voucherRedeemedTotal++;
          denomGroup.redeemedCount++;

          const codeRedeemedAmount = code.redemptions.reduce(
            (sum, redemption) => sum + Number(redemption.amountRedeemed || 0),
            0
          );

          voucherRedeemedAmount += codeRedeemedAmount;
          denomGroup.redeemedAmount += codeRedeemedAmount;
        }
      });

      // ==================== OPTIMIZE: Build denomination breakdown from pre-processed data ====================
      const denominationBreakdown = voucher.denominations.map((denomination) => {
        const value = Number(denomination.value);
        const denomGroup = codesByDenomination.get(value) || {
          issuedCount: 0,
          redeemedCount: 0,
          redeemedAmount: 0,
        };

        const issuedCount = denomGroup.issuedCount;
        const redeemedCount = denomGroup.redeemedCount;

        return {
          id: denomination.id,
          value: value,
          currency: denomination.currency,
          issued: issuedCount,
          redeemed: redeemedCount,
          unredeemed: issuedCount - redeemedCount,
          redeemedAmount: denomGroup.redeemedAmount,
          percentage:
            issuedCount > 0
              ? ((redeemedCount / issuedCount) * 100).toFixed(2)
              : "0.00",
        };
      });

      return {
        id: voucher.id,
        denominationType: voucher.denominationType,
        totalIssued: voucherIssuedTotal,
        totalRedeemed: voucherRedeemedTotal,
        totalUnredeemed: voucherIssuedTotal - voucherRedeemedTotal,
        totalSoldAmount: voucherSoldAmount,
        totalRedeemedAmount: voucherRedeemedAmount,
        redemptionRate:
          voucherSoldAmount > 0
            ? ((voucherRedeemedAmount / voucherSoldAmount) * 100).toFixed(2)
            : "0.00",
        denominationBreakdown,
      };
    });

    return { success: true, data: voucherBreakdown };
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return { success: false, message: "Failed to fetch vouchers", status: 500 };
  }
}

// ==================== ALTERNATIVE: Ultra-optimized version with database aggregation ====================
export async function getSettlementVouchersOptimized(brandId) {
  try {
    // ==================== OPTIMIZE: Use database aggregation for massive performance gains ====================
    const [settlement, voucherStats, denominationStats] = await Promise.all([
      // Query 1: Get settlement
      prisma.settlements.findFirst({
        where: { brandId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
        },
      }),

      // Query 2: Aggregate voucher-level stats
      prisma.$queryRaw`
        SELECT 
          v.id as "voucherId",
          v."denominationType",
          COUNT(vc.id) as "totalIssued",
          COUNT(CASE WHEN vc."isRedeemed" = true THEN 1 END) as "totalRedeemed",
          COALESCE(SUM(vc."originalValue"), 0) as "totalSoldAmount",
          COALESCE(SUM(
            CASE WHEN vc."isRedeemed" = true 
            THEN (
              SELECT COALESCE(SUM(r."amountRedeemed"), 0)
              FROM "Redemption" r
              WHERE r."voucherCodeId" = vc.id
            )
            ELSE 0 END
          ), 0) as "totalRedeemedAmount"
        FROM "Vouchers" v
        LEFT JOIN "VoucherCode" vc ON vc."voucherId" = v.id
        WHERE v."brandId" = ${brandId}
        GROUP BY v.id, v."denominationType"
      `,

      // Query 3: Aggregate denomination-level stats
      prisma.$queryRaw`
        SELECT 
          v.id as "voucherId",
          d.id as "denominationId",
          d.value as "denominationValue",
          d.currency,
          COUNT(vc.id) as "issued",
          COUNT(CASE WHEN vc."isRedeemed" = true THEN 1 END) as "redeemed",
          COALESCE(SUM(
            CASE WHEN vc."isRedeemed" = true 
            THEN (
              SELECT COALESCE(SUM(r."amountRedeemed"), 0)
              FROM "Redemption" r
              WHERE r."voucherCodeId" = vc.id
            )
            ELSE 0 END
          ), 0) as "redeemedAmount"
        FROM "Vouchers" v
        INNER JOIN "Denomination" d ON d."voucherId" = v.id
        LEFT JOIN "VoucherCode" vc ON vc."voucherId" = v.id 
          AND CAST(vc."originalValue" AS DECIMAL) = CAST(d.value AS DECIMAL)
        WHERE v."brandId" = ${brandId}
        GROUP BY v.id, d.id, d.value, d.currency
        ORDER BY v.id, d.value
      `,
    ]);

    if (!settlement) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    // ==================== Build denomination breakdown map ====================
    const denomsByVoucher = new Map();
    
    denominationStats.forEach((stat) => {
      const voucherId = stat.voucherId;
      
      if (!denomsByVoucher.has(voucherId)) {
        denomsByVoucher.set(voucherId, []);
      }

      const issued = Number(stat.issued);
      const redeemed = Number(stat.redeemed);
      const redeemedAmount = Number(stat.redeemedAmount);

      denomsByVoucher.get(voucherId).push({
        id: stat.denominationId,
        value: Number(stat.denominationValue),
        currency: stat.currency,
        issued,
        redeemed,
        unredeemed: issued - redeemed,
        redeemedAmount,
        percentage:
          issued > 0 ? ((redeemed / issued) * 100).toFixed(2) : "0.00",
      });
    });

    // ==================== Build final voucher breakdown ====================
    const voucherBreakdown = voucherStats.map((stat) => {
      const totalIssued = Number(stat.totalIssued);
      const totalRedeemed = Number(stat.totalRedeemed);
      const totalSoldAmount = Number(stat.totalSoldAmount);
      const totalRedeemedAmount = Number(stat.totalRedeemedAmount);

      return {
        id: stat.voucherId,
        denominationType: stat.denominationType,
        totalIssued,
        totalRedeemed,
        totalUnredeemed: totalIssued - totalRedeemed,
        totalSoldAmount,
        totalRedeemedAmount,
        redemptionRate:
          totalSoldAmount > 0
            ? ((totalRedeemedAmount / totalSoldAmount) * 100).toFixed(2)
            : "0.00",
        denominationBreakdown: denomsByVoucher.get(stat.voucherId) || [],
      };
    });

    return { success: true, data: voucherBreakdown };
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return { success: false, message: "Failed to fetch vouchers", status: 500 };
  }
}

export async function getSettlementContacts(settlementId) {
  try {
    // First, get the settlement to retrieve the brandId
    const settlement = await prisma.settlements.findUnique({
      where: { id: settlementId },
      select: { brandId: true },
    });

    // Check if settlement exists
    if (!settlement) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    // Now fetch the brand contacts using the brandId
    const contacts = await prisma.brandContacts.findMany({
      where: { brandId: settlement.brandId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isPrimary: true,
      },
    });

    return { success: true, data: contacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return {
      success: false,
      message: "Failed to fetch contacts",
      status: 500,
    };
  }
}

export async function getSettlementTerms(settlementId) {
  try {
    // First, get the settlement to retrieve the brandId
    const settlement = await prisma.settlements.findUnique({
      where: { id: settlementId },
      select: { brandId: true },
    });

    // Check if settlement exists
    if (!settlement) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    const terms = await prisma.brandTerms.findFirst({
      where: { brandId: settlement.brandId },
    });

    return { success: true, data: terms };
  } catch (error) {
    console.error("Error fetching terms:", error);
    return { success: false, message: "Failed to fetch terms", status: 500 };
  }
}

export async function getSettlementDetails(settlementId) {
  try {
    // settlementId might be comma-separated IDs from grouped settlements
    const settlementIds = settlementId.split(",");

    const settlements = await prisma.settlements.findMany({
      where: {
        id: { in: settlementIds },
      },
      include: {
        brand: {
          include: {
            brandTerms: true,
            brandBankings: true,
          },
        },
      },
    });

    if (!settlements || settlements.length === 0) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    const firstSettlement = settlements[0];
    const brandId = firstSettlement.brandId;
    const brand = firstSettlement.brand;
    const brandTerms = brand.brandTerms;
    const brandBankings = brand.brandBankings;
    const currency = brand.currency || "USD";

    // Get period range
    const periodStart = new Date(
      Math.min(...settlements.map((s) => new Date(s.periodStart))),
    );
    const periodEnd = new Date(
      Math.max(...settlements.map((s) => new Date(s.periodEnd))),
    );

    // Aggregate settlement data
    const aggregatedData = settlements.reduce(
      (acc, settlement) => {
        return {
          totalSold: acc.totalSold + (settlement.totalSold || 0),
          totalSoldAmount:
            acc.totalSoldAmount + (settlement.totalSoldAmount || 0),
          totalRedeemed: acc.totalRedeemed + (settlement.totalRedeemed || 0),
          redeemedAmount: acc.redeemedAmount + (settlement.redeemedAmount || 0),
          outstanding: acc.outstanding + (settlement.outstanding || 0),
          outstandingAmount:
            acc.outstandingAmount + (settlement.outstandingAmount || 0),
          commissionAmount:
            acc.commissionAmount + (settlement.commissionAmount || 0),
          breakageAmount: acc.breakageAmount + (settlement.breakageAmount || 0),
          vatAmount: acc.vatAmount + (settlement.vatAmount || 0),
          netPayable: acc.netPayable + (settlement.netPayable || 0),
          totalPaid: acc.totalPaid + (settlement.totalPaid || 0),
          remainingAmount:
            acc.remainingAmount + (settlement.remainingAmount || 0),
        };
      },
      {
        totalSold: 0,
        totalSoldAmount: 0,
        totalRedeemed: 0,
        redeemedAmount: 0,
        outstanding: 0,
        outstandingAmount: 0,
        commissionAmount: 0,
        breakageAmount: 0,
        vatAmount: 0,
        netPayable: 0,
        totalPaid: 0,
        remainingAmount: 0,
      },
    );

    // Determine settlement trigger and base amount
    const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";
    const baseAmount =
      settlementTrigger === "onRedemption"
        ? aggregatedData.redeemedAmount
        : aggregatedData.totalSoldAmount;

    // Recalculate if netPayable is 0 but shouldn't be
    let commissionAmount = aggregatedData.commissionAmount;
    let vatAmount = aggregatedData.vatAmount;
    let breakageAmount = aggregatedData.breakageAmount;
    let netPayable = aggregatedData.netPayable;

    if (netPayable === 0 && baseAmount > 0) {
      // Recalculate commission
      if (brandTerms?.commissionType === "Percentage") {
        commissionAmount = Math.round(
          (baseAmount * brandTerms.commissionValue) / 100,
        );
      } else if (brandTerms?.commissionType === "Fixed") {
        const itemCount =
          settlementTrigger === "onRedemption"
            ? aggregatedData.totalRedeemed
            : aggregatedData.totalSold;
        commissionAmount = Math.round(brandTerms.commissionValue * itemCount);
      }

      // Recalculate VAT on commission
      if (brandTerms?.vatRate) {
        vatAmount = Math.round((commissionAmount * brandTerms.vatRate) / 100);
      }

      // Recalculate breakage
      if (brandTerms?.breakageShare && aggregatedData.outstandingAmount > 0) {
        breakageAmount = Math.round(
          (aggregatedData.outstandingAmount * brandTerms.breakageShare) / 100,
        );
      }

      // Recalculate net payable
      netPayable = baseAmount - commissionAmount + vatAmount - breakageAmount;
    }

    // Recalculate remaining amount
    const totalPaid = aggregatedData.totalPaid || 0;
    let remainingAmount = netPayable - totalPaid;
    if (remainingAmount < 0 && totalPaid >= netPayable) {
      remainingAmount = 0;
    }

    // Calculate redemption rate
    const redemptionRate =
      aggregatedData.totalSoldAmount > 0
        ? Math.round(
            (aggregatedData.redeemedAmount / aggregatedData.totalSoldAmount) *
              100,
          )
        : 0;

    // Determine status
    let status = "Pending";
    if (remainingAmount === 0 && totalPaid > 0) {
      status = "Paid";
    } else if (totalPaid > 0 && remainingAmount > 0) {
      status = "PartiallyPaid";
    }
    // Use stored status if available
    if (settlements[0].status) {
      status = settlements[0].status;
    }

    // Get payment history
    let paymentHistory = [];
    let lastPaymentDate = null;
    settlements.forEach((settlement) => {
      if (settlement.paymentHistory) {
        const history = Array.isArray(settlement.paymentHistory)
          ? settlement.paymentHistory
          : [settlement.paymentHistory];
        paymentHistory = [...paymentHistory, ...history];
      }
      if (settlement.lastPaymentDate) {
        if (
          !lastPaymentDate ||
          new Date(settlement.lastPaymentDate) > new Date(lastPaymentDate)
        ) {
          lastPaymentDate = settlement.lastPaymentDate;
        }
      }
    });

    // Sort payment history by date
    paymentHistory.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    // ===== VOUCHER SUMMARY - COMPREHENSIVE CALCULATION =====
    // Fetch all voucher codes for this brand and period from orders
    const voucherCodes = await prisma.voucherCode.findMany({
      where: {
        order: {
          brandId: brandId,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
          paymentStatus: "COMPLETED",
        },
      },
      include: {
        deliveryLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
        redemptions: {
          orderBy: {
            redeemedAt: "desc",
          },
        },
        order: true,
      },
    });

    // Calculate voucher metrics
    const totalIssued = voucherCodes.length;

    // Count redeemed vouchers - check multiple sources for accuracy
    let redeemedCount = 0;
    let unredeemedCount = 0;

    voucherCodes.forEach((voucher) => {
      // A voucher is considered redeemed if:
      // 1. isRedeemed flag is true, OR
      // 2. It has redemption records, OR
      // 3. remainingValue < originalValue
      const hasRedemptions =
        voucher.redemptions && voucher.redemptions.length > 0;
      const isPartiallyRedeemed =
        voucher.remainingValue < voucher.originalValue;
      const isFullyRedeemed =
        voucher.isRedeemed || voucher.remainingValue === 0;

      if (hasRedemptions || isPartiallyRedeemed || isFullyRedeemed) {
        redeemedCount++;
      } else {
        unredeemedCount++;
      }
    });

    // Delivery status calculation
    let delivered = 0;
    let pending = 0;
    let failed = 0;

    voucherCodes.forEach((voucher) => {
      if (voucher.deliveryLogs && voucher.deliveryLogs.length > 0) {
        // Get the latest delivery log status
        const latestLog = voucher.deliveryLogs[0];

        if (latestLog.status === "DELIVERED") {
          delivered++;
        } else if (
          latestLog.status === "PENDING" ||
          latestLog.status === "SENT"
        ) {
          pending++;
        } else if (
          latestLog.status === "FAILED" ||
          latestLog.status === "BOUNCED"
        ) {
          failed++;
        }
      } else {
        // No delivery logs means it's pending
        pending++;
      }
    });

    // Determine overall delivery status
    let deliveryStatus = "Pending";
    if (delivered === totalIssued && totalIssued > 0) {
      deliveryStatus = "All Delivered";
    } else if (delivered > 0 && delivered < totalIssued) {
      deliveryStatus = "Partially Delivered";
    } else if (failed > 0 && delivered === 0) {
      deliveryStatus = "Failed";
    } else if (pending === totalIssued && totalIssued > 0) {
      deliveryStatus = "Pending";
    }

    // Calculate accurate redemption rate from actual voucher data
    const actualRedemptionRate =
      totalIssued > 0 ? Math.round((redeemedCount / totalIssued) * 100) : 0;

    // If there's a mismatch with settlement data, log it for debugging
    if (redeemedCount !== aggregatedData.totalRedeemed) {
      console.warn("Redemption mismatch detected:", {
        voucherCodesRedeemed: redeemedCount,
        settlementRedeemed: aggregatedData.totalRedeemed,
        settlementPeriod: `${periodStart} - ${periodEnd}`,
      });
    }

    const settlementDetails = {
      id: settlementIds.join(","),
      settlementIds,
      brandId: firstSettlement.brandId,
      brandName: brand.brandName,
      brandLogo: brand.logo,

      // Period Info
      periodStart,
      periodEnd,
      settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      frequency: brandBankings?.settlementFrequency || "monthly",

      // Settlement trigger
      settlementTrigger,

      // Financial Metrics
      totalSold: aggregatedData.totalSold,
      totalSoldAmount: aggregatedData.totalSoldAmount,
      totalRedeemed: aggregatedData.totalRedeemed,
      redeemedAmount: aggregatedData.redeemedAmount,
      outstanding: aggregatedData.outstanding,
      outstandingAmount: aggregatedData.outstandingAmount,
      redemptionRate,

      // Financial Breakdown
      baseAmount,
      commissionAmount,
      commissionType: brandTerms?.commissionType,
      commissionValue: brandTerms?.commissionValue,
      breakageAmount,
      vatAmount,
      vatRate: brandTerms?.vatRate || 0,
      adjustments: 0,
      netPayable,

      // Payment Info
      status,
      totalPaid,
      remainingAmount,
      lastPaymentDate,
      paymentReference:
        settlements.find((s) => s.paymentReference)?.paymentReference || null,
      paymentHistory,
      paymentCount: paymentHistory.length,

      // Voucher Summary - ACCURATE FROM ACTUAL VOUCHER DATA
      voucherSummary: {
        totalIssued,
        redeemed: redeemedCount,
        unredeemed: unredeemedCount,
        delivered,
        pending,
        failed,
        deliveryStatus,
        redemptionRate: actualRedemptionRate, // Use calculated rate from actual vouchers
      },

      // Dates
      lastRedemptionDate: null,
      createdAt: firstSettlement.createdAt,
      updatedAt: new Date(
        Math.max(...settlements.map((s) => new Date(s.updatedAt))),
      ),

      // Brand Info
      currency,
      bankingInfo: brandBankings,
      brandTerms,
    };

    return {
      success: true,
      data: settlementDetails,
    };
  } catch (error) {
    console.error("Error fetching settlement details:", error);
    return {
      success: false,
      message: "Failed to fetch settlement details",
      error: error.message,
      status: 500,
    };
  }
}

export async function getSettlementVouchersList(settlementId, params = {}) {
  try {
    if (!settlementId) {
      return {
        success: false,
        message: "Settlement ID is required",
        status: 400,
      };
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const settlementIds = settlementId.split(",");

    const settlements = await prisma.settlements.findMany({
      where: {
        id: { in: settlementIds },
      },
      include: {
        brand: {
          include: {
            brandTerms: true,
          },
        },
      },
    });

    if (!settlements || settlements.length === 0) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    const firstSettlement = settlements[0];
    const brandId = firstSettlement.brandId;
    const brandTerms = firstSettlement.brand.brandTerms;

    const periodStart = new Date(
      Math.min(...settlements.map((s) => new Date(s.periodStart))),
    );
    const periodEnd = new Date(
      Math.max(...settlements.map((s) => new Date(s.periodEnd))),
    );

    // ✅ FIXED: Added paymentStatus filter to base where clause
    const whereClause = {
      brandId,
      paymentStatus: "COMPLETED", // Only include completed/paid orders
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          receiverDetail: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          receiverDetail: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        { senderEmail: { contains: search, mode: "insensitive" } },
        { senderName: { contains: search, mode: "insensitive" } },
      ];
    }

    // ✅ Both queries now use whereClause with paymentStatus filter
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          receiverDetail: true,
          voucherCodes: {
            include: {
              redemptions: true,
            },
          },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // ✅ This query also uses whereClause with paymentStatus filter
    const allOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        voucherCodes: {
          include: {
            redemptions: true,
          },
        },
      },
    });

    // Calculate voucher statistics with improved logic
    let totalIssued = 0;
    let totalRedeemed = 0;
    let totalUnredeemed = 0;
    let totalIssuedValue = 0;
    let totalRedeemedValue = 0;
    const denominationMap = new Map();

    allOrders.forEach((order) => {
      order.voucherCodes.forEach((voucher) => {
        totalIssued++;

        // Accumulate issued and redeemed values
        totalIssuedValue += voucher.originalValue || 0;

        // Calculate total redeemed amount from redemptions
        const totalRedeemedAmount =
          voucher.redemptions?.reduce((sum, r) => {
            return sum + (r.amountRedeemed || 0);
          }, 0) || 0;

        // Accumulate redeemed value
        totalRedeemedValue += totalRedeemedAmount;

        // IMPROVED LOGIC: A voucher is redeemed if:
        // 1. It has ANY amount redeemed (check redemptions array)
        // 2. OR the isRedeemed flag is true
        // 3. OR remaining value is less than original value (partial redemption)
        const hasRedemptions =
          voucher.redemptions && voucher.redemptions.length > 0;
        const hasRedeemedAmount = totalRedeemedAmount > 0;
        const isPartiallyRedeemed =
          voucher.originalValue &&
          voucher.remainingValue < voucher.originalValue;
        const isMarkedRedeemed = voucher.isRedeemed === true;

        const isRedeemed =
          hasRedemptions ||
          hasRedeemedAmount ||
          isPartiallyRedeemed ||
          isMarkedRedeemed;

        if (isRedeemed) {
          totalRedeemed++;
        } else {
          totalUnredeemed++;
        }

        const denomination = voucher.originalValue || 0;
        if (!denominationMap.has(denomination)) {
          denominationMap.set(denomination, {
            value: denomination,
            issued: 0,
            redeemed: 0,
            unredeemed: 0,
            expiresAt: voucher.expiresAt,
            voucherCodes: [],
          });
        }

        const denom = denominationMap.get(denomination);
        denom.issued++;

        if (isRedeemed) {
          denom.redeemed++;
        } else {
          denom.unredeemed++;
        }

        denom.voucherCodes.push({
          id: voucher.id,
          code: voucher.code,
          originalValue: voucher.originalValue,
          remainingValue: voucher.remainingValue,
          isRedeemed: voucher.isRedeemed,
          redeemedAt: voucher.redeemedAt,
          expiresAt: voucher.expiresAt,
          orderId: voucher.orderId,
          redemptions: voucher.redemptions,
          redemptionCount: voucher.redemptions?.length || 0,
          totalRedeemedAmount: totalRedeemedAmount,
        });
      });
    });

    // Calculate redemption rate based on AMOUNT (not voucher count)
    const redemptionRate =
      totalIssuedValue > 0
        ? ((totalRedeemedValue / totalIssuedValue) * 100).toFixed(2)
        : "0.00";

    const denominationBreakdown = Array.from(denominationMap.values())
      .map((denom) => ({
        value: denom.value,
        issued: denom.issued,
        redeemed: denom.redeemed,
        unredeemed: denom.unredeemed,
        rate:
          denom.issued > 0
            ? ((denom.redeemed / denom.issued) * 100).toFixed(2)
            : "0.00",
        expires: denom.expiresAt,
        totalIssuedValue: denom.value * denom.issued,
        totalRedeemedValue: denom.value * denom.redeemed,
        totalUnredeemedValue: denom.value * denom.unredeemed,
        percentageOfTotal:
          totalIssued > 0
            ? ((denom.issued / totalIssued) * 100).toFixed(1)
            : "0.0",
        voucherCodes: denom.voucherCodes,
      }))
      .sort((a, b) => b.value - a.value);

    const voucherData = orders.map((order) => {
      const totalVouchers = order.voucherCodes.length;

      // Apply same improved logic for per-order stats
      const redeemedVouchers = order.voucherCodes.filter((v) => {
        const totalRedeemedAmount =
          v.redemptions?.reduce((sum, r) => sum + (r.amountRedeemed || 0), 0) ||
          0;

        const hasRedemptions = v.redemptions && v.redemptions.length > 0;
        const hasRedeemedAmount = totalRedeemedAmount > 0;
        const isPartiallyRedeemed = v.remainingValue < v.originalValue;
        const isMarkedRedeemed = v.isRedeemed === true;

        return (
          hasRedemptions ||
          hasRedeemedAmount ||
          isPartiallyRedeemed ||
          isMarkedRedeemed
        );
      }).length;

      const totalAmount = order.totalAmount || 0;
      const redeemedAmount = order.voucherCodes.reduce((sum, v) => {
        if (v.redemptions && v.redemptions.length > 0) {
          return (
            sum + v.redemptions.reduce((s, r) => s + (r.amountRedeemed || 0), 0)
          );
        }
        return sum;
      }, 0);

      const redemptionRate =
        totalVouchers > 0
          ? ((redeemedVouchers / totalVouchers) * 100).toFixed(1)
          : "0.0";

      const baseAmount =
        brandTerms?.settlementTrigger === "onRedemption"
          ? redeemedAmount
          : totalAmount;

      let commissionAmount = 0;
      if (brandTerms) {
        if (brandTerms.commissionType === "Percentage") {
          commissionAmount = Math.round(
            (baseAmount * (brandTerms.commissionValue || 0)) / 100,
          );
        } else if (brandTerms.commissionType === "Fixed") {
          const transactionCount =
            brandTerms.settlementTrigger === "onRedemption"
              ? redeemedVouchers
              : totalVouchers;
          commissionAmount = Math.round(
            (brandTerms.commissionValue || 0) * transactionCount,
          );
        }
      }

      const vatRate = brandTerms?.vatRate || 0;
      const vatAmount = Math.round((commissionAmount * vatRate) / 100);
      const netPayable = Math.round(baseAmount - commissionAmount + vatAmount);

      let lastRedemptionDate = null;
      order.voucherCodes.forEach((v) => {
        if (v.redemptions && v.redemptions.length > 0) {
          v.redemptions.forEach((r) => {
            const date = new Date(r.redeemedAt);
            if (!lastRedemptionDate || date > lastRedemptionDate) {
              lastRedemptionDate = date;
            }
          });
        }
      });

      let status = "Pending";

      // Check if expired first
      const isExpired = order.voucherCodes.some(
        (v) =>
          v.expiresAt &&
          new Date(v.expiresAt) < new Date() &&
          !v.isRedeemed &&
          v.remainingValue > 0,
      );

      if (isExpired && redeemedVouchers === 0) {
        status = "Disputed";
      } else if (redeemedVouchers === totalVouchers && totalVouchers > 0) {
        // All vouchers are redeemed (fully or partially)
        status = "Redeemed";
      } else if (redeemedVouchers > 0) {
        // Some vouchers are redeemed - still count as Redeemed
        status = "Redeemed";
      } else {
        // No vouchers redeemed
        status = "Pending";
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber || order.id,
        senderName: order.senderName || "N/A",
        senderEmail: order.senderEmail || "N/A",
        receiverName: order.receiverDetail?.name || "N/A",
        receiverEmail: order.receiverDetail?.email || "N/A",
        receiverPhone: order.receiverDetail?.phone || "N/A",
        brand: firstSettlement.brand.brandName,
        brandLogo: firstSettlement.brand.logo,
        currency: order.currency || firstSettlement.brand.currency || "USD",
        frequency:
          firstSettlement.brand.brandBankings?.settlementFrequency || "monthly",
        period: `${new Date(order.createdAt).toLocaleDateString()}`,
        periodRange: `${new Date(order.createdAt).toLocaleDateString()} - ${new Date(
          order.createdAt,
        ).toLocaleDateString()}`,
        totalSold: totalAmount,
        totalVouchers: totalVouchers,
        redeemedAmount,
        redeemedVouchers,
        redemptionRate,
        baseAmount,
        commissionAmount,
        commissionType: brandTerms?.commissionType || "N/A",
        commissionValue: brandTerms?.commissionValue || 0,
        vatAmount,
        vatRate,
        netPayable,
        outstanding: totalAmount - redeemedAmount,
        settlementTrigger: brandTerms?.settlementTrigger || "onPurchase",
        lastPaymentDate: lastRedemptionDate,
        status,
        createdAt: order.createdAt,
      };
    });

    let filteredData = voucherData;
    if (status) {
      filteredData = voucherData.filter((v) => v.status === status);
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    const summary = {
      totalPayable: filteredData.reduce((sum, v) => sum + v.baseAmount, 0),
      totalPaid: filteredData.reduce((sum, v) => sum + v.redeemedAmount, 0),
      totalRemaining: filteredData.reduce((sum, v) => sum + v.outstanding, 0),
      totalCommission: filteredData.reduce(
        (sum, v) => sum + v.commissionAmount,
        0,
      ),
      totalVat: filteredData.reduce((sum, v) => sum + v.vatAmount, 0),
      totalNetPayable: filteredData.reduce((sum, v) => sum + v.netPayable, 0),
      successRate:
        filteredData.length > 0
          ? (
              (filteredData.filter((v) => v.status === "Redeemed").length /
                filteredData.length) *
              100
            ).toFixed(1)
          : "0.0",
      totalOrders: filteredData.length,
      redeemedCount: filteredData.filter((v) => v.status === "Redeemed").length,
      pendingCount: filteredData.filter((v) => v.status === "Pending").length,
      disputedCount: filteredData.filter((v) => v.status === "Disputed").length,
    };

    return {
      success: true,
      data: filteredData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      summary,
      voucherStats: {
        totalIssued,
        totalRedeemed,
        totalUnredeemed,
        redemptionRate,
        denominationBreakdown,
      },
      periodInfo: {
        start: periodStart,
        end: periodEnd,
        brandName: firstSettlement.brand.brandName,
      },
    };
  } catch (error) {
    console.error("Error fetching settlement vouchers:", error);
    return {
      success: false,
      message: "Failed to fetch settlement vouchers",
      error: error.message,
      status: 500,
    };
  }
}

export async function getSettlementBankingDetails(settlementId) {
  try {
    const settlement = await prisma.settlements.findUnique({
      where: { id: settlementId },
      select: { brandId: true },
    });

    // Check if settlement exists
    if (!settlement) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    const banking = await prisma.brandBanking.findFirst({
      where: { brandId: settlement.brandId },
    });

    return { success: true, data: banking };
  } catch (error) {
    console.error("Error fetching banking:", error);
    return { success: false, message: "Failed to fetch banking", status: 500 };
  }
}

export async function getBrandSettlementHistory(brandId, params = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      filterYear = null,
      filterMonth = null,
      status = "",
      sortBy = "periodStart",
      sortOrder = "desc",
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // ==================== OPTIMIZE: Fetch brand and settlements in parallel ====================
    // Build date filter first
    let dateFilter = {};

    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      dateFilter = {
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
      };
    } else if (filterYear) {
      const year = parseInt(filterYear, 10);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      dateFilter = {
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
      };
    }

    const whereClause = {
      brandId: brandId,
      ...dateFilter,
    };

    // ==================== OPTIMIZE: Determine if we can paginate at DB level ====================
    const shouldPaginateAtDB = !status; // Only paginate at DB if no status filter

    const settlementQueryOptions = {
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        settlementPeriod: true,
        periodStart: true,
        periodEnd: true,
        totalSold: true,
        totalSoldAmount: true,
        totalRedeemed: true,
        redeemedAmount: true,
        outstanding: true,
        outstandingAmount: true,
        commissionAmount: true,
        breakageAmount: true,
        vatAmount: true,
        netPayable: true,
        totalPaid: true,
        remainingAmount: true,
        status: true,
        paidAt: true,
        lastPaymentDate: true,
        paymentCount: true,
        paymentHistory: true,
        paymentReference: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    // Add pagination to query if we can
    if (shouldPaginateAtDB) {
      settlementQueryOptions.skip = skip;
      settlementQueryOptions.take = limitNum;
    }

    // ==================== OPTIMIZE: Single parallel query for brand and settlements ====================
    const [brand, allSettlements, totalCount] = await Promise.all([
      prisma.brand.findUnique({
        where: { id: brandId },
        select: {
          id: true,
          brandName: true,
          logo: true,
          currency: true,
          domain: true,
          website: true,
          contact: true,
          isActive: true,
          brandTerms: {
            select: {
              id: true,
              settlementTrigger: true,
              commissionType: true,
              commissionValue: true,
              maxDiscount: true,
              minOrderValue: true,
              currency: true,
              breakagePolicy: true,
              breakageShare: true,
              contractStart: true,
              contractEnd: true,
              goLiveDate: true,
              renewContract: true,
              vatRate: true,
              internalNotes: true,
            },
          },
          brandBankings: {
            select: {
              id: true,
              settlementFrequency: true,
              dayOfMonth: true,
              payoutMethod: true,
              invoiceRequired: true,
              remittanceEmail: true,
              accountHolder: true,
              accountNumber: true,
              bankName: true,
              branchCode: true,
              country: true,
            },
          },
        },
      }),
      prisma.settlements.findMany(settlementQueryOptions),
      prisma.settlements.count({ where: whereClause }),
    ]);

    if (!brand) {
      return {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    }

    if (allSettlements.length === 0) {
      return {
        success: true,
        data: [],
        brandInfo: formatBrandInfo(brand),
        pagination: createEmptyPagination(pageNum, limitNum),
        summary: createEmptySummary(),
        filters: {
          appliedYear: filterYear,
          appliedMonth: filterMonth,
          appliedStatus: status,
        },
      };
    }

    // ==================== OPTIMIZE: Extract calculation logic to reusable function ====================
    const brandTerms = brand.brandTerms;
    const brandBankings = brand.brandBankings;
    const currency = brand.currency || "USD";
    const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";

    const processSettlement = (settlement) => {
      const baseAmount =
        settlementTrigger === "onRedemption"
          ? settlement.redeemedAmount
          : settlement.totalSoldAmount;

      // Commission calculation
      let calculatedCommission = 0;
      if (brandTerms && baseAmount > 0) {
        if (brandTerms.commissionType === "Percentage") {
          calculatedCommission = Math.round(
            (baseAmount * brandTerms.commissionValue) / 100
          );
        } else if (brandTerms.commissionType === "Fixed") {
          const itemCount =
            settlementTrigger === "onRedemption"
              ? settlement.totalRedeemed
              : settlement.totalSold;
          calculatedCommission = Math.round(
            brandTerms.commissionValue * itemCount
          );
        }
      }

      const commissionAmount =
        settlement.commissionAmount === 0 && baseAmount > 0
          ? calculatedCommission
          : (settlement.commissionAmount ?? calculatedCommission);

      // VAT calculation
      const vatRate = brandTerms?.vatRate || 0;
      const calculatedVatAmount = Math.round(
        (commissionAmount * vatRate) / 100
      );

      const vatAmount =
        settlement.vatAmount === 0 && commissionAmount > 0
          ? calculatedVatAmount
          : (settlement.vatAmount ?? calculatedVatAmount);

      // Breakage calculation
      let calculatedBreakageAmount = 0;
      if (brandTerms?.breakageShare && settlement.outstandingAmount > 0) {
        calculatedBreakageAmount = Math.round(
          (settlement.outstandingAmount * brandTerms.breakageShare) / 100
        );
      }

      const breakageAmount =
        settlement.breakageAmount === 0 && 
        settlement.outstandingAmount > 0 && 
        brandTerms?.breakageShare
          ? calculatedBreakageAmount
          : (settlement.breakageAmount ?? calculatedBreakageAmount);

      // Net payable calculation
      let calculatedNetPayable = 0;
      if (baseAmount > 0) {
        calculatedNetPayable =
          baseAmount - commissionAmount + vatAmount - breakageAmount;
      }

      const netPayable =
        settlement.netPayable === 0 && baseAmount > 0
          ? calculatedNetPayable
          : (settlement.netPayable ?? calculatedNetPayable);

      // Remaining amount calculation
      const totalPaid = settlement.totalPaid || 0;
      let calculatedRemainingAmount = netPayable - totalPaid;

      if (calculatedRemainingAmount <= 0 && totalPaid >= netPayable) {
        calculatedRemainingAmount = 0;
      }

      const remainingAmount = calculatedRemainingAmount;

      // Dynamic status calculation
      const dynamicStatus = calculateSettlementStatus(
        netPayable,
        totalPaid,
        remainingAmount
      );

      return {
        id: settlement.id,
        settlementPeriod: settlement.settlementPeriod,
        periodStart: settlement.periodStart,
        periodEnd: settlement.periodEnd,
        settlementTrigger,
        baseAmount,
        totalSold: settlement.totalSold,
        totalSoldAmount: settlement.totalSoldAmount,
        totalRedeemed: settlement.totalRedeemed,
        redeemedAmount: settlement.redeemedAmount,
        outstanding: settlement.outstanding,
        outstandingAmount: settlement.outstandingAmount,
        commissionAmount,
        commissionPercentage:
          brandTerms?.commissionType === "Percentage"
            ? brandTerms.commissionValue
            : null,
        commissionFixed:
          brandTerms?.commissionType === "Fixed"
            ? brandTerms.commissionValue
            : null,
        breakageAmount,
        vatAmount,
        vatRate,
        netPayable,
        totalPaid,
        remainingAmount,
        status: dynamicStatus,
        dbStatus: settlement.status,
        paidAt: settlement.paidAt,
        lastPaymentDate: settlement.lastPaymentDate,
        paymentCount: settlement.paymentCount || 0,
        paymentHistory: settlement.paymentHistory,
        paymentReference: settlement.paymentReference,
        brand: {
          id: brand.id,
          brandName: brand.brandName,
          logo: brand.logo,
          currency: brand.currency,
          domain: brand.domain,
          website: brand.website,
          contact: brand.contact,
          isActive: brand.isActive,
        },
        brandTerms: brandTerms
          ? {
              id: brandTerms.id,
              settlementTrigger: brandTerms.settlementTrigger,
              commissionType: brandTerms.commissionType,
              commissionValue: brandTerms.commissionValue,
              maxDiscount: brandTerms.maxDiscount,
              minOrderValue: brandTerms.minOrderValue,
              currency: brandTerms.currency,
              breakagePolicy: brandTerms.breakagePolicy,
              breakageShare: brandTerms.breakageShare,
              contractStart: brandTerms.contractStart,
              contractEnd: brandTerms.contractEnd,
              goLiveDate: brandTerms.goLiveDate,
              renewContract: brandTerms.renewContract,
              vatRate: brandTerms.vatRate,
              internalNotes: brandTerms.internalNotes,
            }
          : null,
        brandBankings: brandBankings
          ? {
              id: brandBankings.id,
              settlementFrequency: brandBankings.settlementFrequency,
              dayOfMonth: brandBankings.dayOfMonth,
              payoutMethod: brandBankings.payoutMethod,
              invoiceRequired: brandBankings.invoiceRequired,
              remittanceEmail: brandBankings.remittanceEmail,
              accountHolder: brandBankings.accountHolder,
              accountNumber: brandBankings.accountNumber,
              bankName: brandBankings.bankName,
              branchCode: brandBankings.branchCode,
              country: brandBankings.country,
            }
          : null,
        currency,
        notes: settlement.notes,
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt,
      };
    };

    // Process settlements
    const processedSettlements = allSettlements.map(processSettlement);

    // Apply status filter after processing (only if needed)
    let filteredSettlements = processedSettlements;
    if (status) {
      filteredSettlements = processedSettlements.filter(
        (s) => s.status === status
      );
    }

    // ==================== OPTIMIZE: Handle pagination based on whether it was done at DB ====================
    let paginatedSettlements;
    let totalPages;
    let finalTotalCount;

    if (shouldPaginateAtDB) {
      // Already paginated at DB level
      paginatedSettlements = filteredSettlements;
      totalPages = Math.ceil(totalCount / limitNum);
      finalTotalCount = totalCount;
    } else {
      // Need to paginate in memory (because of status filter)
      paginatedSettlements = filteredSettlements.slice(skip, skip + limitNum);
      totalPages = Math.ceil(filteredSettlements.length / limitNum);
      finalTotalCount = filteredSettlements.length;
    }

    // ==================== OPTIMIZE: Single-pass summary calculation ====================
    const summary = filteredSettlements.reduce(
      (acc, s) => {
        acc.totalSoldAmount += s.totalSoldAmount;
        acc.totalRedeemedAmount += s.redeemedAmount;
        acc.totalOutstandingAmount += s.outstandingAmount;
        acc.totalCommissionAmount += s.commissionAmount || 0;
        acc.totalVatAmount += s.vatAmount || 0;
        acc.totalBreakageAmount += s.breakageAmount || 0;
        acc.totalNetPayable += s.netPayable || 0;
        acc.totalPaid += s.totalPaid || 0;
        acc.totalRemainingAmount += s.remainingAmount || 0;

        // Count statuses
        switch (s.status) {
          case "Pending":
            acc.statusBreakdown.pending++;
            break;
          case "Paid":
            acc.statusBreakdown.paid++;
            break;
          case "Partial":
            acc.statusBreakdown.partial++;
            break;
          case "InReview":
            acc.statusBreakdown.inReview++;
            break;
          case "Disputed":
            acc.statusBreakdown.disputed++;
            break;
        }

        return acc;
      },
      {
        totalSettlements: filteredSettlements.length,
        totalSoldAmount: 0,
        totalRedeemedAmount: 0,
        totalOutstandingAmount: 0,
        totalCommissionAmount: 0,
        totalVatAmount: 0,
        totalBreakageAmount: 0,
        totalNetPayable: 0,
        totalPaid: 0,
        totalRemainingAmount: 0,
        statusBreakdown: {
          pending: 0,
          paid: 0,
          partial: 0,
          inReview: 0,
          disputed: 0,
        },
      }
    );

    return {
      success: true,
      data: paginatedSettlements,
      brandInfo: formatBrandInfo(brand),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: finalTotalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      summary,
      filters: {
        appliedYear: filterYear,
        appliedMonth: filterMonth,
        appliedStatus: status,
      },
    };
  } catch (error) {
    console.error("Error fetching brand settlement history:", error);
    return {
      success: false,
      message: "Failed to fetch settlement history",
      error: error.message,
      status: 500,
    };
  }
}

function formatBrandInfo(brand) {
  return {
    id: brand.id,
    name: brand.brandName,
    logo: brand.logo,
    currency: brand.currency,
    frequency: brand.brandBankings?.settlementFrequency,
    bankingInfo: brand.brandBankings
      ? {
          accountHolder: brand.brandBankings.accountHolder,
          accountNumber: brand.brandBankings.accountNumber,
          bankName: brand.brandBankings.bankName,
          branchCode: brand.brandBankings.branchCode,
          payoutMethod: brand.brandBankings.payoutMethod,
        }
      : null,
  };
}

function createEmptySummary() {
  return {
    totalSettlements: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalRemaining: 0,
    pendingCount: 0,
    paidCount: 0,
    inReviewCount: 0,
    disputedCount: 0,
    partiallyPaidCount: 0,
  };
}

function createEmptyPagination(pageNum, limitNum) {
  return {
    currentPage: pageNum,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: limitNum,
    hasNextPage: false,
    hasPrevPage: false,
  };
}