"use server";

import prisma from "../db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { unlink } from "fs/promises";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SALT_ROUNDS = 12;

// Hash sensitive data
async function hashSensitiveData(data) {
  if (!data) return null;
  return bcrypt.hash(data, SALT_ROUNDS);
}

const ContactSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(), // ✅ accepts both
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().min(1, "Phone is required"),
  notes: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
});

const IntegrationSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(), // ✅ accepts both
  name: z.string().min(1, "Integration name is required"),
  platform: z.string().min(1, "Platform is required"),
  type: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("inactive"),
  storeUrl: z.string().url("Invalid store URL").optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiSecret: z.string().optional().nullable(),
  accessToken: z.string().optional().nullable(),
  consumerKey: z.string().optional().nullable(),
  consumerSecret: z.string().optional().nullable(),
  testConnection: z.boolean().default(false),
});

const BrandPartnerSchema = z
  .object({
    // Core
    brandName: z.string().min(1, "Brand name is required"),
    description: z.string().min(1, "Description is required"),
    website: z.string().url("Invalid website URL"),
    contact: z.string().optional(),
    tagline: z.string().optional(),
    color: z.string().default("#000000"),
    categorieName: z.string().min(1, "Category is required"),
    notes: z.string().optional(),
    isActive: z.boolean().default(false),
    isFeature: z.boolean().default(false),

    // Terms
    settlementTrigger: z
      .enum(["onRedemption", "onPurchase"])
      .default("onRedemption"),
    commissionType: z.any().default("Percentage"), // ← was enum
    commissionValue: z.number().min(0, "Commission value must be positive"),
    maxDiscount: z.number().min(0).optional().nullable(),
    minOrderValue: z.number().min(0).optional().nullable(),
    currency: z.string().optional().nullable(),
    brackingPolicy: z.enum(["Retain", "Share", "Forfeit"]).default("Retain").optional().nullable(),
    brackingShare: z.number().min(0).max(100).optional().nullable(),
    contractStart: z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "Invalid contract start date"
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
    goLiveDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid go live date")
      .optional(),
    renewContract: z.boolean().default(false),
    vatRate: z.number().min(0).max(100).optional().nullable(),
    internalNotes: z.string().optional(),

    // Vouchers
    denominationType: z.any().default("staticDenominations"), // ← was enum
    denominations: z.any().optional(),
    denominationValue: z.any().optional().nullable(),
    denominationCurrency: z.string().optional().nullable(),
    maxAmount: z.number().min(0).optional().nullable(),
    minAmount: z.number().min(0).optional().nullable(),
    expiryPolicy: z.any().default("fixedDay"), // ← was enum
    expiryValue: z.string().min(1, "Expiry value is required"),
    expiresAt: z.string().optional(),
    graceDays: z.number().min(0).optional().nullable(),
    redemptionChannels: z.any().optional().nullable(), // ← was string
    partialRedemption: z.boolean().default(false),
    stackable: z.boolean().default(false),
    maxUserPerDay: z.number().min(1).optional().nullable(),
    termsConditionsURL: z.any().optional().nullable(), // ← was url

    // Banking
    settlementFrequency: z
      .enum(["daily", "weekly", "monthly", "quarterly"])
      .default("monthly"),
    dayOfMonth: z.number().min(1).max(31).optional().nullable(),
    payoutMethod: z
      .enum(["EFT", "wire_transfer", "Manual", "paypal", "stripe"])
      .default("EFT"),
    invoiceRequired: z.boolean().default(false),
    remittanceEmail: z.string().email("Invalid email format").optional(),
    accountHolder: z.string().min(1, "Account holder is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    branchCode: z.string().min(1, "Branch code is required"),
    bankName: z.string().min(1, "Bank name is required"),
    swiftCode: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    accountVerification: z.boolean().default(false),

    // Relations
    contacts: z.array(ContactSchema).min(1, "At least one contact is required"),
    integrations: z.array(IntegrationSchema).optional().default([]),
  })
  .refine(
    (data) => {
      // If contractEnd is not provided, skip validation
      if (data?.settlementTrigger === "onPurchase") return true;

      const startDate = new Date(data.contractStart);
      const endDate = new Date(data.contractEnd);
      return startDate < endDate;
    },
    {
      message: "Contract end date must be after start date",
      path: ["contractEnd"],
    }
  );

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

    // Handle logo upload
    if (parsedData.logoFile && parsedData.logoFile.size > 0) {
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "brands");
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const extension = parsedData.logoFile.name.split(".").pop();
        const filename = `${validatedData.brandName
          .toLowerCase()
          .replace(/\s+/g, "_")}_${timestamp}.${extension}`;

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

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create brand
      const brand = await tx.brand.create({
        data: {
          brandName: validatedData.brandName,
          logo: logoPath,
          description: validatedData.description,
          website: validatedData.website,
          contact: validatedData.contact || "",
          tagline: validatedData.tagline || "",
          color: validatedData.color,
          categorieName: validatedData.categorieName,
          notes: validatedData.notes || "",
          isActive: validatedData.isActive,
          isFeature: validatedData.isFeature,
        },
      });

      // Create brand terms
      await tx.brandTerms.create({
        data: {
          brands: {
            connect: { id: brand.id },
          },
          settelementTrigger: validatedData.settlementTrigger,
          commissionType: validatedData.commissionType,
          commissionValue: validatedData.commissionValue,
          maxDiscount: validatedData.maxDiscount,
          minOrderValue: validatedData.minOrderValue,
          currency: validatedData.currency,
          brackingPolicy: validatedData.brackingPolicy,
          brackingShare: validatedData.brackingShare,
          contractStart: new Date(validatedData.contractStart),
          contractEnd: new Date(validatedData.contractEnd),
          goLiveDate: validatedData.goLiveDate
            ? new Date(validatedData.goLiveDate)
            : new Date(),
          renewContract: validatedData.renewContract,
          vatRate: validatedData.vatRate,
          internalNotes: validatedData.internalNotes || "",
        },
      });

      // Create voucher settings
      const denominationValue =
        validatedData.denominationValue != null &&
        validatedData.denominationValue !== ""
          ? parseInt(validatedData.denominationValue, 10)
          : null;
      await tx.vouchers.create({
        data: {
          brands: {
            connect: { id: brand.id },
          },
          denominationype: validatedData.denominationType,
          denominations: validatedData.denominations,
          denominationCurrency: validatedData.denominationCurrency,
          denominationValue: denominationValue,
          maxAmount: validatedData.maxAmount,
          minAmount: validatedData.minAmount,
          expiryPolicy: validatedData.expiryPolicy,
          expiryValue:
            validatedData.expiryPolicy === "neverExpires"
              ? null
              : validatedData.expiryValue, // Handle no expiry case
          expiresAt: validatedData.expiresAt || null, // Keep as string
          graceDays: validatedData.graceDays,
          redemptionChannels: validatedData.redemptionChannels,
          partialRedemption: validatedData.partialRedemption,
          Stackable: validatedData.stackable,
          maxUserPerDay: validatedData.maxUserPerDay,
          termsConditionsURL: validatedData.termsConditionsURL,
        },
      });

      // Create banking details
      await tx.brandBanking.create({
        data: {
          brands: {
            connect: { id: brand.id },
          },
          settlementFrequency: validatedData.settlementFrequency,
          dayOfMonth: validatedData.dayOfMonth,
          payoutMethod: validatedData.payoutMethod,
          invoiceRequired: validatedData.invoiceRequired,
          remittanceEmail: validatedData.remittanceEmail || "",
          accountHolder: validatedData.accountHolder,
          accountNumber: validatedData.accountNumber,
          branchCode: validatedData.branchCode,
          bankName: validatedData.bankName,
          SWIFTCode: validatedData.swiftCode || "",
          country: validatedData.country,
          accountVerification: validatedData.accountVerification,
        },
      });

      // Create contacts
      for (const contact of validatedData.contacts) {
        await tx.brandContacts.create({
          data: {
            brands: {
              connect: { id: brand.id },
            },
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes,
            isPrimary: contact.isPrimary,
          },
        });
      }

      // Create integrations with encrypted sensitive data
      for (const integration of validatedData.integrations || []) {
        await tx.integration.create({
          data: {
            brands: {
              connect: { id: brand.id },
            },
            platform: integration.platform,
            storeUrl: integration.storeUrl,
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
            isActive: integration.status === "active",
          },
        });
      }

      return brand;
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
        message: "Brand name already exists",
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

export async function getBrandPartner(brandId) {
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
        brandcontacts: {
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
            isActive: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields in read operations
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

export async function getBrandPartners(params = {}) {
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

    const whereClause = {};

    // Search functionality
    if (search) {
      whereClause.OR = [
        { brandName: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { categorieName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All Brands") {
      whereClause.categorieName = category;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    if (isFeature !== null) {
      whereClause.isFeature = isFeature === "true";
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [brandPartners, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: {
          brandcontacts: {
            where: { isPrimary: true },
            take: 1,
          },
          brandTerms: {
            select: {
              commissionType: true,
              commissionValue: true,
              contractEnd: true,
            },
          },
          _count: {
            select: {
              order: true,
              vouchers: true,
              integrations: true,
            },
          },
        },
      }),
      prisma.brand.count({ where: whereClause }),
    ]);

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
      data: brandPartners,
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
    };
  } catch (error) {
    console.error("Error fetching brand partners:", error);
    return {
      success: false,
      message: "Failed to fetch brand partners",
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

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        brandcontacts: true,
        brandTerms: true,
        brandBankings: true,
        vouchers: true,
        integrations: true,
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

    // Handle logo upload
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
        const filename = `${validatedData.brandName
          .toLowerCase()
          .replace(/\s+/g, "_")}_${timestamp}.${extension}`;

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

    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update brand
      const updatedBrand = await tx.brand.update({
        where: { id: brandId },
        data: {
          brandName: validatedData.brandName,
          logo: logoPath,
          description: validatedData.description,
          website: validatedData.website,
          contact: validatedData.contact || "",
          tagline: validatedData.tagline || "",
          color: validatedData.color,
          categorieName: validatedData.categorieName,
          notes: validatedData.notes || "",
          isActive: validatedData.isActive,
          isFeature: validatedData.isFeature,
        },
      });

      // Update brand terms
      const existingBrandTerms = existingBrand.brandTerms[0];
      if (existingBrandTerms) {
        // Update existing record
        await tx.brandTerms.update({
          where: { id: existingBrandTerms.id },
          data: {
            settelementTrigger: validatedData.settlementTrigger,
            commissionType: validatedData.commissionType,
            commissionValue: validatedData.commissionValue,
            maxDiscount: validatedData.maxDiscount,
            minOrderValue: validatedData.minOrderValue,
            currency: validatedData.currency,
            brackingPolicy: validatedData.brackingPolicy,
            brackingShare: validatedData.brackingShare,
            contractStart: new Date(validatedData.contractStart),
            contractEnd: new Date(validatedData.contractEnd),
            goLiveDate: validatedData.goLiveDate
              ? new Date(validatedData.goLiveDate)
              : new Date(),
            renewContract: validatedData.renewContract,
            vatRate: validatedData.vatRate,
            internalNotes: validatedData.internalNotes || "",
          },
        });
      } else {
        // Create new record
        await tx.brandTerms.create({
          data: {
            brandId,
            settelementTrigger: validatedData.settlementTrigger,
            commissionType: validatedData.commissionType,
            commissionValue: validatedData.commissionValue,
            maxDiscount: validatedData.maxDiscount,
            minOrderValue: validatedData.minOrderValue,
            currency: validatedData.currency,
            brackingPolicy: validatedData.brackingPolicy,
            brackingShare: validatedData.brackingShare,
            contractStart: new Date(validatedData.contractStart),
            contractEnd: new Date(validatedData.contractEnd),
            goLiveDate: validatedData.goLiveDate
              ? new Date(validatedData.goLiveDate)
              : new Date(),
            renewContract: validatedData.renewContract,
            vatRate: validatedData.vatRate,
            internalNotes: validatedData.internalNotes || "",
          },
        });
      }

      // Update voucher settings
      const denominationValue =
        validatedData.denominationValue != null &&
        validatedData.denominationValue !== ""
          ? parseInt(validatedData.denominationValue, 10)
          : null;
      const existingVoucher = existingBrand.vouchers[0];
      if (existingVoucher) {
        // Update existing record
        await tx.vouchers.update({
          where: { id: existingVoucher.id },
          data: {
            denominationype: validatedData.denominationType,
            denominations: validatedData.denominations,
            denominationCurrency: validatedData.denominationCurrency,
            denominationValue: denominationValue,
            maxAmount: validatedData.maxAmount,
            minAmount: validatedData.minAmount,
            expiryPolicy: validatedData.expiryPolicy,
            expiryValue:
              validatedData.expiryPolicy === "neverExpires"
                ? null
                : validatedData.expiryValue, // Handle no expiry case
            expiresAt: validatedData.expiresAt || null, // Keep as string
            graceDays: validatedData.graceDays,
            redemptionChannels: validatedData.redemptionChannels,
            partialRedemption: validatedData.partialRedemption,
            Stackable: validatedData.stackable,
            maxUserPerDay: validatedData.maxUserPerDay,
            termsConditionsURL: validatedData.termsConditionsURL,
          },
        });
      } else {
        // Create new record
        await tx.vouchers.create({
          data: {
            brandId,
            denominationype: validatedData.denominationType,
            denominations: validatedData.denominations,
            denominationCurrency: validatedData.denominationCurrency,
            denominationValue: denominationValue,
            maxAmount: validatedData.maxAmount,
            minAmount: validatedData.minAmount,
            expiryPolicy: validatedData.expiryPolicy,
            expiryValue:
              validatedData.expiryPolicy === "neverExpires"
                ? null
                : validatedData.expiryValue, // Handle no expiry case
            expiresAt: validatedData.expiresAt || null, // Keep as string
            graceDays: validatedData.graceDays,
            redemptionChannels: validatedData.redemptionChannels,
            partialRedemption: validatedData.partialRedemption,
            Stackable: validatedData.stackable,
            maxUserPerDay: validatedData.maxUserPerDay,
            termsConditionsURL: validatedData.termsConditionsURL,
          },
        });
      }

      // Update banking details
      const existingBanking = existingBrand.brandBankings[0];
      if (existingBanking) {
        // Update existing record
        await tx.brandBanking.update({
          where: { id: existingBanking.id },
          data: {
            settlementFrequency: validatedData.settlementFrequency,
            dayOfMonth: validatedData.dayOfMonth,
            payoutMethod: validatedData.payoutMethod,
            invoiceRequired: validatedData.invoiceRequired,
            remittanceEmail: validatedData.remittanceEmail || "",
            accountHolder: validatedData.accountHolder,
            accountNumber: validatedData.accountNumber,
            branchCode: validatedData.branchCode,
            bankName: validatedData.bankName,
            SWIFTCode: validatedData.swiftCode || "",
            country: validatedData.country,
            accountVerification: validatedData.accountVerification,
          },
        });
      } else {
        // Create new record
        await tx.brandBanking.create({
          data: {
            brandId,
            settlementFrequency: validatedData.settlementFrequency,
            dayOfMonth: validatedData.dayOfMonth,
            payoutMethod: validatedData.payoutMethod,
            invoiceRequired: validatedData.invoiceRequired,
            remittanceEmail: validatedData.remittanceEmail || "",
            accountHolder: validatedData.accountHolder,
            accountNumber: validatedData.accountNumber,
            branchCode: validatedData.branchCode,
            bankName: validatedData.bankName,
            SWIFTCode: validatedData.swiftCode || "",
            country: validatedData.country,
            accountVerification: validatedData.accountVerification,
          },
        });
      }

      // Delete existing contacts and create new ones
      await tx.brandContacts.deleteMany({ where: { brandId } });
      for (const contact of validatedData.contacts) {
        await tx.brandContacts.create({
          data: {
            brandId,
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes,
            isPrimary: contact.isPrimary,
          },
        });
      }

      // Update integrations
      await tx.integration.deleteMany({ where: { brandId } });
      for (const integration of validatedData.integrations || []) {
        await tx.integration.create({
          data: {
            brandId,
            platform: integration.platform,
            storeUrl: integration.storeUrl,
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
            isActive: integration.status === "active",
          },
        });
      }

      return updatedBrand;
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
        message: "Brand name already exists",
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

export async function getBrandPartnerStats() {
  try {
    const [
      totalBrands,
      activeBrands,
      featuredBrands,
      categoryStats,
      contractsExpiringSoon,
      integrationsCount,
    ] = await Promise.all([
      prisma.brand.count(),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isFeature: true } }),
      prisma.brand.groupBy({
        by: ["categorieName"],
        _count: { categorieName: true },
        where: { categorieName: { not: null } },
      }),
      prisma.brandTerms.count({
        where: {
          contractEnd: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        },
      }),
      prisma.integration.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        total: totalBrands,
        active: activeBrands,
        featured: featuredBrands,
        inactive: totalBrands - activeBrands,
        activeRate:
          totalBrands > 0 ? Math.round((activeBrands / totalBrands) * 100) : 0,
        featuredRate:
          totalBrands > 0
            ? Math.round((featuredBrands / totalBrands) * 100)
            : 0,
        contractsExpiringSoon,
        activeIntegrations: integrationsCount,
        categoryDistribution: categoryStats.map((stat) => ({
          category: stat.categorieName,
          count: stat._count.categorieName,
          percentage:
            totalBrands > 0
              ? Math.round((stat._count.categorieName / totalBrands) * 100)
              : 0,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching brand partner stats:", error);
    return {
      success: false,
      message: "Failed to fetch brand partner statistics",
      error: error.message,
      status: 500,
    };
  }
}

export async function searchBrandPartners(searchTerm, options = {}) {
  try {
    const { limit = 5, includeInactive = false } = options;

    const whereClause = {
      OR: [
        { brandName: { contains: searchTerm, mode: "insensitive" } },
        { tagline: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { categorieName: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const brandPartners = await prisma.brand.findMany({
      where: whereClause,
      take: limit,
      orderBy: { brandName: "asc" },
      select: {
        id: true,
        brandName: true,
        tagline: true,
        logo: true,
        color: true,
        categorieName: true,
        isActive: true,
        isFeature: true,
        brandcontacts: {
          where: { isPrimary: true },
          take: 1,
          select: { email: true, name: true },
        },
      },
    });

    return {
      success: true,
      data: brandPartners,
      count: brandPartners.length,
    };
  } catch (error) {
    console.error("Error searching brand partners:", error);
    return {
      success: false,
      message: "Failed to search brand partners",
      error: error.message,
    };
  }
}

export async function getBrandPartnersByCategory(category, options = {}) {
  try {
    const { limit = 10, page = 1, includeInactive = false } = options;
    const skip = (page - 1) * limit;

    const whereClause = { categorieName: category };
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const [brandPartners, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { brandName: "asc" },
        include: {
          brandcontacts: {
            where: { isPrimary: true },
            take: 1,
          },
          brandTerms: {
            select: { contractEnd: true },
          },
        },
      }),
      prisma.brand.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: brandPartners,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("Error fetching brand partners by category:", error);
    return {
      success: false,
      message: "Failed to fetch brand partners by category",
      error: error.message,
    };
  }
}

export async function getBrandPartnerDashboard(brandId) {
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
        brandcontacts: true,
        brandTerms: true,
        brandBankings: true,
        vouchers: true,
        integrations: {
          select: {
            id: true,
            platform: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            order: true,
            settlements: true,
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

    // Calculate additional metrics
    const currentDate = new Date();
    const contractEndDate = brandPartner.brandTerms?.[0]?.contractEnd;
    const daysUntilExpiry = contractEndDate
      ? Math.ceil((contractEndDate - currentDate) / (1000 * 60 * 60 * 24))
      : null;

    const dashboard = {
      brandInfo: {
        id: brandPartner.id,
        name: brandPartner.brandName,
        logo: brandPartner.logo,
        isActive: brandPartner.isActive,
        category: brandPartner.categorieName,
      },
      metrics: {
        totalOrders: brandPartner._count.order,
        totalSettlements: brandPartner._count.settlements,
        activeIntegrations: brandPartner.integrations.filter((i) => i.isActive)
          .length,
        totalContacts: brandPartner.brandcontacts.length,
        daysUntilContractExpiry: daysUntilExpiry,
      },
      status: {
        contractStatus:
          daysUntilExpiry > 30
            ? "active"
            : daysUntilExpiry > 0
            ? "expiring_soon"
            : "expired",
        integrationStatus:
          brandPartner.integrations.length > 0 ? "configured" : "pending",
        bankingStatus:
          brandPartner.brandBankings.length > 0 ? "verified" : "pending",
      },
    };

    return {
      success: true,
      data: dashboard,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching brand partner dashboard:", error);
    return {
      success: false,
      message: "Failed to fetch brand partner dashboard",
      error: error.message,
      status: 500,
    };
  }
}

export async function toggleBrandPartnerStatus(brandId, status) {
  try {
    if (!brandId) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    if (typeof status !== "boolean") {
      return {
        success: false,
        message: "Valid status (true/false) is required",
        status: 400,
      };
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: { isActive: status },
    });

    return {
      success: true,
      message: `Brand partner ${
        status ? "activated" : "deactivated"
      } successfully`,
      data: updatedBrand,
      status: 200,
    };
  } catch (error) {
    console.error("Error toggling brand partner status:", error);

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

export async function getBrandPartnerIntegrations(brandId) {
  try {
    if (!brandId) {
      return {
        success: false,
        message: "Brand ID is required",
        status: 400,
      };
    }

    const integrations = await prisma.integration.findMany({
      where: { brandId },
      select: {
        id: true,
        platform: true,
        storeUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Sensitive fields are excluded for security
      },
    });

    return {
      success: true,
      data: integrations,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching brand partner integrations:", error);
    return {
      success: false,
      message: "Failed to fetch integrations",
      error: error.message,
      status: 500,
    };
  }
}
