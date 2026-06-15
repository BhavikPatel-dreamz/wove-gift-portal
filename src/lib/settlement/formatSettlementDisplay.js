import { currencyList } from "@/components/brandsPartner/currency";

export function formatSettlementNumber(value) {
  const parsed = Number(value);
  const safeValue = Number.isFinite(parsed) ? parsed : 0;

  return safeValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getSettlementCurrencySymbol(currency = "ZAR") {
  return currencyList.find((item) => item.code === currency)?.symbol || "R";
}

export function formatSettlementCurrency(value, currency = "ZAR") {
  const parsed = Number(value);
  const safeValue = Number.isFinite(parsed) ? parsed : 0;
  const sign = safeValue < 0 ? "-" : "";
  const absoluteValue = Math.abs(safeValue);

  return `${sign}${getSettlementCurrencySymbol(currency)}${formatSettlementNumber(absoluteValue)}`;
}

function getWeekNumber(date) {
  const normalizedDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));
  const dayNum = normalizedDate.getUTCDay() || 7;
  normalizedDate.setUTCDate(normalizedDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(normalizedDate.getUTCFullYear(), 0, 1));

  return Math.ceil((((normalizedDate - yearStart) / 86400000) + 1) / 7);
}

export function formatSettlementPeriodLabel(
  periodStart,
  frequency = "monthly",
  locale = "en-US",
) {
  if (!periodStart) return "";

  const startDate = new Date(periodStart);
  if (Number.isNaN(startDate.getTime())) return "";

  switch (frequency) {
    case "daily":
      return startDate.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "weekly":
      return `Week ${getWeekNumber(startDate)}, ${startDate.getFullYear()}`;
    case "monthly":
      return startDate.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });
    case "quarterly":
      return `Q${Math.floor(startDate.getMonth() / 3) + 1} ${startDate.getFullYear()}`;
    case "yearly":
      return startDate.getFullYear().toString();
    default:
      return startDate.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });
  }
}
