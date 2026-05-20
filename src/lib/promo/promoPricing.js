export const PROMO_CODE_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
  FREE_GIFT: "FREE_GIFT",
};

export const SERVICE_FEE_TOTAL_RATE = 5;
export const SERVICE_FEE_VAT_RATE = 15;
export const SERVICE_FEE_EX_VAT_DISPLAY_RATE = 4.35;

export function roundMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Number(parsed.toFixed(2));
}

export function normalizeMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return roundMoney(Math.max(0, parsed));
}

export function calculateServiceFee(subtotal, promoType = null) {
  const normalizedSubtotal = normalizeMoney(subtotal);

  if (promoType === PROMO_CODE_TYPES.FREE_GIFT) {
    return 0;
  }

  return roundMoney((normalizedSubtotal * SERVICE_FEE_TOTAL_RATE) / 100);
}

export function getServiceFeeBreakdown(totalServiceFee) {
  const normalizedTotalServiceFee = normalizeMoney(totalServiceFee);

  if (normalizedTotalServiceFee <= 0) {
    return {
      serviceFeeExVat: 0,
      serviceFeeVat: 0,
      totalServiceFee: 0,
      serviceFeeExVatRate: SERVICE_FEE_EX_VAT_DISPLAY_RATE,
      serviceFeeVatRate: SERVICE_FEE_VAT_RATE,
      totalServiceFeeRate: SERVICE_FEE_TOTAL_RATE,
    };
  }

  const serviceFeeExVat = roundMoney(
    normalizedTotalServiceFee / (1 + SERVICE_FEE_VAT_RATE / 100),
  );
  const serviceFeeVat = roundMoney(normalizedTotalServiceFee - serviceFeeExVat);

  return {
    serviceFeeExVat,
    serviceFeeVat,
    totalServiceFee: normalizedTotalServiceFee,
    serviceFeeExVatRate: SERVICE_FEE_EX_VAT_DISPLAY_RATE,
    serviceFeeVatRate: SERVICE_FEE_VAT_RATE,
    totalServiceFeeRate: SERVICE_FEE_TOTAL_RATE,
  };
}

export function calculatePromoDiscountAmount(subtotal, promoCode) {
  const normalizedSubtotal = normalizeMoney(subtotal);
  if (!promoCode?.type || normalizedSubtotal <= 0) return 0;

  if (promoCode.type === PROMO_CODE_TYPES.PERCENTAGE) {
    const percentage = Number(promoCode.discountValue) || 0;
    return Math.min(
      normalizedSubtotal,
      roundMoney((normalizedSubtotal * percentage) / 100),
    );
  }

  if (promoCode.type === PROMO_CODE_TYPES.FIXED_AMOUNT) {
    return Math.min(normalizedSubtotal, normalizeMoney(promoCode.discountValue));
  }

  if (promoCode.type === PROMO_CODE_TYPES.FREE_GIFT) {
    return normalizedSubtotal;
  }

  return 0;
}

export function calculateCheckoutTotals(subtotal, promoCode = null) {
  const normalizedSubtotal = normalizeMoney(subtotal);
  const discountAmount = calculatePromoDiscountAmount(
    normalizedSubtotal,
    promoCode,
  );
  const discountedSubtotal = roundMoney(
    Math.max(0, normalizedSubtotal - discountAmount),
  );
  const serviceFee = calculateServiceFee(normalizedSubtotal, promoCode?.type);
  const totalAmount = roundMoney(Math.max(0, discountedSubtotal + serviceFee));
  const serviceFeeBreakdown = getServiceFeeBreakdown(serviceFee);

  return {
    subtotal: normalizedSubtotal,
    discountAmount,
    discountedSubtotal,
    serviceFee,
    ...serviceFeeBreakdown,
    totalAmount,
  };
}

export function allocateAmountAcrossBases(totalAmount, bases) {
  const normalizedTotal = Math.round(normalizeMoney(totalAmount) * 100);
  const normalizedBases = Array.isArray(bases)
    ? bases.map((value) => Math.round(normalizeMoney(value) * 100))
    : [];

  if (!normalizedBases.length) return [];

  const totalBase = normalizedBases.reduce((sum, value) => sum + value, 0);

  if (normalizedTotal <= 0 || totalBase <= 0) {
    return normalizedBases.map(() => 0);
  }

  const provisional = normalizedBases.map((base, index) => {
    const exact = (normalizedTotal * base) / totalBase;
    const floor = Math.floor(exact);

    return {
      index,
      floor,
      remainder: exact - floor,
    };
  });

  const allocated = provisional.map((item) => item.floor);
  let remaining = normalizedTotal - allocated.reduce((sum, value) => sum + value, 0);

  provisional
    .sort((left, right) => {
      if (right.remainder !== left.remainder) {
        return right.remainder - left.remainder;
      }
      return left.index - right.index;
    })
    .forEach(({ index }) => {
      if (remaining <= 0) return;
      allocated[index] += 1;
      remaining -= 1;
    });

  return allocated.map((value) => roundMoney(value / 100));
}

export function distributeCheckoutTotals(subtotals, promoCode = null) {
  const normalizedSubtotals = subtotals.map((value) => normalizeMoney(value));
  const checkoutTotals = calculateCheckoutTotals(
    normalizedSubtotals.reduce((sum, value) => sum + value, 0),
    promoCode,
  );

  const discountDistribution = allocateAmountAcrossBases(
    checkoutTotals.discountAmount,
    normalizedSubtotals,
  );
  const serviceFeeDistribution = allocateAmountAcrossBases(
    checkoutTotals.serviceFee,
    normalizedSubtotals,
  );

  const lineItems = normalizedSubtotals.map((subtotal, index) => {
    const discountAmount = discountDistribution[index] || 0;
    const discountedSubtotal = roundMoney(Math.max(0, subtotal - discountAmount));
    const serviceFee = serviceFeeDistribution[index] || 0;
    const totalAmount = roundMoney(Math.max(0, discountedSubtotal + serviceFee));
    const serviceFeeBreakdown = getServiceFeeBreakdown(serviceFee);

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      serviceFee,
      ...serviceFeeBreakdown,
      totalAmount,
    };
  });

  return {
    ...checkoutTotals,
    lineItems,
  };
}
