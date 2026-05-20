import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import InvoicePDF from "../../components/InvoicePDF.jsx";
import { getServiceFeeBreakdown } from "../promo/promoPricing.js";
import { currencyList } from "../../components/brandsPartner/currency.js";

const DEFAULT_COMPANY = {
  legalName:
    process.env.NEXT_INVOICE_COMPANY_NAME || "My Perks (Pty) Ltd",
  tradingName:
    process.env.NEXT_INVOICE_TRADING_NAME || "Wove Gifts",
  address:
    process.env.NEXT_INVOICE_COMPANY_ADDRESS ||
    "8 Vineyard Road, Claremont, Cape Town, South Africa",
  email:
    process.env.NEXT_SUPPORT_EMAIL ||
    process.env.NEXT_BREVO_SENDER_EMAIL ||
    "hello@wovegifts.com",
  website:
    process.env.NEXT_PUBLIC_SITE_URL || "https://wovegifts.com",
};

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPaymentMethod(value) {
  if (!value) return "Unknown";

  const normalized = String(value).replace(/_/g, " ").trim();
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildRecipientLines(order) {
  if (Array.isArray(order.bulkRecipients) && order.bulkRecipients.length > 0) {
    return order.bulkRecipients.map((recipient, index) => {
      const contact = [recipient.recipientEmail, recipient.recipientPhone]
        .filter(Boolean)
        .join(" / ");
      return `${index + 1}. ${recipient.recipientName || "Recipient"}${
        contact ? ` - ${contact}` : ""
      }`;
    });
  }

  if (!order.receiverDetail) return [];

  const contact = [order.receiverDetail.email, order.receiverDetail.phone]
    .filter(Boolean)
    .join(" / ");

  return [
    `${order.receiverDetail.name || "Recipient"}${contact ? ` - ${contact}` : ""}`,
  ];
}

function buildInvoicePayload(order, selectedSubCategory) {
  const serviceFeeBreakdown = getServiceFeeBreakdown(order.serviceFee || 0);
  const voucherType =
    selectedSubCategory?.name || order.occasion?.name || "Gift Voucher";
  const brandName = order.brand?.brandName || "Gift Card";
  const currencySymbol =
    currencyList.find((currency) => currency.code === order.currency)?.symbol ||
    order.currency ||
    "R";

  return {
    orderNumber: order.orderNumber || "",
    purchaseDate: formatDate(order.paidAt || order.createdAt),
    customerName: order.senderName || "Customer",
    customerEmail: order.senderEmail || "",
    recipientLines: buildRecipientLines(order),
    itemDescription: `${brandName} - ${voucherType}`,
    quantity: order.quantity || 1,
    currency: currencySymbol,
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    serviceFeeExVat: serviceFeeBreakdown.serviceFeeExVat,
    serviceFeeVat: serviceFeeBreakdown.serviceFeeVat,
    totalServiceFee: Number(order.serviceFee || 0),
    totalPaid: Number(order.totalAmount || 0),
    paymentMethod: formatPaymentMethod(order.paymentMethod),
    company: DEFAULT_COMPANY,
  };
}

async function streamToBuffer(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function generateInvoiceAttachment(order, selectedSubCategory) {
  const invoice = buildInvoicePayload(order, selectedSubCategory);

  const stream = await renderToStream(
    React.createElement(InvoicePDF, { invoice })
  );

  return {
    filename: `invoice-${order.orderNumber || order.id}.pdf`,
    content: await streamToBuffer(stream),
    invoice,
  };
}
