-- Create a function to update wallet balance and create a transaction without calculating running balance
CREATE OR REPLACE FUNCTION simple_wallet_transaction(
  p_wallet_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_purpose TEXT,
  p_reference TEXT,
  p_status TEXT DEFAULT 'successful'
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Lock the wallet row to prevent concurrent updates
  SELECT balance INTO v_current_balance
  FROM wallets
  WHERE id = p_wallet_id
  FOR UPDATE;
  
  -- Calculate new balance based on transaction type
  IF p_type IN ('credit', 'repayment') THEN
    v_new_balance := v_current_balance + ABS(p_amount);
  ELSE
    v_new_balance := v_current_balance - ABS(p_amount);
  END IF;
  
  -- Update wallet balance directly
  UPDATE wallets
  SET 
    balance = v_new_balance,
    updated_at = NOW()
  WHERE id = p_wallet_id;
  
  -- Generate a new UUID for the transaction
  v_transaction_id := gen_random_uuid();
  
  -- Insert transaction record WITHOUT setting running_balance
  INSERT INTO transactions (
    id,
    wallet_id,
    type,
    amount,
    purpose,
    reference,
    status,
    created_at
  ) VALUES (
    v_transaction_id,
    p_wallet_id,
    p_type,
    ABS(p_amount),
    p_purpose,
    p_reference,
    p_status,
    NOW()
  );
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
