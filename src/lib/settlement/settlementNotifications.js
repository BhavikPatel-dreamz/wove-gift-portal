import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import CommissionInvoicePDF from "../../components/settlements/CommissionInvoicePDF.jsx";
import SettlementStatementPDF from "../../components/settlements/SettlementStatementPDF.jsx";
import { currencyList } from "../../components/brandsPartner/currency.js";
import {
  formatSettlementNumber,
  formatSettlementPeriodLabel,
  getSettlementCurrencySymbol,
} from "./formatSettlementDisplay.js";
import { roundSettlementAmount } from "./settlementUtils.js";

const DEFAULT_COMPANY = {
  legalName: process.env.NEXT_INVOICE_COMPANY_NAME || "My Perks (Pty) Ltd",
  tradingName: process.env.NEXT_INVOICE_TRADING_NAME || "Wove Gifts",
  address:
    process.env.NEXT_INVOICE_COMPANY_ADDRESS ||
    "8 Vineyard Road, Claremont, Cape Town, South Africa",
  email:
    process.env.NEXT_SUPPORT_EMAIL ||
    process.env.NEXT_BREVO_SENDER_EMAIL ||
    "hello@wovegifts.com",
  website: process.env.NEXT_PUBLIC_SITE_URL || "https://wovegifts.com",
};

function streamToBuffer(stream) {
  const chunks = [];

  return (async () => {
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  })();
}

function formatLongDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function splitRecipientEmails(value) {
  if (!value || typeof value !== "string") return [];

  return value
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function getPrimaryContact(contacts = []) {
  if (!Array.isArray(contacts) || contacts.length === 0) return null;

  return contacts.find((contact) => contact?.isPrimary) || contacts[0];
}

function formatDocumentMoney(amount, currency) {
  return `${getSettlementCurrencySymbol(currency)}${formatSettlementNumber(amount)}`;
}

function getCommissionRateLabel(brandTerms = {}) {
  if (brandTerms?.commissionType === "Fixed") {
    const symbol = currencyList.find(
      (item) => item.code === brandTerms?.currency,
    )?.symbol;
    const amountLabel = symbol
      ? `${symbol}${formatSettlementNumber(brandTerms?.commissionValue || 0)}`
      : formatSettlementNumber(brandTerms?.commissionValue || 0);

    return `${amountLabel} per voucher`;
  }

  return `${Number(brandTerms?.commissionValue || 0)}%`;
}

function buildDateRangeLabel(periodStart, periodEnd) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  const sameMonth = start.getMonth() === end.getMonth()
    && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "short",
    })} - ${end.getDate()} ${end.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })}`;
  }

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function buildInvoiceNumber(settlement) {
  const date = settlement?.paidAt || settlement?.lastPaymentDate || settlement?.updatedAt;
  const normalizedDate = new Date(date);
  const datePart = Number.isNaN(normalizedDate.getTime())
    ? "00000000"
    : `${normalizedDate.getFullYear()}${String(normalizedDate.getMonth() + 1).padStart(2, "0")}${String(normalizedDate.getDate()).padStart(2, "0")}`;
  const suffix = String(settlement?.id || "").slice(-6).toUpperCase();

  return `SET-${datePart}-${suffix || "INVOICE"}`;
}

function buildDocumentPayload({ settlement, brandTerms }) {
  const currency = settlement?.brand?.currency || brandTerms?.currency || "ZAR";
  const vatRate = Number(brandTerms?.vatRate ?? 15);
  const commissionAmount = roundSettlementAmount(settlement?.commissionAmount || 0);
  const vatAmount = roundSettlementAmount(settlement?.vatAmount || 0);
  const totalInvoiceAmount = roundSettlementAmount(commissionAmount + vatAmount);
  const netAmountPaid = roundSettlementAmount(settlement?.totalPaid || settlement?.netPayable || 0);
  const primaryContact = getPrimaryContact(settlement?.brand?.brandContacts || []);
  const frequency = settlement?.frequency
    || settlement?.brand?.brandBankings?.settlementFrequency
    || "monthly";
  const periodLabel = formatSettlementPeriodLabel(
    settlement?.periodStart,
    frequency,
    "en-GB",
  );
  const dateRange = buildDateRangeLabel(settlement?.periodStart, settlement?.periodEnd);

  return {
    currency,
    periodLabel,
    dateRange,
    company: DEFAULT_COMPANY,
    statement: {
      brandName: settlement?.brand?.brandName || "Brand",
      settlementPeriod: `${periodLabel}${dateRange ? ` (${dateRange})` : ""}`,
      settlementBasis:
        settlement?.brand?.brandTerms?.settlementTrigger === "onRedemption"
          ? "On Redemption"
          : "On Purchase",
      paymentDate: formatLongDate(settlement?.paidAt || settlement?.lastPaymentDate),
      paymentReference: settlement?.paymentReference || "",
      commissionRateLabel: getCommissionRateLabel(brandTerms),
      totalSalesValue: roundSettlementAmount(settlement?.totalSoldAmount || 0),
      totalGiftCardsSold: Number(settlement?.totalSold || 0),
      commissionAmount,
      vatAmount,
      netAmountPaid,
    },
    invoice: {
      invoiceNumber: buildInvoiceNumber(settlement),
      invoiceDate: formatLongDate(settlement?.paidAt || settlement?.lastPaymentDate),
      company: DEFAULT_COMPANY,
      client: {
        name: settlement?.brand?.brandName || "Brand",
        contactName: primaryContact?.name || "",
        email:
          settlement?.brand?.brandBankings?.remittanceEmail ||
          primaryContact?.email ||
          "",
        website: settlement?.brand?.website || "",
      },
      description: `Commission on Gift Card Sales for ${periodLabel || settlement?.settlementPeriod || "Settlement Period"}`,
      settlementPeriod: dateRange || settlement?.settlementPeriod || "",
      paymentReference: settlement?.paymentReference || "",
      vatRateLabel: `${vatRate}%`,
      commissionAmount,
      vatAmount,
      totalInvoiceAmount,
    },
    emailTemplateParams: {
      periodLabel,
      brandName: settlement?.brand?.brandName || "Brand",
      dateRange,
      totalSales: formatSettlementNumber(settlement?.totalSoldAmount || 0),
      commission: formatSettlementNumber(commissionAmount),
      vat: formatSettlementNumber(vatAmount),
      netPaid: formatSettlementNumber(netAmountPaid),
    },
  };
}

export function getSettlementNotificationRecipients(brand) {
  const primaryContact = getPrimaryContact(brand?.brandContacts || []);
  const recipients = [
    ...splitRecipientEmails(brand?.brandBankings?.remittanceEmail),
    primaryContact?.email?.trim(),
  ].filter(Boolean);

  return [...new Set(recipients)];
}

export function buildSettlementNotificationEmail({
  settlement,
  brandTerms,
}) {
  const payload = buildDocumentPayload({ settlement, brandTerms });
  const brandName = payload.emailTemplateParams.brandName;
  const periodLabel = payload.emailTemplateParams.periodLabel || "Settlement";
  const subject = `Settlement completed for ${brandName} - ${periodLabel}`;
  const text = [
    `Hello ${brandName},`,
    "",
    `Your settlement for ${periodLabel} has been processed.`,
    `Settlement period: ${payload.emailTemplateParams.dateRange || "N/A"}`,
    `Total sales: ${payload.emailTemplateParams.totalSales}`,
    `Commission: ${payload.emailTemplateParams.commission}`,
    `VAT: ${payload.emailTemplateParams.vat}`,
    `Net paid: ${payload.emailTemplateParams.netPaid}`,
    "",
    "The settlement statement and commission invoice are attached.",
  ].join("\n");
  const html = `
    <p>Hello ${brandName},</p>
    <p>Your settlement for <strong>${periodLabel}</strong> has been processed.</p>
    <ul>
      <li>Settlement period: ${payload.emailTemplateParams.dateRange || "N/A"}</li>
      <li>Total sales: ${payload.emailTemplateParams.totalSales}</li>
      <li>Commission: ${payload.emailTemplateParams.commission}</li>
      <li>VAT: ${payload.emailTemplateParams.vat}</li>
      <li>Net paid: ${payload.emailTemplateParams.netPaid}</li>
    </ul>
    <p>The settlement statement and commission invoice are attached for your records.</p>
  `;

  return {
    ...payload,
    subject,
    text,
    html,
  };
}

export async function generateSettlementNotificationAttachments({
  settlement,
  brandTerms,
}) {
  const payload = buildDocumentPayload({ settlement, brandTerms });
  const statementStream = await renderToStream(
    React.createElement(SettlementStatementPDF, {
      statement: {
        ...payload.statement,
        money: (amount) => formatDocumentMoney(amount, payload.currency),
      },
    }),
  );
  const invoiceStream = await renderToStream(
    React.createElement(CommissionInvoicePDF, {
      invoice: {
        ...payload.invoice,
        money: (amount) => formatDocumentMoney(amount, payload.currency),
      },
    }),
  );
  const safeBrand = (settlement?.brand?.brandName || "brand")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safePeriod = (payload.periodLabel || "settlement")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return [
    {
      filename: `${safeBrand}-settlement-statement-${safePeriod}.pdf`,
      content: await streamToBuffer(statementStream),
    },
    {
      filename: `${safeBrand}-commission-invoice-${safePeriod}.pdf`,
      content: await streamToBuffer(invoiceStream),
    },
  ];
}
