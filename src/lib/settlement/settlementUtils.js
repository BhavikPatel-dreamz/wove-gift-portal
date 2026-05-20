export function roundSettlementAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Number(parsed.toFixed(2));
}

function normalizeSettlementAmount(value) {
  return Math.max(0, roundSettlementAmount(value));
}

export function getOrderSettlementAmount(order) {
  const subtotal = normalizeSettlementAmount(order?.subtotal);
  if (subtotal > 0) return subtotal;

  const amount = normalizeSettlementAmount(order?.amount);
  const quantity = Math.max(0, Math.round(Number(order?.quantity) || 0));
  if (amount > 0 && quantity > 0) {
    return amount * quantity;
  }

  return normalizeSettlementAmount(order?.totalAmount);
}

export function getSettlementBaseAmount(settlement, settlementTrigger = "onRedemption") {
  return settlementTrigger === "onRedemption"
    ? normalizeSettlementAmount(settlement?.redeemedAmount)
    : normalizeSettlementAmount(settlement?.totalSoldAmount);
}

export function getSettlementTransactionCount(
  settlement,
  settlementTrigger = "onRedemption",
) {
  return settlementTrigger === "onRedemption"
    ? Math.max(0, Math.round(Number(settlement?.totalRedeemed) || 0))
    : Math.max(0, Math.round(Number(settlement?.totalSold) || 0));
}

export function calculateSettlementAmounts({
  baseAmount = 0,
  commissionType = "Percentage",
  commissionValue = 0,
  vatRate = 0,
  itemCount = 0,
  breakageAmount = 0,
}) {
  const normalizedBaseAmount = normalizeSettlementAmount(baseAmount);
  const normalizedItemCount = Math.max(0, Math.round(Number(itemCount) || 0));
  const normalizedCommissionValue = Number(commissionValue) || 0;
  const normalizedVatRate = Number(vatRate) || 0;
  const normalizedBreakageAmount = normalizeSettlementAmount(breakageAmount);

  let commissionAmount = 0;

  if (commissionType === "Percentage") {
    commissionAmount = roundSettlementAmount(
      (normalizedBaseAmount * normalizedCommissionValue) / 100,
    );
  } else if (commissionType === "Fixed") {
    commissionAmount = roundSettlementAmount(
      normalizedCommissionValue * normalizedItemCount,
    );
  }

  const vatAmount = roundSettlementAmount(
    (commissionAmount * normalizedVatRate) / 100,
  );
  const netPayable = Math.max(
    0,
    roundSettlementAmount(
      normalizedBaseAmount -
        commissionAmount -
        vatAmount -
        normalizedBreakageAmount,
    ),
  );

  return {
    baseAmount: normalizedBaseAmount,
    commissionAmount,
    vatAmount,
    breakageAmount: normalizedBreakageAmount,
    netPayable,
  };
}
