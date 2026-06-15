CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
  'order_number_seq',
  COALESCE(
    (
      SELECT GREATEST(
        COALESCE(MAX((regexp_match("orderNumber", '^ORD-(\d+)$'))[1]::bigint), 0),
        COUNT(*)::bigint
      ) + 1
      FROM "Order"
    ),
    1
  ),
  false
);

CREATE SEQUENCE IF NOT EXISTS bulk_order_number_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
  'bulk_order_number_seq',
  COALESCE(
    (
      SELECT GREATEST(
        COALESCE(MAX((regexp_match("bulkOrderNumber", '^BULK-(\d+)$'))[1]::bigint), 0),
        COUNT("bulkOrderNumber")::bigint
      ) + 1
      FROM "Order"
    ),
    1
  ),
  false
);
