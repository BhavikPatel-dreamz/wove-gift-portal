"use server";

import { prisma } from "../db";
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
    denominationType: z.enum(["fixed", "amount", "both"]).default("both"),
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
        console.log("voucherData",voucherData);
        

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

    // Retrieve brand details including logo
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { 
        id: true, 
        logo: true 
      }
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
            select: { id: true }
          }),
          tx.order.findMany({
            where: { brandId },
            select: { id: true }
          }),
          tx.integration.findMany({
            where: { brandId },
            select: { id: true }
          })
        ]);

        const voucherIds = vouchers.map(v => v.id);
        const orderIds = orders.map(o => o.id);
        const integrationIds = integrations.map(i => i.id);

        // Step 2: Get voucher code IDs if there are vouchers
        let voucherCodeIds = [];
        if (voucherIds.length > 0) {
          const voucherCodes = await tx.voucherCode.findMany({
            where: { voucherId: { in: voucherIds } },
            select: { id: true }
          });
          voucherCodeIds = voucherCodes.map(vc => vc.id);
        }

        // Step 3: Delete in correct order (deepest children first)
        const deletePromises = [];

        // Delete voucher redemptions
        if (voucherCodeIds.length > 0) {
          deletePromises.push(
            tx.voucherRedemption.deleteMany({
              where: { voucherCodeId: { in: voucherCodeIds } }
            })
          );
        }

        // Delete delivery logs
        if (orderIds.length > 0 || voucherCodeIds.length > 0) {
          const deliveryLogWhere = {
            OR: []
          };
          if (orderIds.length > 0) {
            deliveryLogWhere.OR.push({ orderId: { in: orderIds } });
          }
          if (voucherCodeIds.length > 0) {
            deliveryLogWhere.OR.push({ voucherCodeId: { in: voucherCodeIds } });
          }
          
          deletePromises.push(
            tx.deliveryLog.deleteMany({ where: deliveryLogWhere })
          );
        }

        // Delete integration sync logs
        if (integrationIds.length > 0) {
          deletePromises.push(
            tx.integrationSyncLog.deleteMany({
              where: { integrationId: { in: integrationIds } }
            })
          );
        }

        // Execute all parallel deletions
        await Promise.all(deletePromises);

        // Step 4: Delete voucher codes
        if (voucherCodeIds.length > 0) {
          await tx.voucherCode.deleteMany({
            where: { id: { in: voucherCodeIds } }
          });
        }

        // Step 5: Delete orders (must be before brand deletion)
        if (orderIds.length > 0) {
          await tx.order.deleteMany({
            where: { id: { in: orderIds } }
          });
        }

        // Step 6: Delete denominations and vouchers
        if (voucherIds.length > 0) {
          await Promise.all([
            tx.denomination.deleteMany({
              where: { voucherId: { in: voucherIds } }
            }),
            tx.vouchers.deleteMany({
              where: { id: { in: voucherIds } }
            })
          ]);
        }

        // Step 7: Delete integrations
        if (integrationIds.length > 0) {
          await tx.integration.deleteMany({
            where: { id: { in: integrationIds } }
          });
        }

        // Step 8: Delete all other brand-related data in parallel
        await Promise.all([
          tx.settlements.deleteMany({ where: { brandId } }),
          tx.brandContacts.deleteMany({ where: { brandId } }),
          tx.brandTerms.deleteMany({ where: { brandId } }),
          tx.brandBanking.deleteMany({ where: { brandId } })
        ]);

        // Step 9: Finally delete the brand
        await tx.brand.delete({
          where: { id: brandId }
        });
      },
      {
        maxWait: 15000, // 15 seconds max wait to connect
        timeout: 30000, // 30 seconds timeout for the transaction
      }
    );

    // Delete the logo file from the filesystem
    if (existingBrand.logo) {
      const logoPath = join(process.cwd(), "public", existingBrand.logo);
      try {
        await unlink(logoPath);
      } catch (error) {
        console.warn(`Could not delete logo file: ${logoPath}`, error.message);
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
        message: "Cannot delete brand due to foreign key constraints. Some related data may still exist.",
        status: 400,
      };
    }

    return {
      success: false,
      message: "An internal server error occurred while deleting the brand partner.",
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
      groupByBrand = false, // Changed default to false
      frequency = "",
      shopId = null,
      groupByFrequency = false, // Changed default to false
      filterMonth = null,
      filterYear = null,
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};
    const brandWhereClause = {};

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

    // Fetch settlements with optimized query
    const [allSettlements] = await Promise.all([
      prisma.settlements.findMany({
        where: whereClause,
        orderBy,
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
              logo: true,
              currency: true,
              brandTerms: true,
              brandBankings: true,
            },
          },
        },
      }),
      prisma.settlements.count({ where: whereClause }),
    ]);

    let processedSettlements;

    // Process settlements based on grouping options
    if (groupByFrequency && groupByBrand) {
      processedSettlements = await groupSettlementsByBrandAndFrequency(
        allSettlements
      );
    } else if (groupByBrand) {
      processedSettlements = await groupSettlementsByBrand(allSettlements);
    } else {
      // Process individual settlements (default behavior)
      processedSettlements = await processIndividualSettlements(allSettlements);
    }

    // Apply status filter after processing
    if (status) {
      processedSettlements = processedSettlements.filter(
        (settlement) => settlement.status === status
      );
    }

    // Apply pagination
    const paginatedSettlements = processedSettlements.slice(
      skip,
      skip + limitNum
    );
    const totalPages = Math.ceil(processedSettlements.length / limitNum);

    // Calculate summary
    const summary = calculateSummaryFromProcessed(processedSettlements);

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
        totalItems: processedSettlements.length,
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

export async function getSettlementTabData(brandId,tab){
  try {
    const res = await getSettlements(brandId,tab);
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

// ==================== CALCULATE SUMMARY ====================
function calculateSummaryFromProcessed(processedSettlements) {
  return {
    totalSettlements: processedSettlements.length,
    totalPayable: processedSettlements.reduce(
      (sum, s) => sum + (s.netPayable || 0),
      0
    ),
    totalPaid: processedSettlements.reduce(
      (sum, s) => sum + (s.totalPaid || 0),
      0
    ),
    totalRemaining: processedSettlements.reduce(
      (sum, s) => sum + (s.remainingAmount || 0),
      0
    ),
    pendingCount: processedSettlements.filter((s) => s.status === "Pending")
      .length,
    paidCount: processedSettlements.filter((s) => s.status === "Paid").length,
    inReviewCount: processedSettlements.filter((s) => s.status === "InReview")
      .length,
    disputedCount: processedSettlements.filter((s) => s.status === "Disputed")
      .length,
    partiallyPaidCount: processedSettlements.filter(
      (s) => s.status === "PartiallyPaid"
    ).length,
  };
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

// ==================== PROCESS INDIVIDUAL SETTLEMENTS (OPTIMIZED) ====================
async function processIndividualSettlements(allSettlements) {
  if (allSettlements.length === 0) return [];

  // Collect all brand IDs and date ranges
  const brandIds = [...new Set(allSettlements.map((s) => s.brandId))];
  // const periodRanges = allSettlements.map((s) => ({
  //   brandId: s.brandId,
  //   start: s.periodStart,
  //   end: s.periodEnd,
  // }));

  // Batch fetch all orders for all brands
  const allOrders = await prisma.order.findMany({
    where: {
      brandId: { in: brandIds },
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

  // Group orders by brand for quick lookup
  const ordersByBrand = allOrders.reduce((acc, order) => {
    if (!acc[order.brandId]) acc[order.brandId] = [];
    acc[order.brandId].push(order);
    return acc;
  }, {});

  // Batch fetch expired vouchers
  const allOrderIds = allOrders.map((o) => o.id);
  const expiredVouchers = await prisma.voucherCode.groupBy({
    by: ["orderId"],
    where: {
      orderId: { in: allOrderIds },
      isRedeemed: false,
      expiresAt: { lte: new Date() },
    },
    _sum: { originalValue: true },
  });

  const expiredByOrder = expiredVouchers.reduce((acc, item) => {
    acc[item.orderId] = item._sum.originalValue || 0;
    return acc;
  }, {});

  // Process each settlement
  return allSettlements.map((settlement) => {
    // Filter orders for this specific settlement period
    const periodOrders = (ordersByBrand[settlement.brandId] || []).filter(
      (order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate >= settlement.periodStart &&
          orderDate <= settlement.periodEnd
        );
      }
    );

    // Calculate metrics
    const metrics = calculateSettlementMetrics(
      periodOrders,
      [settlement],
      expiredByOrder,
      settlement.brand.brandTerms
    );

    return {
      id: settlement.id, // Single ID
      brandId: settlement.brandId,
      brandName: settlement.brand.brandName,
      brandLogo: settlement.brand.logo,
      settlementPeriod: `${new Date(
        settlement.periodStart
      ).toLocaleDateString()} - ${new Date(
        settlement.periodEnd
      ).toLocaleDateString()}`,
      periodStart: settlement.periodStart,
      periodEnd: settlement.periodEnd,
      ...metrics,
      settlementFrequency: settlement.brand.brandBankings?.settlementFrequency,
      bankingInfo: settlement.brand.brandBankings
        ? {
            accountHolder: settlement.brand.brandBankings.accountHolder,
            accountNumber: settlement.brand.brandBankings.accountNumber,
            bankName: settlement.brand.brandBankings.bankName,
            branchCode: settlement.brand.brandBankings.branchCode,
            payoutMethod: settlement.brand.brandBankings.payoutMethod,
          }
        : null,
      currency: settlement.brand.currency || null,
      createdAt: settlement.createdAt,
      updatedAt: settlement.updatedAt,
    };
  });
}

// ==================== CALCULATE SETTLEMENT METRICS (FIXED) ====================
function calculateSettlementMetrics(
  orders,
  settlements,
  expiredByOrder,
  brandTerms
) {
  const totalSoldAmount = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
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
        (baseAmount * (brandTerms.commissionValue || 0)) / 100
      );
    } else if (brandTerms.commissionType === "Fixed") {
      // For fixed commission, multiply by number of transactions
      const transactionCount =
        brandTerms.settlementTrigger === "onRedemption"
          ? totalRedeemed
          : totalSold;
      commissionAmount = Math.round(
        (brandTerms.commissionValue || 0) * transactionCount
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
    baseAmount - commissionAmount - adjustedBreakage + vatAmount
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
    payments.reduce((sum, p) => sum + (p.amount || 0), 0)
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
        "0"
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
  const brandFrequencyGroups = {};

  allSettlements.forEach((settlement) => {
    const frequency =
      settlement.brand.brandBankings?.settlementFrequency || "monthly";
    const periodKey = getFrequencyPeriodKey(settlement.periodStart, frequency);
    const groupKey = `${settlement.brandId}_${frequency}_${periodKey}`;

    if (!brandFrequencyGroups[groupKey]) {
      brandFrequencyGroups[groupKey] = {
        brandId: settlement.brandId,
        frequency,
        periodKey,
        settlements: [],
      };
    }
    brandFrequencyGroups[groupKey].settlements.push(settlement);
  });

  const brandIds = [...new Set(allSettlements.map((s) => s.brandId))];

  const allOrders = await prisma.order.findMany({
    where: { brandId: { in: brandIds } },
    select: {
      id: true,
      brandId: true,
      createdAt: true,
      totalAmount: true,
      voucherCodes: {
        select: {
          id: true,
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

  const ordersByBrand = allOrders.reduce((acc, order) => {
    if (!acc[order.brandId]) acc[order.brandId] = [];
    acc[order.brandId].push(order);
    return acc;
  }, {});

  const allOrderIds = allOrders.map((o) => o.id);
  const expiredVouchers = await prisma.voucherCode.groupBy({
    by: ["orderId"],
    where: {
      orderId: { in: allOrderIds },
      isRedeemed: false,
      expiresAt: { lte: new Date() },
    },
    _sum: { originalValue: true },
  });

  const expiredByOrder = expiredVouchers.reduce((acc, item) => {
    acc[item.orderId] = item._sum.originalValue || 0;
    return acc;
  }, {});

  const processedSettlements = Object.values(brandFrequencyGroups).map(
    (group) => {
      const {
        brandId,
        frequency,
        periodKey,
        settlements: groupSettlements,
      } = group;
      const firstSettlement = groupSettlements[0];
      const allIds = groupSettlements.map((s) => s.id);

      const periodStart = new Date(
        Math.min(...groupSettlements.map((s) => new Date(s.periodStart)))
      );
      const periodEnd = new Date(
        Math.max(...groupSettlements.map((s) => new Date(s.periodEnd)))
      );

      const brandOrders = (ordersByBrand[brandId] || []).filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate <= periodEnd;
      });

      const metrics = calculateSettlementMetrics(
        brandOrders,
        groupSettlements,
        expiredByOrder,
        firstSettlement.brand.brandTerms
      );

      return {
        id: allIds.join(","), // Multiple IDs when grouped
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
        settlementFrequency:
          firstSettlement.brand.brandBankings?.settlementFrequency,
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
        updatedAt: new Date(
          Math.max(...groupSettlements.map((s) => new Date(s.updatedAt)))
        ),
      };
    }
  );

  return processedSettlements.sort((a, b) => b.periodStart - a.periodStart);
}

async function groupSettlementsByBrand(allSettlements) {
  const brandGroups = allSettlements.reduce((acc, settlement) => {
    if (!acc[settlement.brandId]) acc[settlement.brandId] = [];
    acc[settlement.brandId].push(settlement);
    return acc;
  }, {});

  const brandIds = Object.keys(brandGroups);

  const allOrders = await prisma.order.findMany({
    where: { brandId: { in: brandIds } },
    select: {
      id: true,
      brandId: true,
      createdAt: true,
      totalAmount: true,
      voucherCodes: {
        select: {
          id: true,
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

  const ordersByBrand = allOrders.reduce((acc, order) => {
    if (!acc[order.brandId]) acc[order.brandId] = [];
    acc[order.brandId].push(order);
    return acc;
  }, {});

  const allOrderIds = allOrders.map((o) => o.id);
  const expiredVouchers = await prisma.voucherCode.groupBy({
    by: ["orderId"],
    where: {
      orderId: { in: allOrderIds },
      isRedeemed: false,
      expiresAt: { lte: new Date() },
    },
    _sum: { originalValue: true },
  });

  const expiredByOrder = expiredVouchers.reduce((acc, item) => {
    acc[item.orderId] = item._sum.originalValue || 0;
    return acc;
  }, {});

  return Object.values(brandGroups).map((brandSettlements) => {
    const firstSettlement = brandSettlements[0];
    const allIds = brandSettlements.map((s) => s.id);

    const periodStart = new Date(
      Math.min(...brandSettlements.map((s) => new Date(s.periodStart)))
    );
    const periodEnd = new Date(
      Math.max(...brandSettlements.map((s) => new Date(s.periodEnd)))
    );

    const brandOrders = (ordersByBrand[firstSettlement.brandId] || []).filter(
      (order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate <= periodEnd;
      }
    );

    const metrics = calculateSettlementMetrics(
      brandOrders,
      brandSettlements,
      expiredByOrder,
      firstSettlement.brand.brandTerms
    );

    return {
      id: allIds.join(","), // Multiple IDs when grouped
      settlementIds: allIds,
      brandId: firstSettlement.brandId,
      brandName: firstSettlement.brand.brandName,
      brandLogo: firstSettlement.brand.logo,
      settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      periodStart,
      periodEnd,
      recordCount: brandSettlements.length,
      ...metrics,
      settlementFrequency:
        firstSettlement.brand.brandBankings?.settlementFrequency,
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
      updatedAt: new Date(
        Math.max(...brandSettlements.map((s) => new Date(s.updatedAt)))
      ),
    };
  });
}

export async function getSettlementOverview(brandId) {
  try {
    const settlementData = await prisma.settlements.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
      },
    });

    if (!settlementData) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    // Get basic order metrics for the period
    const orders = await prisma.order.findMany({
      where: {
        brandId,
        createdAt: {
          gte: settlementData.periodStart,
          lte: settlementData.periodEnd,
        },
      },
      include: {
        voucherCodes: {
          include: {
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

    // Calculate metrics
    const totalSoldAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalSold = orders.length;

    let totalRedeemed = 0;
    let redeemedAmount = 0;
    let lastRedemptionDate = null;
    const uniqueRedeemedVouchers = new Set();

    orders.forEach((order) => {
      order.voucherCodes.forEach((voucherCode) => {
        if (voucherCode.redemptions?.length > 0) {
          uniqueRedeemedVouchers.add(voucherCode.id);
          voucherCode.redemptions.forEach((redemption) => {
            redeemedAmount += redemption.amountRedeemed;
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

    // Get delivery summary
    const deliveryGroups = await prisma.deliveryLog.groupBy({
      by: ["status"],
      where: { order: { brandId } },
      _count: true,
    });

    const deliverySummary = {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      bounced: 0,
    };

    deliveryGroups.forEach((group) => {
      const count = group._count;
      deliverySummary.total += count;
      const statusKey = group.status?.toLowerCase();
      if (statusKey && statusKey in deliverySummary) {
        deliverySummary[statusKey] = count;
      }
    });

    // Calculate voucher summary
    const voucherCodes = await prisma.voucherCode.findMany({
      where: { orderId: { in: orders.map((o) => o.id) } },
      include: { redemptions: true },
    });

    const summaryTotalIssued = voucherCodes.length;
    const summaryTotalRedeemed = voucherCodes.filter(
      (code) => code.redemptions?.length > 0
    ).length;

    return {
      success: true,
      data: {
        settlement: {
          ...settlementData,
          totalSold,
          totalSoldAmount,
          totalRedeemed,
          redeemedAmount,
          outstanding,
          outstandingAmount,
          redemptionRate:
            totalSold > 0
              ? ((totalRedeemed / totalSold) * 100).toFixed(2)
              : "0.00",
          lastRedemptionDate,
          settlementPeriod: `${new Date(
            settlementData.periodStart
          ).toLocaleDateString()} - ${new Date(
            settlementData.periodEnd
          ).toLocaleDateString()}`,
        },
        brand: settlementData.brand,
        summary: {
          totalVouchersIssued: summaryTotalIssued,
          totalVouchersRedeemed: summaryTotalRedeemed,
          totalVouchersUnredeemed: summaryTotalIssued - summaryTotalRedeemed,
          totalSoldAmount,
          totalRedeemedAmount: redeemedAmount,
          voucherRedemptionRate:
            totalSoldAmount > 0
              ? ((redeemedAmount / totalSoldAmount) * 100).toFixed(2)
              : "0.00",
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
      0
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
          (baseAmount * brandTerms.commissionValue) / 100
        );
      } else if (brandTerms.commissionType === "Fixed") {
        const transactionCount =
          brandTerms.settlementTrigger === "onRedemption"
            ? totalRedeemed
            : orders.length;
        commissionAmount = Math.round(
          brandTerms.commissionValue * transactionCount
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
    const settlement = await prisma.settlements.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    });

    if (!settlement) {
      return { success: false, message: "Settlement not found", status: 404 };
    }

    const vouchers = await prisma.vouchers.findMany({
      where: { brandId },
      include: {
        denominations: true,
        voucherCodes: {
          include: {
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

    const voucherBreakdown = vouchers.map((voucher) => {
      const denominationBreakdown = voucher.denominations.map(
        (denomination) => {
          const matchingCodes = voucher.voucherCodes.filter(
            (code) => Number(code.originalValue) === Number(denomination.value)
          );

          const issuedCount = matchingCodes.length;
          const redeemedCount = matchingCodes.filter(
            (code) => code.redemptions?.length > 0
          ).length;

          const denominationRedeemedAmount = matchingCodes.reduce(
            (sum, code) => {
              if (code.redemptions?.length > 0) {
                return (
                  sum +
                  code.redemptions.reduce(
                    (rSum, redemption) =>
                      rSum + Number(redemption.amountRedeemed || 0),
                    0
                  )
                );
              }
              return sum;
            },
            0
          );

          return {
            id: denomination.id,
            value: Number(denomination.value),
            currency: denomination.currency,
            issued: issuedCount,
            redeemed: redeemedCount,
            unredeemed: issuedCount - redeemedCount,
            redeemedAmount: denominationRedeemedAmount,
            percentage:
              issuedCount > 0
                ? ((redeemedCount / issuedCount) * 100).toFixed(2)
                : "0.00",
          };
        }
      );

      const voucherIssuedTotal = voucher.voucherCodes.length;
      const voucherRedeemedTotal = voucher.voucherCodes.filter(
        (code) => code.redemptions?.length > 0
      ).length;

      const voucherRedeemedAmount = voucher.voucherCodes.reduce(
        (total, code) => {
          if (code.redemptions?.length > 0) {
            return (
              total +
              code.redemptions.reduce(
                (sum, redemption) =>
                  sum + Number(redemption.amountRedeemed || 0),
                0
              )
            );
          }
          return total;
        },
        0
      );

      const voucherSoldAmount = voucher.voucherCodes.reduce(
        (sum, code) => sum + Number(code.originalValue || 0),
        0
      );

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

    // Get period range
    const periodStart = new Date(
      Math.min(...settlements.map((s) => new Date(s.periodStart)))
    );
    const periodEnd = new Date(
      Math.max(...settlements.map((s) => new Date(s.periodEnd)))
    );

    // Fetch orders for this period
    const orders = await prisma.order.findMany({
      where: {
        brandId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        voucherCodes: {
          include: {
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

    // Fetch expired vouchers
    const expiredVouchers = await prisma.voucherCode.groupBy({
      by: ["orderId"],
      where: {
        orderId: { in: orders.map((o) => o.id) },
        isRedeemed: false,
        expiresAt: { lte: new Date() },
      },
      _sum: { originalValue: true },
    });

    const expiredByOrder = {};
    expiredVouchers.forEach((item) => {
      expiredByOrder[item.orderId] = item._sum.originalValue || 0;
    });

    // Calculate metrics
    const metrics = calculateSettlementMetrics(
      orders,
      settlements,
      expiredByOrder,
      firstSettlement.brand.brandTerms
    );

    // Get voucher details
    const allVouchers = orders.flatMap((o) => o.voucherCodes);
    const issuedVouchers = allVouchers.length;
    const redeemedVouchers = allVouchers.filter(
      (v) => v.redemptions?.length > 0
    ).length;
    const unredeemedVouchers = issuedVouchers - redeemedVouchers;

    // Delivery status (all delivered if vouchers exist)
    const deliveryStatus = issuedVouchers > 0 ? "All Delivered" : "Pending";

    const settlementDetails = {
      id: settlementIds.join(","),
      settlementIds,
      brandId: firstSettlement.brandId,
      brandName: firstSettlement.brand.brandName,
      brandLogo: firstSettlement.brand.logo,

      // Period Info
      periodStart,
      periodEnd,
      settlementPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      frequency:
        firstSettlement.brand.brandBankings?.settlementFrequency || "monthly",

      // Financial Metrics
      totalSold: metrics.totalSold,
      totalSoldAmount: metrics.totalSoldAmount,
      totalRedeemed: metrics.totalRedeemed,
      redeemedAmount: metrics.redeemedAmount,
      outstanding: metrics.outstanding,
      outstandingAmount: metrics.outstandingAmount,
      redemptionRate: metrics.redemptionRate,

      // Financial Breakdown
      baseAmount:
        firstSettlement.brand.brandTerms?.settlementTrigger === "onRedemption"
          ? metrics.redeemedAmount
          : metrics.totalSoldAmount,
      commissionAmount: metrics.commissionAmount,
      commissionType: firstSettlement.brand.brandTerms?.commissionType,
      commissionValue: firstSettlement.brand.brandTerms?.commissionValue,
      breakageAmount: metrics.breakageAmount,
      vatAmount: metrics.vatAmount,
      adjustments: 0, // Can be calculated if needed
      netPayable: metrics.netPayable,

      // Payment Info
      status: metrics.status,
      totalPaid: metrics.totalPaid,
      remainingAmount: metrics.remainingAmount,
      lastPaymentDate: metrics.lastPaymentDate,
      paymentReference:
        settlements.find((s) => s.paymentReference)?.paymentReference || null,
      paymentHistory: metrics.paymentHistory,

      // Voucher Summary
      voucherSummary: {
        totalIssued: issuedVouchers,
        redeemed: redeemedVouchers,
        unredeemed: unredeemedVouchers,
        deliveryStatus,
        redemptionRate: metrics.redemptionRate,
      },

      // Dates
      lastRedemptionDate: metrics.lastRedemptionDate,
      createdAt: firstSettlement.createdAt,
      updatedAt: new Date(
        Math.max(...settlements.map((s) => new Date(s.updatedAt)))
      ),

      // Brand Info
      settlementTrigger: firstSettlement.brand.brandTerms?.settlementTrigger,
      currency: firstSettlement.brand?.currency || "USD",
      bankingInfo: firstSettlement.brand.brandBankings,
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
    // Add validation for settlementId
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

    // Get settlement details first to get the period
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

    // Get period range
    const periodStart = new Date(
      Math.min(...settlements.map((s) => new Date(s.periodStart)))
    );
    const periodEnd = new Date(
      Math.max(...settlements.map((s) => new Date(s.periodEnd)))
    );

    // Build where clause for orders
    const whereClause = {
      brandId,
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

    // Fetch orders with voucher codes and receiver details
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
      prisma.order.count({ where: whereClause }),
    ]);

    // Fetch ALL orders for statistics (without pagination)
    const allOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        voucherCodes: {
          include: {
            redemptions: {
              select: {
                id: true,
                amountRedeemed: true,
                redeemedAt: true,
                transactionId: true,
              },
            },
          },
        },
      },
    });

    // Calculate voucher statistics
    let totalIssued = 0;
    let totalRedeemed = 0;
    let totalUnredeemed = 0;
    const denominationMap = new Map();

    allOrders.forEach((order) => {
      order.voucherCodes.forEach((voucher) => {
        totalIssued++;
        const isFullyRedeemed = voucher.isRedeemed || voucher.remainingValue === 0;
        
        if (isFullyRedeemed) {
          totalRedeemed++;
        } else {
          totalUnredeemed++;
        }

        // Track by denomination (use originalValue as the denomination)
        const denomination = voucher.originalValue || 0;
        if (!denominationMap.has(denomination)) {
          denominationMap.set(denomination, {
            value: denomination,
            issued: 0,
            redeemed: 0,
            unredeemed: 0,
            expiresAt: voucher.expiresAt,
            voucherCodes: [], // Store individual voucher codes
          });
        }

        const denom = denominationMap.get(denomination);
        denom.issued++;
        if (isFullyRedeemed) {
          denom.redeemed++;
        } else {
          denom.unredeemed++;
        }

        // Add voucher code details
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
          totalRedeemedAmount: voucher.redemptions?.reduce(
            (sum, r) => sum + (r.amountRedeemed || 0),
            0
          ) || 0,
        });
      });
    });

    // Calculate redemption rate
    const redemptionRate = totalIssued > 0 
      ? ((totalRedeemed / totalIssued) * 100).toFixed(2)
      : "0.00";

    // Convert denomination map to array and calculate rates
    const denominationBreakdown = Array.from(denominationMap.values())
      .map((denom) => ({
        value: denom.value,
        issued: denom.issued,
        redeemed: denom.redeemed,
        unredeemed: denom.unredeemed,
        rate: denom.issued > 0 
          ? ((denom.redeemed / denom.issued) * 100).toFixed(2)
          : "0.00",
        expires: denom.expiresAt,
        // Additional calculated fields
        totalIssuedValue: denom.value * denom.issued,
        totalRedeemedValue: denom.value * denom.redeemed,
        totalUnredeemedValue: denom.value * denom.unredeemed,
        percentageOfTotal: totalIssued > 0 
          ? ((denom.issued / totalIssued) * 100).toFixed(1)
          : "0.0",
        // Individual voucher codes for this denomination
        voucherCodes: denom.voucherCodes,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    // Process orders into voucher data (existing logic)
    const voucherData = orders.map((order) => {
      const totalVouchers = order.voucherCodes.length;
      const redeemedVouchers = order.voucherCodes.filter(
        (v) => v.isRedeemed || v.remainingValue === 0
      ).length;
      // const pendingVouchers = totalVouchers - redeemedVouchers;

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
            (baseAmount * (brandTerms.commissionValue || 0)) / 100
          );
        } else if (brandTerms.commissionType === "Fixed") {
          const transactionCount =
            brandTerms.settlementTrigger === "onRedemption"
              ? redeemedVouchers
              : totalVouchers;
          commissionAmount = Math.round(
            (brandTerms.commissionValue || 0) * transactionCount
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
      if (redeemedVouchers === totalVouchers && totalVouchers > 0) {
        status = "Paid";
      } else if (redeemedVouchers > 0) {
        status = "Partial";
      }

      const isExpired = order.voucherCodes.some(
        (v) =>
          v.expiresAt && new Date(v.expiresAt) < new Date() && !v.isRedeemed && v.remainingValue > 0
      );

      if (isExpired && redeemedVouchers === 0) {
        status = "Disputed";
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
        periodRange: `${new Date(
          order.createdAt
        ).toLocaleDateString()} - ${new Date(
          order.createdAt
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

    // Filter by status if provided
    let filteredData = voucherData;
    if (status) {
      filteredData = voucherData.filter((v) => v.status === status);
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    // Calculate summary statistics
    const summary = {
      totalPayable: filteredData.reduce((sum, v) => sum + v.baseAmount, 0),
      totalPaid: filteredData.reduce((sum, v) => sum + v.redeemedAmount, 0),
      totalRemaining: filteredData.reduce((sum, v) => sum + v.outstanding, 0),
      totalCommission: filteredData.reduce(
        (sum, v) => sum + v.commissionAmount,
        0
      ),
      totalVat: filteredData.reduce((sum, v) => sum + v.vatAmount, 0),
      totalNetPayable: filteredData.reduce((sum, v) => sum + v.netPayable, 0),
      successRate:
        filteredData.length > 0
          ? (
              (filteredData.filter((v) => v.status === "Paid").length /
                filteredData.length) *
              100
            ).toFixed(1)
          : "0.0",
      totalOrders: filteredData.length,
      paidCount: filteredData.filter((v) => v.status === "Paid").length,
      pendingCount: filteredData.filter((v) => v.status === "Pending").length,
      partialCount: filteredData.filter((v) => v.status === "Partial").length,
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
      // Voucher statistics with individual voucher codes
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

    // === OPTIMIZATION 1: Use select to fetch only needed fields ===
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        brandName: true,
        logo: true,
        currency: true,
        brandTerms: {
          select: {
            settlementTrigger: true,
            commissionType: true,
            commissionValue: true,
            breakageShare: true,
            vatRate: true,
          },
        },
        brandBankings: {
          select: {
            settlementFrequency: true,
            accountHolder: true,
            accountNumber: true,
            bankName: true,
            branchCode: true,
            payoutMethod: true,
          },
        },
      },
    });

    if (!brand) {
      return {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    }

    // === OPTIMIZATION 2: Build efficient date filter ===
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

    // === OPTIMIZATION 3: Fetch settlements with pagination FIRST ===
    // Only get the data we need for the current page
    const [allSettlements] = await Promise.all([
      prisma.settlements.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          status: true,
          paidAt: true,
          paymentReference: true,
          notes: true,
          netPayable: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.settlements.count({ where: whereClause }),
    ]);

    if (allSettlements.length === 0) {
      return {
        success: true,
        data: [],
        brandInfo: formatBrandInfo(brand),
        pagination: createEmptyPagination(pageNum, limitNum),
        summary: createEmptySummary(),
      };
    }

    // === OPTIMIZATION 4: Use Map for O(1) lookups instead of filter ===
    // const settlementMap = new Map(allSettlements.map((s) => [s.id, s]));

    // Get date range for all settlements
    const minDate = new Date(
      Math.min(...allSettlements.map((s) => s.periodStart.getTime()))
    );
    const maxDate = new Date(
      Math.max(...allSettlements.map((s) => s.periodEnd.getTime()))
    );

    // === OPTIMIZATION 5: Fetch orders with indexed query ===
    const orderWhereClause = {
      brandId: brandId,
      createdAt: {
        gte: minDate,
        lte: maxDate,
      },
    };

    // Fetch orders with only necessary fields
    const allOrders = await prisma.order.findMany({
      where: orderWhereClause,
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        voucherCodes: {
          select: {
            id: true,
            isRedeemed: true,
            originalValue: true,
            expiresAt: true,
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

    // === OPTIMIZATION 6: Pre-calculate expired vouchers using Map ===
    const now = new Date();
    const expiredByOrder = new Map();

    allOrders.forEach((order) => {
      let expiredAmount = 0;
      order.voucherCodes?.forEach((voucher) => {
        if (
          !voucher.isRedeemed &&
          voucher.expiresAt &&
          voucher.expiresAt <= now
        ) {
          expiredAmount += voucher.originalValue || 0;
        }
      });
      if (expiredAmount > 0) {
        expiredByOrder.set(order.id, expiredAmount);
      }
    });

    // === OPTIMIZATION 7: Group orders by settlement period using binary search ===
    // Sort orders by date for efficient searching
    const sortedOrders = allOrders.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    // Create settlement-to-orders mapping
    const settlementOrders = new Map();

    allSettlements.forEach((settlement) => {
      const periodOrders = sortedOrders.filter((order) => {
        const orderTime = order.createdAt.getTime();
        return (
          orderTime >= settlement.periodStart.getTime() &&
          orderTime <= settlement.periodEnd.getTime()
        );
      });
      settlementOrders.set(settlement.id, periodOrders);
    });

    // === OPTIMIZATION 8: Process settlements in parallel batches ===
    const BATCH_SIZE = 10;
    const processedSettlements = [];

    for (let i = 0; i < allSettlements.length; i += BATCH_SIZE) {
      const batch = allSettlements.slice(i, i + BATCH_SIZE);

      const batchResults = batch.map((settlement) => {
        const periodOrders = settlementOrders.get(settlement.id) || [];

        const metrics = calculateSettlementMetricsOptimized(
          periodOrders,
          settlement,
          expiredByOrder,
          brand.brandTerms
        );

        return {
          id: settlement.id,
          settlementPeriod: `${formatDateShort(
            settlement.periodStart
          )} - ${formatDateShort(settlement.periodEnd)}`,
          periodStart: settlement.periodStart,
          periodEnd: settlement.periodEnd,
          ...metrics,
          createdAt: settlement.createdAt,
          updatedAt: settlement.updatedAt,
        };
      });

      processedSettlements.push(...batchResults);
    }

    // === OPTIMIZATION 9: Filter by status using Set for O(1) lookup ===
    let filteredSettlements = processedSettlements;
    if (status) {
      filteredSettlements = processedSettlements.filter(
        (s) => s.status === status
      );
    }

    // Calculate summary efficiently
    const summary = calculateSummaryOptimized(filteredSettlements);

    // Apply pagination
    const paginatedSettlements = filteredSettlements.slice(
      skip,
      skip + limitNum
    );
    const totalPages = Math.ceil(filteredSettlements.length / limitNum);

    return {
      success: true,
      data: paginatedSettlements,
      brandInfo: formatBrandInfo(brand),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: filteredSettlements.length,
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

// ==================== OPTIMIZED HELPER FUNCTIONS ====================

function calculateSettlementMetricsOptimized(
  orders,
  settlement,
  expiredByOrder,
  brandTerms
) {
  // Use reduce for single-pass calculation
  const { totalSoldAmount, totalSold, redemptionData } = orders.reduce(
    (acc, order) => {
      acc.totalSoldAmount += order.totalAmount || 0;
      acc.totalSold++;

      order.voucherCodes?.forEach((voucherCode) => {
        if (voucherCode.redemptions?.length > 0) {
          acc.redemptionData.uniqueVouchers.add(voucherCode.id);

          voucherCode.redemptions.forEach((redemption) => {
            acc.redemptionData.totalAmount += redemption.amountRedeemed || 0;

            const redemptionDate = redemption.redeemedAt;
            if (
              !acc.redemptionData.lastDate ||
              redemptionDate > acc.redemptionData.lastDate
            ) {
              acc.redemptionData.lastDate = redemptionDate;
            }
          });
        }
      });

      return acc;
    },
    {
      totalSoldAmount: 0,
      totalSold: 0,
      redemptionData: {
        uniqueVouchers: new Set(),
        totalAmount: 0,
        lastDate: null,
      },
    }
  );

  const totalRedeemed = redemptionData.uniqueVouchers.size;
  const redeemedAmount = redemptionData.totalAmount;
  const outstanding = totalSold - totalRedeemed;
  const outstandingAmount = totalSoldAmount - redeemedAmount;

  // Calculate base amount
  const baseAmount =
    brandTerms?.settlementTrigger === "onRedemption"
      ? redeemedAmount
      : totalSoldAmount;

  // Calculate commission
  let commissionAmount = 0;
  if (brandTerms) {
    if (brandTerms.commissionType === "Percentage") {
      commissionAmount = Math.round(
        (baseAmount * (brandTerms.commissionValue || 0)) / 100
      );
    } else if (brandTerms.commissionType === "Fixed") {
      const transactionCount =
        brandTerms.settlementTrigger === "onRedemption"
          ? totalRedeemed
          : totalSold;
      commissionAmount = Math.round(
        (brandTerms.commissionValue || 0) * transactionCount
      );
    }
  }

  // Calculate breakage efficiently
  const breakageAmount = orders.reduce((sum, order) => {
    return sum + (expiredByOrder.get(order.id) || 0);
  }, 0);

  const adjustedBreakage = brandTerms?.breakageShare
    ? Math.round((breakageAmount * (brandTerms.breakageShare || 0)) / 100)
    : 0;

  // Calculate VAT
  const vatAmount = brandTerms?.vatRate
    ? Math.round((commissionAmount * (brandTerms.vatRate || 0)) / 100)
    : 0;

  // Net payable
  const netPayable = Math.round(
    baseAmount - commissionAmount - adjustedBreakage + vatAmount
  );

  // Payment details from settlement
  const payments = settlement.paidAt
    ? [
        {
          id: settlement.id,
          amount: settlement.netPayable || 0,
          paidAt: settlement.paidAt,
          reference: settlement.paymentReference,
          notes: settlement.notes,
        },
      ]
    : [];

  const totalPaid = Math.round(
    payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  const remainingAmount = Math.max(0, netPayable - totalPaid);

  // Status determination
  let status;
  if (remainingAmount === 0 && totalPaid > 0) {
    status = "Paid";
  } else if (totalPaid > 0 && remainingAmount > 0) {
    status = "PartiallyPaid";
  } else {
    status = settlement.status || "Pending";
  }

  return {
    totalSold,
    totalSoldAmount,
    totalRedeemed,
    redeemedAmount,
    outstanding,
    outstandingAmount,
    redemptionRate:
      totalSold > 0 ? ((totalRedeemed / totalSold) * 100).toFixed(2) : "0.00",
    lastRedemptionDate: redemptionData.lastDate,
    baseAmount,
    commissionAmount,
    breakageAmount: adjustedBreakage,
    vatAmount,
    netPayable,
    totalPaid,
    remainingAmount,
    status,
    lastPaymentDate: payments.length > 0 ? payments[0].paidAt : null,
    paymentHistory: payments,
    paymentCount: payments.length,
    settlementTrigger: brandTerms?.settlementTrigger,
    commissionType: brandTerms?.commissionType,
    commissionValue: brandTerms?.commissionValue,
    vatRate: brandTerms?.vatRate,
  };
}

function calculateSummaryOptimized(settlements) {
  return settlements.reduce(
    (summary, s) => {
      summary.totalSettlements++;
      summary.totalPayable += s.netPayable || 0;
      summary.totalPaid += s.totalPaid || 0;
      summary.totalRemaining += s.remainingAmount || 0;

      // Use object for O(1) status counting
      if (s.status === "Pending") summary.pendingCount++;
      else if (s.status === "Paid") summary.paidCount++;
      else if (s.status === "InReview") summary.inReviewCount++;
      else if (s.status === "Disputed") summary.disputedCount++;
      else if (s.status === "PartiallyPaid") summary.partiallyPaidCount++;

      return summary;
    },
    {
      totalSettlements: 0,
      totalPayable: 0,
      totalPaid: 0,
      totalRemaining: 0,
      pendingCount: 0,
      paidCount: 0,
      inReviewCount: 0,
      disputedCount: 0,
      partiallyPaidCount: 0,
    }
  );
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

function formatDateShort(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}