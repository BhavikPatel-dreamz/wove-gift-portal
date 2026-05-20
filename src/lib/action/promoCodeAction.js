"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { getSession } from "./userAction/session";
import { isAdminRole } from "../roles";
import { validatePromoCodeForCheckoutInput } from "../promo/promoValidation";

const PROMO_TYPES = new Set(["PERCENTAGE", "FIXED_AMOUNT", "FREE_GIFT"]);

function parseOptionalInteger(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : NaN;
}

function parseOptionalDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatPromoCode(record) {
  return {
    id: record.id,
    code: record.code,
    description: record.description || "",
    type: record.type,
    discountValue: record.discountValue,
    currency: record.currency,
    minOrderAmount: record.minOrderAmount,
    usageLimit: record.usageLimit,
    usageCount: record.usageCount,
    isActive: record.isActive,
    startsAt: record.startsAt ? record.startsAt.toISOString() : null,
    endsAt: record.endsAt ? record.endsAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    createdBy: record.createdBy
      ? {
          id: record.createdBy.id,
          email: record.createdBy.email,
          firstName: record.createdBy.firstName,
          lastName: record.createdBy.lastName,
        }
      : null,
  };
}

async function requireAdmin() {
  const session = await getSession();
  const user = session?.user;

  if (!user || !isAdminRole(user.role)) {
    throw new Error("Only admins can access promo codes.");
  }

  return user;
}

function validatePromoPayload(input) {
  const code = String(input.code || "")
    .trim()
    .toUpperCase();
  const description = String(input.description || "").trim();
  const type = String(input.type || "").trim();
  const currency = String(input.currency || "ZAR")
    .trim()
    .toUpperCase();
  const minOrderAmount = parseOptionalInteger(input.minOrderAmount);
  const usageLimit = parseOptionalInteger(input.usageLimit);
  const startsAt = parseOptionalDate(input.startsAt);
  const endsAt = parseOptionalDate(input.endsAt);
  const isActive = Boolean(input.isActive);

  if (!code) {
    throw new Error("Promo code is required.");
  }

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    throw new Error("Promo code can only include letters, numbers, hyphens, and underscores.");
  }

  if (!PROMO_TYPES.has(type)) {
    throw new Error("Please choose a valid promo type.");
  }

  if (Number.isNaN(minOrderAmount) || (minOrderAmount !== null && minOrderAmount < 0)) {
    throw new Error("Minimum order amount must be 0 or greater.");
  }

  if (Number.isNaN(usageLimit) || (usageLimit !== null && usageLimit < 1)) {
    throw new Error("Usage limit must be at least 1.");
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    throw new Error("End date must be after the start date.");
  }

  let discountValue = parseOptionalInteger(input.discountValue);

  if (type === "PERCENTAGE") {
    if (Number.isNaN(discountValue) || discountValue < 1 || discountValue > 100) {
      throw new Error("Percentage discounts must be between 1 and 100.");
    }
  } else if (type === "FIXED_AMOUNT") {
    if (Number.isNaN(discountValue) || discountValue < 1) {
      throw new Error("Fixed amount discounts must be at least 1.");
    }
  } else {
    discountValue = 100;
  }

  return {
    code,
    description: description || null,
    type,
    discountValue,
    currency: currency || "ZAR",
    minOrderAmount,
    usageLimit,
    startsAt,
    endsAt,
    isActive,
  };
}

export async function getPromoCodes() {
  await requireAdmin();

  const promoCodes = await prisma.promoCode.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });

  return promoCodes.map(formatPromoCode);
}

export async function getPromoCodeById(id) {
  await requireAdmin();

  if (!id) {
    throw new Error("Promo code id is required.");
  }

  const promoCode = await prisma.promoCode.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!promoCode) {
    throw new Error("Promo code not found.");
  }

  return formatPromoCode(promoCode);
}

export async function createPromoCode(input) {
  const user = await requireAdmin();
  const payload = validatePromoPayload(input);

  const existingCode = await prisma.promoCode.findUnique({
    where: { code: payload.code },
    select: { id: true },
  });

  if (existingCode) {
    throw new Error("That promo code already exists.");
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      ...payload,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  revalidatePath("/controls");
  return formatPromoCode(promoCode);
}

export async function updatePromoCode(id, input) {
  await requireAdmin();

  if (!id) {
    throw new Error("Promo code id is required.");
  }

  const payload = validatePromoPayload(input);

  const existingCode = await prisma.promoCode.findFirst({
    where: {
      code: payload.code,
      NOT: { id },
    },
    select: { id: true },
  });

  if (existingCode) {
    throw new Error("That promo code already exists.");
  }

  const promoCode = await prisma.promoCode.update({
    where: { id },
    data: payload,
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  revalidatePath("/controls");
  return formatPromoCode(promoCode);
}

export async function deletePromoCode(id) {
  await requireAdmin();

  if (!id) {
    throw new Error("Promo code id is required.");
  }

  await prisma.promoCode.delete({
    where: { id },
  });

  revalidatePath("/controls");
  return { success: true };
}

export async function validatePromoCodeForCheckout(input) {
  const result = await validatePromoCodeForCheckoutInput(input || {});

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: result.data,
  };
}
