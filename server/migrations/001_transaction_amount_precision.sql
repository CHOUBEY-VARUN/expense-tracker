-- Run before deploying code that accepts amounts up to 999999999999.99.
-- NUMERIC stores exact decimal values; this widens existing constrained columns
-- while preserving current values. The transaction aborts if existing data
-- cannot fit the new precision and scale.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM transactions
    WHERE amount <> round(amount, 2)
       OR amount >= 1000000000000
       OR amount <= -1000000000000
  ) THEN
    RAISE EXCEPTION 'Existing transaction amounts need review before conversion to NUMERIC(14, 2)';
  END IF;
END $$;

ALTER TABLE transactions
  ALTER COLUMN amount TYPE NUMERIC(14, 2)
  USING amount::NUMERIC(14, 2);

COMMIT;
