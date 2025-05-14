-- Disable the update_running_balance trigger if it exists
DROP TRIGGER IF EXISTS update_running_balance ON transactions;

-- Disable any other triggers on the transactions table that might be causing issues
DO $$
DECLARE
  trigger_name text;
BEGIN
  FOR trigger_name IN (
    SELECT tgname FROM pg_trigger
    JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
    WHERE pg_class.relname = 'transactions'
  )
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON transactions';
  END LOOP;
END $$;

-- Alter the transactions table to make running_balance nullable if it's not already
ALTER TABLE transactions ALTER COLUMN running_balance DROP NOT NULL;
