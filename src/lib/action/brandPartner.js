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
        .optional()
    ),
    contractEnd: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid contract end date",
        })
        .optional()
    ),
    goLiveDate: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid go live date",
        })
        .optional()
    ),
    renewContract: z.boolean().default(false),
    vatRate: z.number().min(0).max(100).optional().nullable(),
    internalNotes: z.string().optional().nullable(),

    // Voucher Configuration
    denominationType: z.enum(["fixed", "amount"]).default("fixed"),
    denominations: z.array(DenominationSchema).optional().default([]),
    denominationValue: z.any().optional().nullable(),
    denominationCurrency: z.string().default("USD"),
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
      .email("Invalid email format")
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
    }
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
        const filename = `${generateSlug(
          validatedData.brandName
        )}_${timestamp}.${extension}`;

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
    const integrationDataPromises = (validatedData.integrations || []).map(
      (integration) => prepareIntegrationData(integration, null)
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
      }
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
        const filename = `${generateSlug(
          validatedData.brandName
        )}_${timestamp}.${extension}`;

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
    const integrationDataPromises = (validatedData.integrations || []).map(
      (integration) => prepareIntegrationData(integration, brandId)
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
          })
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

        if (existingBrand.vouchers[0]) {
          const voucherId = existingBrand.vouchers[0].id;

          operations.push(
            tx.vouchers.update({
              where: { id: voucherId },
              data: voucherData,
            })
          );

          // Handle denominations - delete existing and create new ones
          operations.push(
            tx.denomination.deleteMany({
              where: { voucherId },
            })
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
              })
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
          })
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
      }
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

    // Delete brand (cascade will handle related records including denominations)
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

    // Handle logo upload
    if (logoFile && logoFile.size > 0) {
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
        const extension = logoFile.name.split(".").pop();
        const filename = `${generateSlug(
          brandName || "brand"
        )}_${timestamp}.${extension}`;

        const filePath = join(uploadDir, filename);
        const bytes = await logoFile.arrayBuffer();
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
  changes = null
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
      groupByBrand = true, // New parameter to control grouping
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { brand: { brandName: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (brandId) {
      whereClause.brandId = brandId;
    }

    const orderBy = { [sortBy]: sortOrder };

    // Fetch all settlements (without pagination first if grouping)
    const allSettlements = await prisma.settlements.findMany({
      where: whereClause,
      orderBy,
      include: {
        brand: {
          include: {
            brandTerms: true,
          },
        },
      },
    });

    let processedSettlements;

    if (groupByBrand) {
      // Group settlements by brand
      const brandGroups = {};

      allSettlements.forEach((settlement) => {
        if (!brandGroups[settlement.brandId]) {
          brandGroups[settlement.brandId] = [];
        }
        brandGroups[settlement.brandId].push(settlement);
      });

      // Process each brand group
      processedSettlements = await Promise.all(
        Object.values(brandGroups).map(async (brandSettlements) => {
          const firstSettlement = brandSettlements[0];
          const allIds = brandSettlements.map(s => s.id);
          
          // Get the earliest start and latest end date
          const periodStart = new Date(Math.min(...brandSettlements.map(s => s.periodStart)));
          const periodEnd = new Date(Math.max(...brandSettlements.map(s => s.periodEnd)));

          // Get all orders for this brand within the combined period
          const orders = await prisma.order.findMany({
            where: {
              brandId: firstSettlement.brandId,
              createdAt: {
                gte: periodStart,
                lte: periodEnd,
              },
              paymentStatus: "COMPLETED",
            },
            include: {
              voucherCodes: {
                include: {
                  redemptions: true,
                },
              },
            },
          });

          // Calculate actual sold values
          const totalSoldAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          const totalSold = orders.length;

          // Calculate actual redemption values
          let totalRedeemed = 0;
          let redeemedAmount = 0;
          const uniqueRedeemedVouchers = new Set();

          orders.forEach((order) => {
            order.voucherCodes.forEach((voucherCode) => {
              if (voucherCode.redemptions && voucherCode.redemptions.length > 0) {
                uniqueRedeemedVouchers.add(voucherCode.id);
                
                voucherCode.redemptions.forEach((redemption) => {
                  redeemedAmount += redemption.amountRedeemed;
                });
              }
            });
          });

          totalRedeemed = uniqueRedeemedVouchers.size;

          // Calculate outstanding
          const outstanding = totalSold - totalRedeemed;
          const outstandingAmount = totalSoldAmount - redeemedAmount;

          // Calculate commission
          let commissionAmount = 0;
          const brandTerms = firstSettlement.brand.brandTerms;
          
          if (brandTerms) {
            const baseAmount = brandTerms.settlementTrigger === "onRedemption" 
              ? redeemedAmount 
              : totalSoldAmount;

            if (brandTerms.commissionType === "Percentage") {
              commissionAmount = Math.round((baseAmount * brandTerms.commissionValue) / 100);
            } else if (brandTerms.commissionType === "Fixed") {
              commissionAmount = Math.round(
                brandTerms.commissionValue * 
                (brandTerms.settlementTrigger === "onRedemption" ? totalRedeemed : totalSold)
              );
            }
          }

          // Calculate breakage
          const expiredAmount = await prisma.voucherCode.aggregate({
            where: {
              orderId: { in: orders.map(o => o.id) },
              isRedeemed: false,
              expiresAt: { lte: new Date() },
            },
            _sum: { originalValue: true },
          });

          const breakageAmount = expiredAmount._sum.originalValue || 0;
          const adjustedBreakage = brandTerms?.breakageShare 
            ? Math.round((breakageAmount * brandTerms.breakageShare) / 100)
            : 0;

          // Calculate VAT
          const vatAmount = brandTerms?.vatRate 
            ? Math.round((commissionAmount * brandTerms.vatRate) / 100)
            : 0;

          // Calculate net payable
          const netPayable = redeemedAmount - commissionAmount - adjustedBreakage + vatAmount;

          // Determine overall status (if any is Pending, show Pending)
          const hasPending = brandSettlements.some(s => s.status === "Pending");
          const hasInReview = brandSettlements.some(s => s.status === "InReview");
          const hasDisputed = brandSettlements.some(s => s.status === "Disputed");
          
          let overallStatus = "Paid";
          if (hasPending) overallStatus = "Pending";
          else if (hasInReview) overallStatus = "InReview";
          else if (hasDisputed) overallStatus = "Disputed";

          // Get latest payment date
          const paidDates = brandSettlements
            .map(s => s.paidAt)
            .filter(date => date !== null);
          const lastPaymentDate = paidDates.length > 0 
            ? new Date(Math.max(...paidDates.map(d => new Date(d))))
            : null;

          const remainingAmount = overallStatus === "Paid" ? 0 : netPayable;

          return {
            id: allIds.join(','), // Combined IDs
            settlementIds: allIds, // Array of original settlement IDs
            brandId: firstSettlement.brandId,
            brandName: firstSettlement.brand.brandName,
            settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
            periodStart,
            periodEnd,
            recordCount: brandSettlements.length, // How many records were merged
            
            // Actual calculated values
            totalSold,
            totalSoldAmount,
            totalRedeemed,
            redeemedAmount,
            outstanding,
            outstandingAmount,
            
            // Financial calculations
            commissionAmount,
            breakageAmount: adjustedBreakage,
            vatAmount,
            netPayable,
            remainingAmount,
            
            // Payment info
            status: overallStatus,
            paidAt: lastPaymentDate,
            lastPaymentDate,
            paymentReference: brandSettlements.map(s => s.paymentReference).filter(Boolean).join(', '),
            notes: brandSettlements.map(s => s.notes).filter(Boolean).join(' | '),
            
            // Brand terms info
            settlementTrigger: brandTerms?.settlementTrigger,
            commissionType: brandTerms?.commissionType,
            commissionValue: brandTerms?.commissionValue,
            
            // Metadata
            createdAt: firstSettlement.createdAt,
            updatedAt: new Date(Math.max(...brandSettlements.map(s => new Date(s.updatedAt)))),
          };
        })
      );
    } else {
      // Process individually without grouping
      processedSettlements = await Promise.all(
        allSettlements.map(async (settlement) => {
          const orders = await prisma.order.findMany({
            where: {
              brandId: settlement.brandId,
              createdAt: {
                gte: settlement.periodStart,
                lte: settlement.periodEnd,
              },
              paymentStatus: "COMPLETED",
            },
            include: {
              voucherCodes: {
                include: {
                  redemptions: true,
                },
              },
            },
          });

          const totalSoldAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          const totalSold = orders.length;

          let totalRedeemed = 0;
          let redeemedAmount = 0;
          const uniqueRedeemedVouchers = new Set();

          orders.forEach((order) => {
            order.voucherCodes.forEach((voucherCode) => {
              if (voucherCode.redemptions && voucherCode.redemptions.length > 0) {
                uniqueRedeemedVouchers.add(voucherCode.id);
                
                voucherCode.redemptions.forEach((redemption) => {
                  redeemedAmount += redemption.amountRedeemed;
                });
              }
            });
          });

          totalRedeemed = uniqueRedeemedVouchers.size;

          const outstanding = totalSold - totalRedeemed;
          const outstandingAmount = totalSoldAmount - redeemedAmount;

          let commissionAmount = 0;
          const brandTerms = settlement.brand.brandTerms;
          
          if (brandTerms) {
            const baseAmount = brandTerms.settlementTrigger === "onRedemption" 
              ? redeemedAmount 
              : totalSoldAmount;

            if (brandTerms.commissionType === "Percentage") {
              commissionAmount = Math.round((baseAmount * brandTerms.commissionValue) / 100);
            } else if (brandTerms.commissionType === "Fixed") {
              commissionAmount = Math.round(
                brandTerms.commissionValue * 
                (brandTerms.settlementTrigger === "onRedemption" ? totalRedeemed : totalSold)
              );
            }
          }

          const expiredAmount = await prisma.voucherCode.aggregate({
            where: {
              orderId: { in: orders.map(o => o.id) },
              isRedeemed: false,
              expiresAt: { lte: new Date() },
            },
            _sum: { originalValue: true },
          });

          const breakageAmount = expiredAmount._sum.originalValue || 0;
          const adjustedBreakage = brandTerms?.breakageShare 
            ? Math.round((breakageAmount * brandTerms.breakageShare) / 100)
            : 0;

          const vatAmount = brandTerms?.vatRate 
            ? Math.round((commissionAmount * brandTerms.vatRate) / 100)
            : 0;

          const netPayable = redeemedAmount - commissionAmount - adjustedBreakage + vatAmount;
          const remainingAmount = settlement.status === "Paid" ? 0 : netPayable;

          return {
            id: settlement.id,
            settlementIds: [settlement.id],
            brandId: settlement.brandId,
            brandName: settlement.brand.brandName,
            settlementPeriod: `${new Date(settlement.periodStart).toLocaleDateString()} - ${new Date(settlement.periodEnd).toLocaleDateString()}`,
            periodStart: settlement.periodStart,
            periodEnd: settlement.periodEnd,
            recordCount: 1,
            
            totalSold,
            totalSoldAmount,
            totalRedeemed,
            redeemedAmount,
            outstanding,
            outstandingAmount,
            
            commissionAmount,
            breakageAmount: adjustedBreakage,
            vatAmount,
            netPayable,
            remainingAmount,
            
            status: settlement.status,
            paidAt: settlement.paidAt,
            lastPaymentDate: settlement.paidAt,
            paymentReference: settlement.paymentReference,
            notes: settlement.notes,
            
            settlementTrigger: brandTerms?.settlementTrigger,
            commissionType: brandTerms?.commissionType,
            commissionValue: brandTerms?.commissionValue,
            
            createdAt: settlement.createdAt,
            updatedAt: settlement.updatedAt,
          };
        })
      );
    }

    // Apply pagination after processing
    const totalCount = processedSettlements.length;
    const paginatedSettlements = processedSettlements.slice(skip, skip + limitNum);
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      success: true,
      data: paginatedSettlements,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
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

export async function getSettlementDetailsByBrandId(brandId) {
  try {
    // Execute all queries in parallel for better performance
    const [settlementData, vouchersData, orderAggregation, deliveryGroups] = 
      await Promise.all([
        // Get settlement with all brand details
        prisma.settlements.findFirst({
          where: { brandId },
          orderBy: { createdAt: "desc" },
          include: {
            brand: {
              include: {
                brandTerms: true,
                brandBankings: true,
                brandContacts: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    email: true,
                    phone: true,
                    isPrimary: true,
                  },
                },
              },
            },
          },
        }),

        // Get vouchers with codes and redemptions
        prisma.vouchers.findMany({
          where: { brandId },
          include: {
            denominations: true,
            voucherCodes: {
              include: {
                redemptions: {
                  select: {
                    amountRedeemed: true,
                  },
                },
              },
            },
          },
        }),

        // Get order total
        prisma.order.aggregate({
          where: { brandId },
          _sum: {
            totalAmount: true,
          },
        }),

        // Get delivery log counts by status
        prisma.deliveryLog.groupBy({
          by: ['status'],
          where: {
            order: { brandId },
          },
          _count: true,
        }),
      ]);

    // Check if settlement exists
    if (!settlementData) {
      return {
        success: false,
        message: "Settlement not found",
        status: 404,
      };
    }

    // Build voucher breakdown with denomination details
    const voucherBreakdown = vouchersData.map(voucher => {
      // Calculate denomination-level statistics
      const denominationBreakdown = voucher.denominations.map(denomination => {
        // Find codes matching this denomination value
        const matchingCodes = voucher.voucherCodes.filter(
          code => Number(code.originalValue) === Number(denomination.value)
        );
        
        const issuedCount = matchingCodes.length;
        // Count as redeemed if the code has any redemptions (not just isRedeemed flag)
        const redeemedCount = matchingCodes.filter(
          code => code.redemptions && code.redemptions.length > 0
        ).length;

        return {
          id: denomination.id,
          value: Number(denomination.value),
          currency: denomination.currency,
          issued: issuedCount,
          redeemed: redeemedCount,
          unredeemed: issuedCount - redeemedCount,
          percentage: issuedCount > 0 
            ? ((redeemedCount / issuedCount) * 100).toFixed(2) 
            : "0.00",
          expiresAt: denomination.expiresAt,
          isActive: denomination.isActive,
        };
      });

      // Calculate voucher-level statistics
      const voucherIssuedTotal = voucher.voucherCodes.length;
      // Count codes that have actual redemptions, not just the isRedeemed flag
      const voucherRedeemedTotal = voucher.voucherCodes.filter(
        code => code.redemptions && code.redemptions.length > 0
      ).length;
      
      // Sum up all redemption amounts
      const voucherRedeemedAmount = voucher.voucherCodes.reduce((total, code) => {
        if (code.redemptions && code.redemptions.length > 0) {
          const codeRedemptionSum = code.redemptions.reduce(
            (sum, redemption) => sum + Number(redemption.amountRedeemed || 0), 
            0
          );
          return total + codeRedemptionSum;
        }
        return total;
      }, 0);

        const orderTotal = Number(orderAggregation._sum.totalAmount) || 0;
      console.log("orderTotal",orderTotal);
      

      return {
        id: voucher.id,
        denominationType: voucher.denominationType,
        totalIssued: voucherIssuedTotal,
        totalRedeemed: voucherRedeemedTotal,
        totalUnredeemed: voucherIssuedTotal - voucherRedeemedTotal,
        redemptionRate: voucherIssuedTotal > 0 
          ? ((voucherRedeemedAmount / orderTotal) * 100).toFixed(2)
          : "0.00",
        totalRedeemedAmount: voucherRedeemedAmount,
        partialRedemption: voucher.partialRedemption,
        stackable: voucher.stackable,
        isActive: voucher.isActive,
        expiresAt: voucher.expiresAt,
        denominationBreakdown,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      };
    });

    // Calculate overall summary statistics
    const summaryTotalIssued = voucherBreakdown.reduce(
      (sum, v) => sum + v.totalIssued, 
      0
    );
    const summaryTotalRedeemed = voucherBreakdown.reduce(
      (sum, v) => sum + v.totalRedeemed, 
      0
    );
    const summaryTotalUnredeemed = summaryTotalIssued - summaryTotalRedeemed;
    const summaryRedeemedAmount = voucherBreakdown.reduce(
      (sum, v) => sum + v.totalRedeemedAmount, 
      0
    );

    // Build delivery summary from grouped data
    const deliverySummary = {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      bounced: 0,
    };

    deliveryGroups.forEach(group => {
      const count = group._count;
      deliverySummary.total += count;
      
      const statusKey = group.status?.toLowerCase();
      if (statusKey && statusKey in deliverySummary) {
        deliverySummary[statusKey] = count;
      }
    });

    // Calculate financial amounts with fallbacks
    const orderTotal = Number(orderAggregation._sum.totalAmount) || 0;
    const soldAmount = Number(settlementData.totalSoldAmount) || orderTotal;
    const redeemedAmount = Number(settlementData.redeemedAmount) || summaryRedeemedAmount;
    const outstandingAmount = Number(settlementData.outstandingAmount) || (soldAmount - redeemedAmount);
    
    const commissionAmount = Number(settlementData.commissionAmount) || 0;
    const breakageAmount = Number(settlementData.breakageAmount) || 0;
    const vatAmount = Number(settlementData.vatAmount) || 0;
    const netPayableAmount = Number(settlementData.netPayable) || 
      (redeemedAmount - commissionAmount - vatAmount);

      console.log("-----------",{
          totalOrderAmount: orderTotal,
          totalVouchersIssued: summaryTotalIssued,
          totalVouchersRedeemed: summaryTotalRedeemed,
          totalVouchersUnredeemed: summaryTotalUnredeemed,
          totalRedeemedAmount: summaryRedeemedAmount,
          voucherRedemptionRate: summaryTotalIssued > 0
            ? ((summaryRedeemedAmount / orderTotal) * 100).toFixed(2)
            : "0.00",
          deliverySummary,
        });
      

    // Return complete settlement details
    return {
      success: true,
      data: {
        settlement: {
          id: settlementData.id,
          brandId: settlementData.brandId,
          settlementPeriod: `${new Date(settlementData.periodStart).toLocaleDateString()} - ${new Date(settlementData.periodEnd).toLocaleDateString()}`,
          periodStart: settlementData.periodStart,
          periodEnd: settlementData.periodEnd,
          totalSold: soldAmount,
          totalRedeemed: redeemedAmount,
          outstanding: outstandingAmount,
          commissionAmount,
          breakageAmount,
          vatAmount,
          netPayable: netPayableAmount,
          status: settlementData.status,
          paidAt: settlementData.paidAt,
          paymentReference: settlementData.paymentReference,
          notes: settlementData.notes,
        },
        brand: {
          id: settlementData.brand.id,
          brandName: settlementData.brand.brandName,
          logo: settlementData.brand.logo,
          currency: settlementData.brand.currency,
          domain: settlementData.brand.domain,
          website: settlementData.brand.website,
          contact: settlementData.brand.contact,
          description: settlementData.brand.description,
          categoryName: settlementData.brand.categoryName,
          isActive: settlementData.brand.isActive,
          isPrimary: settlementData.brand.isPrimary,
          isFeature: settlementData.brand.isFeature,
        },
        brandTerms: settlementData.brand.brandTerms ? {
          settlementTrigger: settlementData.brand.brandTerms.settlementTrigger,
          commissionType: settlementData.brand.brandTerms.commissionType,
          commissionValue: settlementData.brand.brandTerms.commissionValue,
          maxDiscount: settlementData.brand.brandTerms.maxDiscount,
          minOrderValue: settlementData.brand.brandTerms.minOrderValue,
          breakagePolicy: settlementData.brand.brandTerms.breakagePolicy,
          breakageShare: settlementData.brand.brandTerms.breakageShare,
          contractStart: settlementData.brand.brandTerms.contractStart,
          contractEnd: settlementData.brand.brandTerms.contractEnd,
          vatRate: settlementData.brand.brandTerms.vatRate,
        } : null,
        brandBanking: settlementData.brand.brandBankings ? {
          settlementFrequency: settlementData.brand.brandBankings.settlementFrequency,
          payoutMethod: settlementData.brand.brandBankings.payoutMethod,
          accountHolder: settlementData.brand.brandBankings.accountHolder,
          accountNumber: settlementData.brand.brandBankings.accountNumber,
          bankName: settlementData.brand.brandBankings.bankName,
          branchCode: settlementData.brand.brandBankings.branchCode,
          country: settlementData.brand.brandBankings.country,
          accountVerification: settlementData.brand.brandBankings.accountVerification,
        } : null,
        brandContacts: settlementData.brand.brandContacts,
        voucherBreakdown,
        summary: {
          totalOrderAmount: orderTotal,
          totalVouchersIssued: summaryTotalIssued,
          totalVouchersRedeemed: summaryTotalRedeemed,
          totalVouchersUnredeemed: summaryTotalUnredeemed,
          totalRedeemedAmount: summaryRedeemedAmount,
           voucherRedemptionRate: summaryTotalIssued > 0
            ? ((summaryRedeemedAmount / orderTotal) * 100).toFixed(2)
            : "0.00",
          deliverySummary,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching settlement details:", error);
    return {
      success: false,
      message: "Failed to fetch settlement details",
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}
