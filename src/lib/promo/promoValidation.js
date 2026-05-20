import { prisma } from "../db";
import {
  calculateCheckoutTotals,
  normalizeMoney,
  PROMO_CODE_TYPES,
} from "./promoPricing";

export function normalizePromoCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase();
}

function getPromoFailure(message) {
  return {
    success: false,
    error: message,
  };
}

export async function validatePromoCodeForCheckoutInput({
  code,
  subtotal,
  currency = "ZAR",
}) {
  const normalizedCode = normalizePromoCode(code);
  const normalizedCurrency = String(currency || "ZAR")
    .trim()
    .toUpperCase();
  const normalizedSubtotal = normalizeMoney(subtotal);

  if (!normalizedCode) {
    return getPromoFailure("Please enter a promo code.");
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!promo) {
    return getPromoFailure("That promo code was not found.");
  }

  if (!promo.isActive) {
    return getPromoFailure("This promo code is not active.");
  }

  const now = new Date();

  if (promo.startsAt && promo.startsAt > now) {
    return getPromoFailure("This promo code is not active yet.");
  }

  if (promo.endsAt && promo.endsAt < now) {
    return getPromoFailure("This promo code has expired.");
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return getPromoFailure("This promo code has reached its usage limit.");
  }

  if (
    promo.type === PROMO_CODE_TYPES.FIXED_AMOUNT &&
    promo.currency &&
    promo.currency !== normalizedCurrency
  ) {
    return getPromoFailure(
      `This promo code can only be used with ${promo.currency} checkout amounts.`,
    );
  }

  if (
    promo.minOrderAmount !== null &&
    normalizedSubtotal < promo.minOrderAmount
  ) {
    return getPromoFailure(
      `This promo code requires a minimum order of ${promo.minOrderAmount}.`,
    );
  }

  const totals = calculateCheckoutTotals(normalizedSubtotal, promo);

  return {
    success: true,
    promo,
    data: {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      discountValue: promo.discountValue,
      currency: normalizedCurrency,
      description: promo.description || "",
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountedSubtotal: totals.discountedSubtotal,
      serviceFee: totals.serviceFee,
      totalAmount: totals.totalAmount,
      message:
        promo.type === PROMO_CODE_TYPES.FREE_GIFT
          ? "Promo applied. This gift is now free."
          : "Promo code applied successfully.",
    },
  };
}
