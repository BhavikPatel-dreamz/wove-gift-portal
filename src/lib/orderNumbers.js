import { prisma } from "./db.js";

const ORDER_NUMBER_PADDING = 6;

function normalizeSequenceValue(value) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(value);
  }

  return BigInt(String(value));
}

function formatSequenceNumber(prefix, value) {
  return `${prefix}-${normalizeSequenceValue(value)
    .toString()
    .padStart(ORDER_NUMBER_PADDING, "0")}`;
}

export async function getNextOrderNumber(db = prisma) {
  const rows = await db.$queryRaw`
    SELECT nextval('order_number_seq')::bigint AS value
  `;

  return formatSequenceNumber("ORD", rows[0]?.value ?? 1);
}

export async function getNextBulkOrderNumber(db = prisma) {
  const rows = await db.$queryRaw`
    SELECT nextval('bulk_order_number_seq')::bigint AS value
  `;

  return formatSequenceNumber("BULK", rows[0]?.value ?? 1);
}
