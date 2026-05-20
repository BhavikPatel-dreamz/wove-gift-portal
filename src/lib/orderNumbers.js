import { prisma } from "./db.js";

const ORDER_NUMBER_PADDING = 6;
const ORDER_NUMBER_SEQUENCE = {
  advisoryLockKey: 41001,
  columnName: "orderNumber",
  prefix: "ORD",
  sequenceName: "order_number_seq",
};
const BULK_ORDER_NUMBER_SEQUENCE = {
  advisoryLockKey: 41002,
  columnName: "bulkOrderNumber",
  prefix: "BULK",
  sequenceName: "bulk_order_number_seq",
};

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

async function getNextSequenceValue(
  db,
  { advisoryLockKey, columnName, prefix, sequenceName }
) {
  const regexPattern = `^${prefix}-(\\d+)$`;

  return db.$transaction(async (tx) => {
    // Self-heal missing sequences in environments where migrations were skipped.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${advisoryLockKey})`;

    await tx.$executeRawUnsafe(`
      CREATE SEQUENCE IF NOT EXISTS "${sequenceName}"
      START WITH 1
      INCREMENT BY 1
    `);

    await tx.$executeRawUnsafe(`
      WITH sequence_state AS (
        SELECT CASE WHEN is_called THEN last_value ELSE 0 END AS current_value
        FROM "${sequenceName}"
      ),
      existing_rows AS (
        SELECT COALESCE(
          MAX((regexp_match("${columnName}", '${regexPattern}'))[1]::bigint),
          0
        ) AS max_existing
        FROM "Order"
        WHERE "${columnName}" IS NOT NULL
          AND "${columnName}" ~ '${regexPattern}'
      ),
      target AS (
        SELECT GREATEST(sequence_state.current_value, existing_rows.max_existing) AS value
        FROM sequence_state, existing_rows
      )
      SELECT setval(
        '${sequenceName}',
        CASE WHEN value > 0 THEN value ELSE 1 END,
        value > 0
      )
      FROM target
    `);

    const rows = await tx.$queryRawUnsafe(`
      SELECT nextval('${sequenceName}')::bigint AS value
    `);

    return rows[0]?.value ?? 1;
  });
}

export async function getNextOrderNumber(db = prisma) {
  const value = await getNextSequenceValue(db, ORDER_NUMBER_SEQUENCE);

  return formatSequenceNumber("ORD", value);
}

export async function getNextBulkOrderNumber(db = prisma) {
  const value = await getNextSequenceValue(db, BULK_ORDER_NUMBER_SEQUENCE);

  return formatSequenceNumber("BULK", value);
}
