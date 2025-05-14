-- Create a function to calculate running balance for transactions
CREATE OR REPLACE FUNCTION calculate_running_balance(wallet_id_param UUID)
RETURNS void AS $$
BEGIN
  -- Use a CTE to calculate running balance
  WITH ordered_transactions AS (
    SELECT
      id,
      wallet_id,
      amount,
      type,
      created_at,
      SUM(
        CASE 
          WHEN type IN ('credit', 'loan_repayment') THEN amount
          WHEN type IN ('debit', 'fee', 'withdrawal', 'loan_funding') THEN -amount
          ELSE 0
        END
      ) OVER (
        PARTITION BY wallet_id
        ORDER BY created_at, id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS calculated_running_balance
    FROM transactions
    WHERE wallet_id = wallet_id_param AND status = 'successful'
  )
  -- Update the transactions with calculated running balance
  UPDATE transactions t
  SET running_balance = o.calculated_running_balance
  FROM ordered_transactions o
  WHERE t.id = o.id;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update running balance when a transaction is added
CREATE OR REPLACE FUNCTION trigger_update_running_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the function to recalculate running balance for the wallet
  PERFORM calculate_running_balance(NEW.wallet_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the transactions table
DROP TRIGGER IF EXISTS update_running_balance ON transactions;
CREATE TRIGGER update_running_balance
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_running_balance();
