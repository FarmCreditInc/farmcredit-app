-- Create a function to safely update wallet balance and create a transaction without triggering stack depth issues
CREATE OR REPLACE FUNCTION safe_wallet_transaction(
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
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Update wallet balance directly
  UPDATE wallets
  SET 
    balance = v_new_balance,
    updated_at = NOW()
  WHERE id = p_wallet_id;
  
  -- Generate a new UUID for the transaction
  v_transaction_id := gen_random_uuid();
  
  -- Insert transaction record directly using plain SQL to avoid triggers
  INSERT INTO transactions (
    id,
    wallet_id,
    type,
    amount,
    purpose,
    reference,
    running_balance,
    status,
    created_at
  ) VALUES (
    v_transaction_id,
    p_wallet_id,
    p_type,
    p_amount,
    p_purpose,
    p_reference,
    v_new_balance,
    p_status,
    NOW()
  );
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
